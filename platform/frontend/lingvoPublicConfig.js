/**
 * Публічні налаштування клієнта (статичний хостинг).
 * Зміни URL перед деплоєм, якщо бекенд інший.
 */
(function () {
  "use strict";

  // Має збігатися з дозволеними origin у CORS на бекенді (див. platform/render.yaml → CORS_ALLOWED_ORIGINS).
  window.LINGVO_PUBLIC_BACKEND_URL = "https://lingvo-api.onrender.com";

})();
