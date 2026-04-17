/**
 * Публічні налаштування клієнта (статичний хостинг).
 * Зміни URL перед деплоєм, якщо бекенд інший.
 */
(function () {
  "use strict";

  // Має збігатися з дозволеними origin у CORS на бекенді (див. platform/render.yaml → CORS_ALLOWED_ORIGINS).
  window.LINGVO_PUBLIC_BACKEND_URL = "https://lingvo-api.onrender.com";

  /**
   * Якщо непорожній рядок — сторінка remote-test.html відкривається лише з параметром
   * ?invite=<цей_ключ>. Для відкритого тесту залиш "".
   */
  window.LINGVO_REMOTE_TEST_INVITE_KEY = "";
})();
