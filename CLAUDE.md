# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Flora Codex** — интерактивный справочник трав для D&D кампании в виде магической книги с перелистыванием страниц. Монорепозиторий с двумя независимыми пакетами: `client/` и `server/`.

## Commands

### Server (порт 3001)

```bash
cd server
npm install
npm run dev          # ts-node-dev с hot reload
npm run build        # tsc → dist/
npm start            # node dist/server.js

# База данных (нужен запущенный PostgreSQL)
npx prisma migrate dev --name <name>   # создать и применить новую миграцию
npx prisma migrate deploy              # применить существующие (prod)
npx prisma generate                    # регенерировать клиент после изменений схемы
npm run seed                           # заполнить тестовыми данными
npx prisma studio                      # GUI для БД
```

### Client (порт 5173)

```bash
cd client
npm install
npm run dev          # Vite dev server
npm run build        # tsc + vite build → dist/
npm run preview      # предпросмотр production-сборки
```

### TypeScript-проверка (без сборки)

```bash
cd server && node_modules/.bin/tsc --noEmit
cd client && node_modules/.bin/tsc --noEmit
```

> `npx tsc` не работает на этой машине из-за конфликта PATH — использовать локальный бинарник.

## Окружение (локальная разработка)

**PostgreSQL локально не установлен.** Бэкенд без базы не поднимается, поэтому проверять вёрстку через реальный `GET /api/herbs` нельзя — вместо этого ответ API мокается в браузере.

### Порядок запуска dev-сервера

```bash
cd client && npm run dev     # → http://127.0.0.1:5173/
```

`server.host = '127.0.0.1'` зафиксирован в `vite.config.ts`, поэтому Vite печатает и слушает именно `127.0.0.1` — Playwright открывает адрес без дополнительных флагов. Сервер на :3001 для проверки вёрстки запускать не нужно: запросы на `/api/*` перехватываются моком раньше, чем до прокси доходит дело.

### Мок `GET /api/herbs` через Playwright

Клиент ходит в API через axios (XHR), поэтому патчить `window.fetch` бесполезно — нужен перехват на уровне Playwright. Маршрут регистрируется **до** `page.goto`, одним вызовом `browser_run_code_unsafe`:

```js
async (page) => {
  const RAR = ['COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE'];
  const herbs = Array.from({ length: 10 }, (_, i) => {
    const base = { id: `h${i}`, sortOrder: i, rarity: RAR[i % 4] };
    if (i % 3 === 2) return { ...base, isUnlocked: false };   // заглушка
    return {
      ...base,
      isUnlocked: true,
      name: `Трава ${i + 1}`,
      latinName: `Herba ${i + 1}`,
      imageUrl: null,
      discoveredAt: '2026-05-01',
      description: 'Описание травы для проверки вёрстки.',
      properties: ['свойство A', 'свойство B'],
      effects: 'Эффект для проверки вёрстки.',
    };
  });
  await page.route('**/api/herbs', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(herbs) })
  );
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
}
```

Детали:
- Без токена в `localStorage` `useAuth` не дёргает `/api/auth/verify`, так что для анонимного просмотра книги достаточно замокать один `GET /api/herbs`.
- Форма объектов — `Herb` / `LockedHerbStub` из `types/index.ts`; заглушка это ровно 4 поля (`id`, `isUnlocked: false`, `sortOrder`, `rarity`).
- 10 трав дают 2 разворота; на разворот идёт 8 трав.
- Кнопки перелистывания в `Book.tsx` без `aria-label` (`NavShield` с метками «Вперёд»/«Назад» из `ornaments.tsx` в книге не используется) — кликать по ним проще позиционно: «вперёд» это последняя `button` на странице.
- Скриншоты — `browser_take_screenshot` **без** `filename`, иначе файл упадёт в репозиторий; ширины 375 px и 1440 px.

## Architecture

### Data visibility pattern (критично)

Центральная бизнес-логика: **всё на бэкенде**, клиент не фильтрует.

Доступ к травам — **персональный**: 4 именованных игрока (Велимир, Мидсоммар, Лейв, Белогор) + мастер, каждый со своим логином (`Player.slug`) и паролем. Открытие травы конкретному игроку — отдельная строка `HerbAccess(herbId, playerId)`; присутствие строки = доступ открыт. Мастер видит всё всегда, без записей в `HerbAccess`.

- `GET /api/herbs` с JWT мастера → все поля всех трав + `access: string[]` (slug-и игроков с доступом)
- `GET /api/herbs` с JWT игрока → полные поля для трав с его `HerbAccess`, остальные — заглушка
- `GET /api/herbs` без токена → **все** травы как заглушки (анонимный посетитель не имеет персонального доступа, но видит книгу с закрытыми травами)
- Заглушка: `{ id, isUnlocked: false, sortOrder, rarity }` (4 поля)
- `middleware/auth.ts`: `optionalAuth` заполняет `req.player = { id, role } | null`; `authMiddleware` — требует валидный токен, иначе 401; `requireMaster` — дополнительно проверяет `role === 'MASTER'` (403 иначе)

Соответствующий discriminated union на клиенте (не изменился — контракт `isUnlocked: true/false` тот же, просто его теперь вычисляет сервер per-request с учётом личности игрока):
```ts
// types/index.ts
type HerbOrStub = Herb | LockedHerbStub
// Herb.isUnlocked === true (все поля, плюс access?: string[] только в ответах мастеру)
// LockedHerbStub.isUnlocked === false (4 поля)
isFullHerb(herb)  // type guard для сужения типа
```

`HerbPayload` (`api/herbs.ts`) не содержит `isUnlocked` — доступ меняется отдельным вызовом `herbsApi.setAccess(herbId, playerId, granted)` → `PATCH /api/herbs/:id/access` (только мастер).

### Book navigation model

`useBook(totalHerbs)` управляет навигацией по разворотам:
- `currentSpread = 0` → обложка (`CoverLeftPage`/`CoverRightPage` в `components/ui.tsx`). `GalleryIndex.tsx` существует в коде, но никуда не импортируется — мёртвый код, не используется.
- `currentSpread = 1..N` → развороты с травами (по 8 трав на разворот, 4 на каждой странице, `HerbGridPage` в `components/ui.tsx`)
- `direction: 1` (вперёд) / `-1` (назад) задаёт сторону слайда (`custom={direction}`)

Раскладка разворота (spread S > 0):
```
herbsStart = (S - 1) * 8
Левая страница:  herbs[herbsStart .. herbsStart+3]   (2×2 сетка)
Правая страница: herbs[herbsStart+4 .. herbsStart+7] (2×2 сетка)
```

Клик по траве в книге (или в поиске) открывает `HerbDetailModal` (`components/HerbDetailModal.tsx`) — отдельная страница для каждой травы отсутствует.

Анимация перелистывания: `AnimatePresence mode="wait"` + `motion.div` с вариантами `pageVariants` (`Book.tsx`) — горизонтальный слайд `x: ±100% → 0` и `opacity: 0 → 1` через Framer Motion. Вход 0.45s, выход 0.35s, обе с `ease: [0.4, 0, 0.2, 1]`. 3D-трансформаций нет — `perspective` на контейнере не нужен и удалён.

### Билибинский орнаментальный стиль

`components/ornaments.tsx` — библиотека SVG-орнаментов (углы, лозы, медальоны, гербовые щиты, навигационные щиты-кнопки), портированная из дизайн-проекта Claude Design ("DND травушки", `claude.ai/design/p/019e2848...`). `components/ui.tsx` собирает из них карточки трав/обложку, `components/panels.tsx` + `LoginScreen.tsx` + `PhotoCropModal.tsx` — модалки и панель мастера. CSS-токены (`--gold-muted`, `--birch`, `--slate`, `--r-*`) и шрифтовые классы (`f-philosopher`, `f-cormorant-sc`, `f-italic`, `f-body`, `f-prose`) определены в `index.css`, шрифты Philosopher/Cormorant SC/Istok Web подключены в `index.html`.

### Rarity enum

Четыре значения в порядке возрастания редкости:

| Значение    | Метка         | Цвет      |
|-------------|---------------|-----------|
| `COMMON`    | Обычная       | `#8A9B8A` |
| `UNCOMMON`  | Необычная     | `#4A7C59` |
| `RARE`      | Редкая        | `#3A5F8A` |
| `VERY_RARE` | Очень редкая  | `#7B3FA0` |

При переименовании значений Prisma enum в PostgreSQL нельзя просто удалить старое значение — нужно пересоздавать тип. Паттерн миграции: `ADD VALUE` → `UPDATE` строки → `CREATE TYPE _new` → `ALTER COLUMN ... TYPE _new USING ...` → swap типов. Пример: `migrations/20260602000001_legendary_to_very_rare/migration.sql`.

### Request flow

```
Client (Vite :5173)
  → /api/* proxy → Server (:3001)   [в dev; в prod: VITE_API_URL]
  → /uploads/* proxy → Server       [статика из server/uploads/]

Server routes:
  /api/herbs    → src/routes/herbs.ts   (CRUD + /search + /:id/image + /:id/access)
  /api/auth     → src/routes/auth.ts    (GET /players, POST /login, GET /verify)
```

JWT хранится в `localStorage` как `codex_token`, payload — `{ id: Player.id, role }`. Axios-interceptor в `api/herbs.ts` подставляет его в `Authorization: Bearer`.

### Env variables

`server/.env` (скопировать из `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — подписывает токены
- `PLAYER_VELIMIR_PASSWORD`, `PLAYER_MIDSOMMAR_PASSWORD`, `PLAYER_LEIV_PASSWORD`, `PLAYER_BELOGOR_PASSWORD`, `MASTER_PASSWORD` — пароли пяти аккаунтов (хэшируются bcrypt при апсерте в `prisma/players.ts`, читаются `seed.ts` и `migrate-access.ts`)
- `UPLOAD_DIR` — путь к папке с загруженными фото (default: `./uploads`)
- `CLIENT_URL` — для CORS origin

`client/.env`:
- `VITE_API_URL` — **пустая строка в dev** (Vite proxy берёт на себя); URL бэкенда в prod

### Prisma и миграции

`server/package.json` содержит `"postinstall": "prisma generate"` — клиент генерируется автоматически после `npm install`.

При изменении `schema.prisma` нужно создать новую миграцию локально:
```bash
cd server && npx prisma migrate dev --name <описание_изменения>
```
Это создаёт файл в `server/prisma/migrations/` — его нужно закоммитить. На Render `npx prisma migrate deploy` применяет только закоммиченные файлы миграций.

Render buildCommand использует `npm install --include=dev` — это принципиально: `typescript`, `prisma` CLI и все `@types/*` находятся в `devDependencies`, без флага они не установятся в production-окружении и сборка упадёт.

При расширении модели игроков/доступа (`Player`, `HerbAccess`) использован паттерн "expand and contract": миграция `20260624120000_player_access_model` только добавляет таблицы, не трогая старую колонку `Herb.isUnlocked` (её больше нет в `schema.prisma`, но физически в БД она остаётся до отдельной миграции, которая её дропнет). Это нужно, потому что Render гоняет `prisma migrate deploy` на каждом деплое автоматически, а перенос данных (`npm run migrate:access`, одноразовый прод-скрипт в `prisma/migrate-access.ts`) — ручная операция. Дропать `isUnlocked` можно только после того, как `migrate:access` отработал на проде.

### Key design decisions

- **Нет тестов** — проверка через TypeScript и ручной запуск
- **Один PrismaClient на роутер** — экземпляр создаётся в `routes/herbs.ts`, не синглтон
- **Изображения** — сохраняются в `server/uploads/`, путь записывается в `imageUrl` как `/uploads/filename.ext`, отдаются как статика через `express.static`. Перед загрузкой DM-панель кадрирует фото на canvas (`PhotoCropModal.tsx`) и отправляет уже обрезанный JPEG-блоб — серверный эндпоинт `/:id/image` не изменился (тот же multipart-аплоад)
- **Мобильная адаптивность** — на экранах `< md` правая страница книги скрыта (`hidden md:block`), показывается только левая
- **Шрифты** — Cinzel Decorative/Philosopher (заголовки), EB Garamond/Istok Web (основной текст), Cormorant Garamond italic/Cormorant SC (латынь, орнаментальные надписи). Подключены в `index.html` через Google Fonts
- **Модальное окно** — `HerbDetailModal` закрывается по `Escape` и клику за пределами; иллюстрация слева, переплёт (`ModalSpine`), описание/эффекты справа в одну колонку (блока "свойства" в модалке нет — поле `properties` остаётся в БД и форме DM-панели, но не выводится в просмотре травы)

## Правила работы с дизайном

Дизайн-контекст зафиксирован в двух файлах в корне: `PRODUCT.md` (кто пользователь, что за продукт, что нельзя ломать) и `DESIGN.md` (токены, типографика, рамки, компоненты — извлечены из текущего кода). Машиночитаемая часть — `.impeccable/design.json`. **`DESIGN.md` — эталон.** Стиль уже сложился; задача новой работы — продолжать его, а не изобретать заново.

### Орнаменты и иллюстрации — ассетами, не кодом

Сложные орнаменты, рамки и иллюстрации подключаются **только готовыми ассетами** (SVG/PNG). Не рисовать их кодом.

Если нужного ассета нет — поставить заглушку и описать, какой файл требуется: имя, формат, размер/viewBox, где используется. Не заменять отсутствующий ассет сгенерированной SVG-геометрией.

> Существующие `components/ornaments.tsx` и `PlantGlyph` — исключение по факту: они уже написаны кодом и портированы из дизайн-проекта. Их трогать не нужно, но **новые** орнаменты по этому пути не создаются.

### Мобильная адаптация — только мобильная ветка

Изменения вносятся **только внутри мобильных брейкпоинтов**. Десктопные стили не трогать.

В этом проекте мобильная логика живёт не в CSS-медиазапросах, а в JS: `useBook` держит `isMobile` через `matchMedia('(max-width: 767px)')`, `BookSpread` по нему условно рендерит страницы, а в компонентах стоят тернарники `isMobile ? ... : ...`. Поэтому правило читается так — править можно:

- мобильную ветку тернарника `isMobile ? <сюда> : <не сюда>`;
- утилиты с префиксом `md:` и их мобильные пары в Tailwind;
- настоящие `@media` в `index.css`, если они появятся.

Десктопная ветка, значения без префикса и общие для обоих режимов стили остаются как есть. Если изменение невозможно сделать без правки общего стиля — остановиться и сказать об этом, а не менять десктоп заодно.

**Проверка:** скриншоты на 375 px и 1440 px против эталона. 1440 px должен совпадать с состоянием до правки — это и есть доказательство, что десктоп не тронут.
