# Lingvo Frontend Access Portal

Мінімальний статичний frontend для доступу користувачів до backend auth:
- `POST /auth/register`
- `POST /auth/login`

## Локальний запуск
- Точка входу за замовчуванням: `index.html` → одразу перекидає на **`landing.html`** (титульна).
- Портал входу / реєстрація: **`portal.html`** (після цього вкажи публічний backend URL).
- Можна підняти статичний сервер з кореня `platform/frontend`.

## Deploy (Vercel)
1. Import this folder as a static project.
2. Set root directory to `platform/frontend`.
3. Deploy.

Після деплою користувачі можуть реєструватися та входити через UI.

## Титульна сторінка та тема
- `theme.js` — спільна тема **темна / світла** (`localStorage`: `lingvo_ui_theme`). Підключай перед основним скриптом сторінки.
- Тема працює на: `portal.html`, `landing.html`, `project.html`, `trainer.html` (однаковий вибір на всіх екранах). Сторінка `index.html` лише редірект на титульну.
- `landing.html` — грайливий лендинг (тур, вхід за 2 кроки, Google, відновлення паролю).
- На лендингу можна обрати шрифт: **за замовчуванням** або **Рутенія** для основного тексту (файл `fonts/Rutenia2008.woff2`, див. `fonts/README-Rutenia.txt`).
- У шапці порталу та інших сторінках — швидкі посилання між **Головна** (`landing`), **Портал** (`index`), **Платформа** (`project`), **Тренажер** (`trainer`).
- `scenes/*.svg` — оригінальні статичні ілюстрації MVP для перших двох уроків (`a0-basics-01`, `a0-basics-02`); прив’язка через API `dialogueScenes` (індекс = ordinal фрази). На **`project.html`** після «Відкрити урок» з’являється блок із картками «картинка + той самий текст фрази».

## Smoke check після деплою
- Зафіксований прод smoke-check для основного домену:
  - `npm run smoke:prod`
- Перевірка довільного домену:
  - `npm run smoke:url -- https://your-frontend-domain.vercel.app`

Smoke-check валідовує критичні маршрути:
- `/`
- `/landing`
- `/trainer`
- `/project`
- `/main.js`
- `/js/app.bundle.js`
- `/theme.js`
