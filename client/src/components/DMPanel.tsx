import { useState, useRef, ChangeEvent } from 'react';
import { HerbOrStub, Herb, RARITY_LABELS, Rarity } from '../types';
import { herbsApi, HerbPayload } from '../api/herbs';

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
  isUnlocked?: boolean;
}

const EMPTY_FORM: HerbForm = {
  name: '',
  rarity: 'COMMON',
  description: '',
  properties: [],
  effects: '',
  isUnlocked: false,
};

// DM always receives full herb data from server (JWT auth), including locked herbs.
// Safe to cast HerbOrStub → Herb in DM panel context.
function asDMHerb(herb: HerbOrStub): Herb {
  return herb as unknown as Herb;
}

export function DMPanel({ herbs, onClose, onLogout, onRefresh }: Props) {
  const [editingHerb, setEditingHerb] = useState<HerbForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [propertiesInput, setPropertiesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const startCreate = () => {
    setEditingId(null);
    setEditingHerb({ ...EMPTY_FORM });
    setPropertiesInput('');
    setShowForm(true);
  };

  const startEdit = (herb: HerbOrStub) => {
    const h = asDMHerb(herb);
    setEditingId(h.id);
    setEditingHerb({
      name: h.name,
      imageUrl: h.imageUrl,
      rarity: h.rarity,
      description: h.description,
      properties: h.properties,
      effects: h.effects,
      isUnlocked: h.isUnlocked,
    });
    setPropertiesInput((h.properties || []).join(', '));
    setShowForm(true);
  };

  const handleToggleUnlock = async (id: string) => {
    setTogglingId(id);
    try {
      await herbsApi.toggleUnlock(id);
      await onRefresh();
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить траву "${name}"? Это действие необратимо.`)) return;
    try {
      await herbsApi.delete(id);
      await onRefresh();
    } catch {
      alert('Ошибка удаления');
    }
  };

  const handleSave = async () => {
    if (!editingHerb) return;
    setSaving(true);
    try {
      const data: HerbPayload = {
        ...editingHerb,
        latinName: '',
        properties: propertiesInput.split(',').map(p => p.trim()).filter(Boolean),
      };
      if (editingId) {
        await herbsApi.update(editingId, data);
      } else {
        await herbsApi.create(data);
      }
      await onRefresh();
      setShowForm(false);
      setEditingHerb(null);
      setEditingId(null);
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (herbId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(herbId);
    try {
      await herbsApi.uploadImage(herbId, file);
      await onRefresh();
    } catch {
      alert('Ошибка загрузки изображения');
    } finally {
      setUploadingId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-40 w-80 flex flex-col overflow-hidden"
      style={{
        background: '#1C1208',
        borderLeft: '1px solid #C9A84C30',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #C9A84C20' }}
      >
        <h2 className="font-cinzel text-sm tracking-wide" style={{ color: '#C9A84C' }}>
          Панель DM
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onLogout}
            className="font-garamond text-xs px-2 py-1 transition-opacity hover:opacity-80"
            style={{ color: '#C9A84C', border: '1px solid #C9A84C30' }}
          >
            Выйти
          </button>
          <button
            onClick={onClose}
            className="font-garamond text-xs px-2 py-1"
            style={{ color: '#F4E4BC', opacity: 0.5 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Herb list */}
      <div className="flex-1 overflow-y-auto py-2">
        {herbs.map(herb => {
          const h = asDMHerb(herb);
          const id = herb.id;
          const name = h.name || 'Без названия';
          const unlocked = herb.isUnlocked;

          return (
            <div
              key={id}
              className="herb-row flex flex-col gap-1 px-4 py-2"
              style={{ borderBottom: '1px solid #C9A84C10' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-garamond text-sm flex-1 truncate"
                  style={{ color: unlocked ? '#F4E4BC' : '#F4E4BC80' }}
                >
                  {name}
                  {!unlocked && (
                    <span className="ml-1 font-garamond italic" style={{ color: '#C9A84C60', fontSize: '11px' }}>
                      (не изучено)
                    </span>
                  )}
                </span>

                {/* Toggle */}
                <button
                  onClick={() => handleToggleUnlock(id)}
                  disabled={togglingId === id}
                  className="toggle-btn flex-shrink-0 w-10 h-5 rounded-full transition-all duration-200"
                  style={{
                    background: unlocked ? '#C9A84C' : '#3D2B1F',
                    border: '1px solid #C9A84C40',
                    position: 'relative',
                  }}
                >
                  <div
                    className="toggle-thumb absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                    style={{
                      background: unlocked ? '#1C1208' : '#8A9B8A',
                      left: unlocked ? '22px' : '1px',
                    }}
                  />
                </button>
              </div>

              {/* Always show Edit/Photo/Delete in DM panel — DM has full access */}
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(herb)}
                  className="font-garamond text-xs px-2 py-0.5 transition-opacity hover:opacity-80"
                  style={{ color: '#C9A84C', border: '1px solid #C9A84C30', fontSize: '11px' }}
                >
                  Ред.
                </button>
                <label
                  className="font-garamond text-xs px-2 py-0.5 cursor-pointer transition-opacity hover:opacity-80"
                  style={{ color: '#C9A84C', border: '1px solid #C9A84C30', fontSize: '11px' }}
                >
                  {uploadingId === id ? '...' : 'Фото'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageUpload(id, e)}
                  />
                </label>
                <button
                  onClick={() => handleDelete(id, name)}
                  className="font-garamond text-xs px-2 py-0.5 transition-opacity hover:opacity-80 ml-auto"
                  style={{ color: '#c0392b', border: '1px solid #c0392b30', fontSize: '11px' }}
                >
                  Удал.
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #C9A84C20' }}>
        <button
          onClick={startCreate}
          className="w-full py-2 font-cinzel text-xs tracking-widest transition-all hover:opacity-90"
          style={{ background: '#C9A84C', color: '#1C1208' }}
        >
          + Добавить траву
        </button>
      </div>

      {/* Form overlay */}
      {showForm && editingHerb && (
        <div
          className="absolute inset-0 z-50 flex flex-col overflow-hidden"
          style={{ background: '#1C1208' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid #C9A84C20' }}
          >
            <h3 className="font-cinzel text-xs tracking-wide" style={{ color: '#C9A84C' }}>
              {editingId ? 'Редактировать' : 'Новая трава'}
            </h3>
            <button
              onClick={() => { setShowForm(false); setEditingHerb(null); }}
              className="font-garamond text-xs"
              style={{ color: '#F4E4BC', opacity: 0.5 }}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Name */}
            <div>
              <label className="block font-garamond text-xs mb-1" style={{ color: '#C9A84C', opacity: 0.7 }}>
                Название
              </label>
              <input
                type="text"
                value={editingHerb.name ?? ''}
                onChange={e => setEditingHerb(h => ({ ...h!, name: e.target.value }))}
                className="w-full px-3 py-1.5 font-garamond text-sm focus:outline-none"
                style={{ background: '#2D1810', border: '1px solid #C9A84C20', color: '#F4E4BC' }}
              />
            </div>

            {/* Rarity */}
            <div>
              <label className="block font-garamond text-xs mb-1" style={{ color: '#C9A84C', opacity: 0.7 }}>
                Редкость
              </label>
              <select
                value={editingHerb.rarity || 'COMMON'}
                onChange={e => setEditingHerb(h => ({ ...h!, rarity: e.target.value as Rarity }))}
                className="w-full px-3 py-1.5 font-garamond text-sm focus:outline-none"
                style={{ background: '#2D1810', border: '1px solid #C9A84C20', color: '#F4E4BC' }}
              >
                {(Object.entries(RARITY_LABELS) as [Rarity, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block font-garamond text-xs mb-1" style={{ color: '#C9A84C', opacity: 0.7 }}>
                Описание
              </label>
              <textarea
                value={editingHerb.description || ''}
                onChange={e => setEditingHerb(h => ({ ...h!, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-1.5 font-garamond text-sm focus:outline-none resize-none"
                style={{ background: '#2D1810', border: '1px solid #C9A84C20', color: '#F4E4BC' }}
              />
            </div>

            {/* Properties */}
            <div>
              <label className="block font-garamond text-xs mb-1" style={{ color: '#C9A84C', opacity: 0.7 }}>
                Свойства (через запятую)
              </label>
              <input
                type="text"
                value={propertiesInput}
                onChange={e => setPropertiesInput(e.target.value)}
                placeholder="Лечебная, Ядовитая..."
                className="w-full px-3 py-1.5 font-garamond text-sm focus:outline-none"
                style={{ background: '#2D1810', border: '1px solid #C9A84C20', color: '#F4E4BC' }}
              />
            </div>

            {/* Effects */}
            <div>
              <label className="block font-garamond text-xs mb-1" style={{ color: '#C9A84C', opacity: 0.7 }}>
                Эффекты D&D
              </label>
              <textarea
                value={editingHerb.effects || ''}
                onChange={e => setEditingHerb(h => ({ ...h!, effects: e.target.value }))}
                rows={3}
                className="w-full px-3 py-1.5 font-garamond text-sm focus:outline-none resize-none"
                style={{ background: '#2D1810', border: '1px solid #C9A84C20', color: '#F4E4BC' }}
              />
            </div>

            {/* Unlocked checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingHerb.isUnlocked || false}
                onChange={e => setEditingHerb(h => ({ ...h!, isUnlocked: e.target.checked }))}
                className="w-4 h-4"
                style={{ accentColor: '#C9A84C' }}
              />
              <span className="font-garamond text-sm" style={{ color: '#F4E4BC', opacity: 0.7 }}>
                Разблокирована для игроков
              </span>
            </label>
          </div>

          <div className="flex-shrink-0 p-4 flex gap-2" style={{ borderTop: '1px solid #C9A84C20' }}>
            <button
              onClick={() => { setShowForm(false); setEditingHerb(null); }}
              className="flex-1 py-2 font-garamond text-sm transition-opacity"
              style={{ border: '1px solid #C9A84C30', color: '#C9A84C', opacity: 0.6 }}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 font-cinzel text-xs tracking-wider disabled:opacity-40"
              style={{ background: '#C9A84C', color: '#1C1208' }}
            >
              {saving ? '...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
