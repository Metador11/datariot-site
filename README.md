# Orvelis

Образовательная платформа в стиле TikTok с фокусом на полезный и осмысленный контент.

## Структура проекта

```
orvelis/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/            # Tab navigation
│   │   │   ├── index.tsx      # Main feed
│   │   │   ├── discover.tsx    # Search/discovery
│   │   │   ├── create.tsx     # Content upload
│   │   │   └── profile.tsx    # User profile
│   │   ├── auth/              # Authentication
│   │   │   └── login.tsx      # Login/signup
│   │   └── _layout.tsx        # Root layout
│   ├── components/            # Reusable components
│   │   ├── VideoPlayer/       # Video playback
│   │   ├── VideoFeed/         # Vertical feed
│   │   └── UI/                # UI components
│   ├── design-system/         # Theme and design tokens
│   │   └── theme.ts           # Blue color palette
│   ├── lib/                   # Libraries and utilities
│   │   └── supabase/          # Supabase integration
│   └── store/                 # State management
├── assets/                    # App assets
├── .env                       # Environment variables
└── package.json               # Dependencies
```

## Настройка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL из `src/lib/supabase/schema.sql` в SQL Editor
3. Создайте storage bucket с именем `videos`
4. Обновите файл `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Запустите приложение

```bash
# Запуск для iOS
npm run ios

# Запуск для Android
npm run android

# Запуск в веб-браузере
npm run web
```

## Основные функции

### ✅ Реализовано

- **Полноэкранное видео**: Вертикальная лента без черных полос
- **Жесты**: Свайп вверх/вниз для переключения видео
- **Аутентификация**: Вход и регистрация через Supabase
- **Профили пользователей**: Просмотр и редактирование профиля
- **Лайки и комментарии**: Взаимодействие с контентом
- **Поиск и категории**: Поиск образовательного контента
- **Safe Area**: Правильная обработка вырезов iPhone и Android
- **Blue Theme**: Синяя цветовая схема в стиле Orvelis

### 🚧 В разработке

- Загрузка видео на Supabase Storage
- Система подписок
- Комментарии в реальном времени
- Push-уведомления
- Рекомендательная система

## Дизайн-система

### Цвета

- **Primary Blue**: `#0066FF` - Основной синий
- **Electric Blue**: `#00D4FF` - Акцентный синий
- **Background**: `#000814` - Темный фон
- **Surface**: `#003566` - Элементы интерфейса

### Принципы дизайна

1. **Контент на весь экран** - без полей и черных полос
2. **Минимум визуального мусора** - чистый интерфейс
3. **Safe area handling** - корректная работа с вырезами
4. **Portrait-only** - только вертикальная ориентация

## База данных

Схема включает:

- `profiles` - Профили пользователей
- `videos` - Видео контент
- `likes` - Лайки
- `comments` - Комментарии
- `follows` - Подписки
- `video_views` - Просмотры (аналитика)

Row Level Security (RLS) настроена для безопасности данных.

## Технологический стек

- **Frontend**: Expo (React Native) + TypeScript
- **Navigation**: Expo Router
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State**: Zustand
- **Styling**: NativeWind + Design System
- **Video**: Expo AV
- **Animations**: React Native Reanimated

## Следующие шаги

1. ✅ Настроить Supabase (выполнить SQL схему)
2. ✅ Обновить `.env` с вашими ключами
3. Загрузить тестовые видео в Supabase Storage
4. Протестировать на реальном устройстве
5. Развернуть в App Store и Google Play

## Требования

- Node.js 18+
- npm или yarn
- iOS: Xcode 14+ (для iOS разработки)
- Android: Android Studio (для Android разработки)
- Аккаунт Supabase

## Поддержка

Для вопросов по настройке обращайтесь к документации:
- [Expo Docs](https://docs.expo.dev)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)

---

**Orvelis** - Учитесь. Думайте. Растите. 🧠💡
\n# Trigger Vercel Build - Пт 10 апр 2026 12:11:01 UTC
