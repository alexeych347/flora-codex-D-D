import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { HerbOrStub, Herb, Player, RARITY, RARITY_LABELS, RARITY_COLORS, Rarity } from '../types';
import { herbsApi, authApi, HerbPayload } from '../api/herbs';
import { PhotoCropModal } from './PhotoCropModal';

interface Props {
  herbs: HerbOrStub[];
  onClose: () => void;
  onLogout: () => void;
  onRefresh: () => void;
}

interface HerbForm {
  id?: string;
  name?: string;
  imageUrl?: string | null;
  rarity?: Rarity;
  description?: string;
  properties?: string[];
  effects?: string;
  access?: string[];
}

const EMPTY_FORM: HerbForm = {
  name: '', rarity: 'COMMON', description: '', properties: [], effects: '', access: [],
};

// DM (мастер) всегда получает полные данные трав с сервера, включая access[].
function asDMHerb(herb: HerbOrStub): Herb {
  return herb as unknown as Herb;
}

function Toggle({ on, onClick, title }: { on: boolean; onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title} style={{
      flexShrink: 0, width: 40, height: 21, borderRadius: 999, position: 'relative',
      background: on ? 'var(--gold-muted)' : '#33240f',
      border: `1px solid ${on ? 'rgba(184,134,11,.7)' : 'rgba(184,134,11,.35)'}`,
      cursor: 'pointer', transition: 'background .15s',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 21 : 2,
        width: 15, height: 15, borderRadius: '50%',
        background: on ? 'var(--ink)' : '#7a6a4a', transition: 'left .18s',
      }} />
    </button>
  );
}

export function DMPanel({ herbs, onClose, onLogout, onRefresh }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState<HerbForm | null>(null);
  const [propertiesInput, setPropertiesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formFileRef = useRef<HTMLInputElement>(null);
  const pendingHerbId = useRef<string | null>(null);
  const [crop, setCrop] = useState<{ src: string; onApply: (blob: Blob) => void } | null>(null);

  useEffect(() => {
    authApi.getPlayers().then(p => setPlayers(p.filter(x => x.role === 'PLAYER'))).catch(() => setPlayers([]));
  }, []);

  const readToCrop = (file: File, onApply: (blob: Blob) => void) => {
    const reader = new FileReader();
    reader.onload = ev => setCrop({ src: ev.target!.result as string, onApply });
    reader.readAsDataURL(file);
  };

  const handlePhotoClick = (herbId: string) => { pendingHerbId.current = herbId; fileInputRef.current?.click(); };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const id = pendingHerbId.current;
    readToCrop(file, async (blob) => {
      if (id) {
        await herbsApi.uploadImage(id, blob);
        await onRefresh();
      }
      setCrop(null);
    });
  };

  const handleFormFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    readToCrop(file, (blob) => {
      const url = URL.createObjectURL(blob);
      setForm(f => (f ? { ...f, imageUrl: url } : f));
      pendingFormBlob.current = blob;
      setCrop(null);
    });
  };
  const pendingFormBlob = useRef<Blob | null>(null);

  const startCreate = () => {
    setForm({ ...EMPTY_FORM });
    setPropertiesInput('');
    pendingFormBlob.current = null;
  };
  const startEdit = (herb: HerbOrStub) => {
    const h = asDMHerb(herb);
    setForm({
      id: h.id, name: h.name, imageUrl: h.imageUrl, rarity: h.rarity,
      description: h.description, properties: h.properties, effects: h.effects,
      access: h.access || [],
    });
    setPropertiesInput((h.properties || []).join(', '));
    pendingFormBlob.current = null;
  };

  const handleToggleAccess = async (herbId: string, playerId: string, currentlyOn: boolean) => {
    const key = `${herbId}:${playerId}`;
    setTogglingKey(key);
    try {
      await herbsApi.setAccess(herbId, playerId, !currentlyOn);
      await onRefresh();
    } finally {
      setTogglingKey(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить «${name || 'траву'}»?`)) return;
    try {
      await herbsApi.delete(id);
      await onRefresh();
    } catch {
      alert('Ошибка удаления');
    }
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const data: HerbPayload = {
        name: form.name,
        latinName: '',
        rarity: form.rarity,
        description: form.description,
        effects: form.effects,
        properties: propertiesInput.split(',').map(p => p.trim()).filter(Boolean),
      };
      let saved: Herb;
      if (form.id) {
        saved = await herbsApi.update(form.id, data);
      } else {
        saved = await herbsApi.create(data);
      }
      if (pendingFormBlob.current) {
        await herbsApi.uploadImage(saved.id, pendingFormBlob.current);
      }
      if (!form.id && form.access?.length) {
        for (const playerId of form.access) {
          await herbsApi.setAccess(saved.id, playerId, true);
        }
      } else if (form.id) {
        const before = asDMHerb(herbs.find(h => h.id === form.id) || herbs[0]).access || [];
        const after = form.access || [];
        for (const playerId of players.map(p => p.id)) {
          const was = before.includes(playerId), now = after.includes(playerId);
          if (was !== now) await herbsApi.setAccess(saved.id, playerId, now);
        }
      }
      await onRefresh();
      setForm(null);
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 11px', fontSize: 15,
    color: 'var(--birch)', background: '#241608',
    border: '1px solid rgba(184,134,11,.25)', outline: 'none',
    fontFamily: "'Istok Web',sans-serif",
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, color: 'var(--gold-muted)', opacity: .8,
    marginBottom: 5, fontFamily: "'Cormorant SC',serif", letterSpacing: '.08em',
  };

  return (
    <div className="panel-in" style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      zIndex: 190, width: 380,
      display: 'flex', flexDirection: 'column',
      background: '#140d04',
      borderLeft: '1px solid rgba(184,134,11,.3)',
      boxShadow: '-12px 0 40px rgba(0,0,0,.6)',
      color: 'var(--gold-muted)',
    }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      {crop && <PhotoCropModal src={crop.src} onApply={crop.onApply} onCancel={() => setCrop(null)} />}

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid rgba(184,134,11,.18)' }}>
        <h2 className="f-philosopher" style={{ fontSize: 21, fontWeight: 700 }}>Панель Мастера</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onLogout} className="f-body" style={{ fontSize: 12, background: 'none', border: '1px solid rgba(184,134,11,.3)', color: 'var(--gold-muted)', padding: '4px 9px', cursor: 'pointer' }}>Выйти</button>
          <button onClick={onClose} style={{ fontSize: 18, padding: '0 4px', background: 'none', border: 'none', color: 'var(--birch)', opacity: .45, cursor: 'pointer' }}>✕</button>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '9px 18px', borderBottom: '1px solid rgba(184,134,11,.12)', background: 'rgba(184,134,11,.05)' }}>
        <p className="f-italic" style={{ fontSize: 13.5, opacity: .62, lineHeight: 1.4 }}>
          Отмечайте, каким персонажам открыта каждая трава.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {herbs.map(herb => {
          const h = asDMHerb(herb);
          const rarityColor = RARITY_COLORS[h.rarity];
          const access = h.access || [];
          const openCount = access.length;
          return (
            <div key={h.id} style={{ padding: '12px 16px 14px', borderBottom: '1px solid rgba(184,134,11,.1)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="10" height="13" viewBox="0 0 12 15" style={{ flexShrink: 0 }}>
                  <path d="M6,0 l6,7.5 l-6,7.5 l-6,-7.5 Z" fill={rarityColor} />
                </svg>
                <span className="f-philosopher" style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--birch)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name || 'Без названия'}</span>
                <span className="f-italic" style={{ fontSize: 12.5, opacity: .5, flexShrink: 0 }}>{openCount}/{players.length}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 12px' }}>
                {players.map(p => {
                  const on = access.includes(p.id);
                  const key = `${h.id}:${p.id}`;
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Toggle on={on} title={on ? 'Скрыть' : 'Открыть'}
                        onClick={() => togglingKey !== key && handleToggleAccess(h.id, p.id, on)} />
                      <span className="f-body" style={{ fontSize: 13.5, color: on ? 'var(--birch)' : 'rgba(245,240,232,.45)' }}>{p.name}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => startEdit(herb)} className="f-body" style={{ fontSize: 12, padding: '4px 11px', background: 'none', border: '1px solid rgba(184,134,11,.3)', color: 'var(--gold-muted)', cursor: 'pointer' }}>Ред.</button>
                <button onClick={() => handlePhotoClick(h.id)} className="f-body" style={{
                  fontSize: 12, padding: '4px 11px', display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: h.imageUrl ? 'rgba(184,134,11,.18)' : 'none',
                  border: '1px solid rgba(184,134,11,.4)',
                  color: h.imageUrl ? 'var(--gold-muted)' : 'rgba(184,134,11,.7)', cursor: 'pointer',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  {h.imageUrl ? 'Фото ✓' : 'Фото'}
                </button>
                <button onClick={() => handleDelete(h.id, h.name)} className="f-body" style={{ fontSize: 12, padding: '4px 11px', marginLeft: 'auto', background: 'none', border: '1px solid rgba(192,57,43,.35)', color: '#cf5a4d', cursor: 'pointer' }}>Удал.</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flexShrink: 0, padding: '14px 18px', borderTop: '1px solid rgba(184,134,11,.2)' }}>
        <button onClick={startCreate} className="f-cormorant-sc" style={{ width: '100%', padding: 13, fontSize: 15, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, background: 'var(--gold-muted)', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}>✦ Добавить траву</button>
      </div>

      {form && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', background: '#140d04' }}>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid rgba(184,134,11,.2)' }}>
            <h3 className="f-philosopher" style={{ fontSize: 18, fontWeight: 700 }}>{form.id ? 'Редактировать' : 'Новая трава'}</h3>
            <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', color: 'var(--birch)', opacity: .45, fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input ref={formFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFormFile} />
            <div>
              <label style={labelStyle}>Изображение растения</label>
              <div style={{ display: 'flex', gap: 13, alignItems: 'stretch' }}>
                <div style={{ width: 84, height: 84, flexShrink: 0, background: form.imageUrl ? '#000' : 'rgba(184,134,11,.06)', border: '1px solid rgba(184,134,11,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {form.imageUrl
                    ? <img src={form.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(184,134,11,.5)" strokeWidth="1.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
                  <button type="button" onClick={() => formFileRef.current?.click()} className="f-cormorant-sc" style={{ padding: '9px 12px', fontSize: 13, letterSpacing: '.08em', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center', background: 'var(--gold-muted)', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}>{form.imageUrl ? 'Заменить фото' : 'Загрузить фото'}</button>
                  {form.imageUrl && (
                    <button type="button" onClick={() => { setForm(f => f && ({ ...f, imageUrl: '' })); pendingFormBlob.current = null; }} className="f-body" style={{ padding: '6px 12px', fontSize: 12, background: 'none', border: '1px solid rgba(192,57,43,.4)', color: '#cf5a4d', cursor: 'pointer' }}>Убрать</button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Название</label>
              <input style={inputStyle} value={form.name || ''} onChange={e => setForm(f => f && ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Редкость</label>
              <select style={inputStyle} value={form.rarity} onChange={e => setForm(f => f && ({ ...f, rarity: e.target.value as Rarity }))}>
                {RARITY.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Описание</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => f && ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Свойства (через запятую)</label>
              <input style={inputStyle} value={propertiesInput} onChange={e => setPropertiesInput(e.target.value)} placeholder="Лечебная, Ядовитая…" />
            </div>
            <div>
              <label style={labelStyle}>Эффекты</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.effects || ''} onChange={e => setForm(f => f && ({ ...f, effects: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Доступ персонажам</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginTop: 3 }}>
                {players.map(p => {
                  const on = !!form.access?.includes(p.id);
                  return (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={on}
                        onChange={e => setForm(f => f && ({
                          ...f,
                          access: e.target.checked
                            ? [...(f.access || []), p.id]
                            : (f.access || []).filter(id => id !== p.id),
                        }))}
                        style={{ width: 17, height: 17, accentColor: 'var(--gold-muted)' }} />
                      <span className="f-body" style={{ fontSize: 14, color: 'var(--birch)', opacity: .85 }}>{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ flexShrink: 0, display: 'flex', gap: 12, padding: '14px 18px', borderTop: '1px solid rgba(184,134,11,.2)' }}>
            <button onClick={() => setForm(null)} className="f-cormorant-sc" style={{ flex: 1, padding: 12, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, background: 'none', border: '1.5px solid rgba(184,134,11,.35)', color: 'var(--gold-muted)', opacity: .75, cursor: 'pointer' }}>Отмена</button>
            <button onClick={save} disabled={saving} className="f-cormorant-sc" style={{ flex: 1, padding: 12, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, background: 'var(--gold-muted)', border: 'none', color: 'var(--ink)', cursor: 'pointer', opacity: saving ? .5 : 1 }}>{saving ? '…' : 'Сохранить'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
