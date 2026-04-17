# lingvo-platform
Платформа для вивчення англійської мови

- Відкриття **`index.html`** у корені репозиторію веде на **титульну** (`platform/frontend/landing.html`).
- Окремий **тренажер без редіректу**: `trainer.html` у корені.

## Публічний перегляд (GitHub Pages)

1. У репозиторії: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Після push у гілку **`main`** запускається workflow **Deploy frontend to GitHub Pages** (каталог `platform/frontend`).
3. Посилання після успішного деплою (заміни `OWNER` на свій акаунт, якщо інший):  
   - титул: `https://OWNER.github.io/lingvo-platform/landing.html`  
   - тренажер: `https://OWNER.github.io/lingvo-platform/trainer.html`  
   - платформа (потрібен свій backend URL): `https://OWNER.github.io/lingvo-platform/project.html`

> Статичні сторінки; API тренажера з `app.bundle.js` працює офлайн. Для `project.html` вкажи публічний URL бекенду в полі на сторінці.
