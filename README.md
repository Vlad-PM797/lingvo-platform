# lingvo-platform
Платформа для вивчення англійської мови

- Відкриття **`index.html`** у корені репозиторію веде на **титульну** (`platform/frontend/landing.html`).
- Окремий **тренажер без редіректу**: `trainer.html` у корені.

## Публічний перегляд (GitHub Pages)

1. У репозиторії: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Після push у гілку **`main`** запускається workflow **Deploy frontend to GitHub Pages** (каталог `platform/frontend`).
3. Після успішного запуску workflow посилання будуть такі (репозиторій `Vlad-PM797/lingvo-platform`):  
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
