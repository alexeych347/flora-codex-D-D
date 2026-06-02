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

## Architecture

### Data visibility pattern (критично)

Центральная бизнес-логика: **всё на бэкенде**, клиент не фильтрует.

- `GET /api/herbs` с валидным JWT → все поля всех трав
- `GET /api/herbs` без токена → locked-травы отдаются как `{ id, isUnlocked: false, sortOrder, rarity }` (4 поля)
- Middleware `optionalAuth` заполняет `req.isDM = true/false`; `authMiddleware` — требует токен, иначе 401

Соответствующий discriminated union на клиенте:
```ts
// types/index.ts
type HerbOrStub = Herb | LockedHerbStub
// Herb.isUnlocked === true (все поля)
// LockedHerbStub.isUnlocked === false (4 поля)
isFullHerb(herb)  // type guard для сужения типа
```

Важно: `Herb.isUnlocked` имеет тип `true` (не `boolean`). Для форм редактирования используется `HerbPayload` (`api/herbs.ts`) — там `isUnlocked?: boolean`.

### Book navigation model

`useBook(totalHerbs)` управляет навигацией:
- страница `0` = оглавление-галерея (`GalleryIndex`)
- страницы `1..N` = травы (индекс в массиве = `page - 1`)
- `direction: 1` (вперёд) / `-1` (назад) управляет `rotateY` анимацией в `Book.tsx`

Анимация перелистывания: `AnimatePresence` + `motion.div` с `rotateY: ±90 → 0` через Framer Motion, `perspective: 1500px` на контейнере.

### Request flow

```
Client (Vite :5173)
  → /api/* proxy → Server (:3001)   [в dev; в prod: VITE_API_URL]
  → /uploads/* proxy → Server       [статика из server/uploads/]

Server routes:
  /api/herbs    → src/routes/herbs.ts   (CRUD + /search + /:id/image)
  /api/auth     → src/routes/auth.ts    (POST /login, GET /verify)
```

JWT хранится в `localStorage` как `dm_token`. Axios-interceptor в `api/herbs.ts` подставляет его в `Authorization: Bearer`.

### Env variables

`server/.env` (скопировать из `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — подписывает токены
- `DM_PASSWORD` — единственный пароль DM (один на всё)
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

### Key design decisions

- **Нет тестов** — проверка через TypeScript и ручной запуск
- **Один PrismaClient на роутер** — экземпляр создаётся в `routes/herbs.ts`, не синглтон
- **Изображения** — сохраняются в `server/uploads/`, путь записывается в `imageUrl` как `/uploads/filename.ext`, отдаются как статика через `express.static`
- **Мобильная адаптивность** — на экранах `< md` правая страница книги скрыта (`hidden md:block`), показывается только левая
- **Шрифты** — Cinzel Decorative (заголовки), EB Garamond (основной текст), Cormorant Garamond italic (латынь). Подключены в `index.html` через Google Fonts
