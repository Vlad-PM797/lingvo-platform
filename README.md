# lingvo-platform
Платформа для вивчення англійської мови

- Відкриття **`index.html`** у корені репозиторію веде на **титульну** (`platform/frontend/landing.html`).
- Окремий **тренажер без редіректу**: `trainer.html` у корені.

## Публічний перегляд (GitHub Pages)

1. У **Settings → Actions → General → Workflow permissions** увімкни **Read and write** (щоб workflow міг пушити гілку `gh-pages`).
2. Зроби push у **`main`** (або вручну запусти workflow **Deploy frontend to gh-pages** у вкладці Actions).
3. Коли workflow завершиться зеленим: **Settings → Pages → Build and deployment → Source: Deploy from a branch** → гілка **`gh-pages`**, папка **`/(root)`**, Save.
4. Через 1–2 хв посилання будуть такі (репозиторій `Vlad-PM797/lingvo-platform`):  
   - титул: `https://vlad-pm797.github.io/lingvo-platform/landing.html`  
   - тренажер: `https://vlad-pm797.github.io/lingvo-platform/trainer.html`  
   - **вхід для тестувальників** (лише email + пароль, без ручного вводу API): `https://vlad-pm797.github.io/lingvo-platform/remote-test.html`  
   - платформа після входу: `https://vlad-pm797.github.io/lingvo-platform/project.html`

> Статичні сторінки; API тренажера з `app.bundle.js` працює офлайн.  
> Публічний URL бекенду задається у `platform/frontend/lingvoPublicConfig.js` (`LINGVO_PUBLIC_BACKEND_URL`). За потреби обмеж доступ лише «секретним» посиланням: задай `LINGVO_REMOTE_TEST_INVITE_KEY` і відкривай `remote-test.html?invite=<ключ>`.

## Віддалені тестувальники

1. Надай посилання на **`remote-test.html`** (за потреби з `?invite=…` — див. `lingvoPublicConfig.js`).
2. На бекенді має існувати обліковий запис (email + пароль); реєстрація — через **`portal.html`**, якщо не закрита.
3. Після успішного входу відкриється **`project.html`** з уже збереженим Backend URL.

### Якщо в браузері «Failed to fetch» зі сторінки на github.io

- У **`platform/render.yaml`** для сервісу вже задано дефолтне **`CORS_ALLOWED_ORIGINS`** (GitHub Pages + локальні origin). Після push: у **Render → Environment** переконайся, що змінна **не перезаписана** старим значенням без `github.io`; за потреби вручну встав те саме значення або натисни **Sync** з Blueprint.
- У бекенді виставлено **`Cross-Origin-Resource-Policy: cross-origin`** (Helmet) — **обов’язково задеплой останній бекенд** з репозиторію.
- Тимчасово для діагностики можна поставити **`CORS_ALLOWED_ORIGINS=*`** (лише для тесту).
