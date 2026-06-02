# 🌿 Flora Codex

Интерактивный справочник трав для D&D кампании в формате магической книги с перелистыванием страниц.

![Stack](https://img.shields.io/badge/React_18-TypeScript-blue) ![Stack](https://img.shields.io/badge/Express-Prisma-green) ![Stack](https://img.shields.io/badge/Deploy-Render.com-purple)

## Возможности

- **Книга с 3D-анимацией** — страницы перелистываются с эффектом rotateY через Framer Motion
- **Оглавление-галерея** — все травы на первом развороте, клик переходит к нужной странице
- **Система редкостей** — Common / Uncommon / Rare / Legendary с цветовой кодировкой
- **Заблокированные травы** — игроки видят только силуэт с замком, детали скрыты на бэкенде
- **Поиск** — по названию, свойствам и эффектам среди открытых трав
- **DM-панель** — скрытый вход по паролю, управление травами: разблокировка, редактирование, загрузка иллюстраций
- **Адаптивность** — на мобильных показывается одна страница вместо разворота

## Стек

| Слой | Технологии |
|---|---|
| Frontend | React 18, TypeScript, Vite, Framer Motion, Tailwind CSS, Axios |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| База данных | PostgreSQL |
| Авторизация | JWT (только для DM) |
| Деплой | Render.com |

## Локальный запуск

### Требования

- Node.js 18+
- PostgreSQL (локальный или облачный)

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/alexeych347/flora-codex-D-D.git
cd flora-codex-D-D

# Установить зависимости
cd server && npm install
cd ../client && npm install
```

### Настройка бэкенда

```bash
cd server

# Скопировать и заполнить переменные окружения
cp .env.example .env
```

Отредактировать `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flora_codex"
JWT_SECRET="your-secret-key"
DM_PASSWORD="your-dm-password"
PORT=3001
UPLOAD_DIR="./uploads"
CLIENT_URL="http://localhost:5173"
```

```bash
# Применить миграции и загрузить тестовые данные
npx prisma migrate dev --name init
npm run seed
```

### Запуск (два терминала)

```bash
# Терминал 1 — бэкенд
cd server && npm run dev

# Терминал 2 — фронтенд
cd client && npm run dev
```

Открыть: [http://localhost:5173](http://localhost:5173)

**Пароль DM** — значение `DM_PASSWORD` из `server/.env`.  
Кнопка входа — иконка ключа в правом верхнем углу.

## Деплой на Render.com

Проект содержит готовый `render.yaml`. Для деплоя:

1. Создать новый проект на [render.com](https://render.com) через "New → Blueprint"
2. Указать этот репозиторий
3. В настройках сервиса `flora-codex-api` задать переменные:
   - `DM_PASSWORD` — пароль для DM
   - `JWT_SECRET` — генерируется автоматически

## Структура проекта

```
flora-codex-D-D/
├── client/                 # React-приложение
│   └── src/
│       ├── components/     # Book, BookSpread, GalleryIndex, DMPanel...
│       ├── hooks/          # useBook, useHerbs, useAuth
│       ├── api/            # Axios-обёртки
│       └── types/          # TypeScript типы
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/         # herbs, auth
│   │   └── middleware/     # JWT auth
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts         # 3 тестовые травы
│   └── uploads/            # Загруженные иллюстрации
└── render.yaml             # Конфигурация деплоя
```

## Модель данных

```prisma
model Herb {
  id           String    # cuid
  name         String    # Серебристая Мята
  latinName    String    # Mentha argentum
  imageUrl     String?   # /uploads/herb-xxx.jpg
  rarity       Rarity    # COMMON | UNCOMMON | RARE | LEGENDARY
  discoveredAt String?   # Игровая дата
  description  String    # Лор-описание
  properties   String[]  # ["Лечебная", "Успокаивающая"]
  effects      String    # Механика D&D
  isUnlocked   Boolean   # false = скрыто от игроков
  sortOrder    Int       # Порядок в книге
}
```
