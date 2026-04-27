# KafeBar — Касса

Профессиональная кассовая панель для KafeBar. Оптимизирована для **ноутбука** и **планшета в альбомной ориентации**.

## Что внутри

- **Workspace** — три колонки:
  - Слева: очередь заказов с фильтрами (Новые / К оплате / Все)
  - В центре: позиции выбранного заказа, итог и комментарий клиента
  - Справа: рабочее место кассира с numpad'ом, быстрыми суммами и расчётом сдачи

- **Приём оплаты**: наличные, карта, кешбэк-кошелёк
  - Numpad с кнопками `←`, `C` и `000`
  - Быстрые суммы: 50K, 100K, 200K, 500K, 1M
  - Кнопка «Ровно» — точная сумма
  - Автоматический расчёт сдачи

- **Сканер QR**: открывает камеру и распознаёт код клиента из мини-приложения KafeBar — автоматически открывает заказ в кассе

- **Real-time**: WebSocket, мгновенное обновление при новом заказе (звук + вибрация + push)

- **Смена кассира**: статистика смены (принято / активные / выручка / время)

- **PWA**: устанавливается как нативное приложение, работает офлайн

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (тёмная тема, акцент emerald)
- React Router 7
- TanStack Query
- Zustand (persist)
- html5-qrcode
- vite-plugin-pwa

## Backend

API: `https://apibar.innosoft.uz/api/v1`

Используемые эндпоинты:
- `POST /auth/login` — логин кассира
- `GET /admin/orders/active` — активные заказы
- `GET /admin/orders` — заказы за смену
- `POST /admin/orders/{id}/payment` — приём оплаты (cash/card/wallet)
- `PATCH /admin/orders/{id}/status` — принять заказ (`pending -> accepted`)

## Доступ

Кассовый интерфейс доступен только для ролей: `operator`, `branch_admin`, `superadmin`.

## Развёртывание

```bash
npm install
npm run build
# dist/ -> Vercel или любой статический хостинг
```

`.env`:
```
VITE_API_URL=https://apibar.innosoft.uz/api/v1
VITE_WS_URL=wss://apibar.innosoft.uz
```
