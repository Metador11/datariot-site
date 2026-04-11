# Настройка Supabase для Orvelis

## 1. Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "New Project"
3. Заполните детали проекта:
   - Название: `orvelis`
   - Database Password: (сохраните в безопасном месте)
   - Region: Выберите ближайший регион

## 2. Настройка базы данных

1. Откройте SQL Editor в панели Supabase
2. Создайте новый query
3. Скопируйте и выполните весь код из `src/lib/supabase/schema.sql`
4. Убедитесь, что все таблицы созданы успешно

## 3. Настройка Storage

1. Перейдите в раздел Storage
2. Создайте новый bucket:
   - Name: `videos`
   - Public: ✅ (для публичного доступа к видео)
3. Настройте политики доступа:
   - SELECT: Публичный доступ
   - INSERT: Только авторизованные пользователи
   - UPDATE: Только владелец
   - DELETE: Только владелец

## 4. Получение API ключей

1. Перейдите в Settings → API
2. Скопируйте:
   - `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ держите в секрете!)

## 5. Обновление .env файла

Откройте `.env` и обновите переменные:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **ВАЖНО**: Никогда не коммитьте `.env` файл в git!

## 6. Настройка аутентификации

1. Перейдите в Authentication → Providers
2. Включите Email provider
3. (Опционально) Настройте дополнительные провайдеры:
   - Google
   - Apple
   - GitHub

## 7. Тестирование подключения

Запустите приложение и попробуйте:
1. Зарегистрироваться
2. Войти в систему
3. Проверить профиль

## Готово! 🎉

Ваш Supabase backend настроен и готов к использованию.
