(function () {
  "use strict";

  const sharedUi = window.LingvoFrontendShared;

  async function requestLearningJson(authClient, baseUrl, path, options = {}) {
    return authClient.request(path, {
      baseUrl,
      auth: true,
      method: options.method || "GET",
      body: options.body ?? null,
    });
  }

  async function fetchCourses(authClient, baseUrl, queryString = "") {
    const payload = await requestLearningJson(authClient, baseUrl, `/learning/courses${queryString}`);
    return Array.isArray(payload.courses) ? payload.courses : [];
  }

  async function fetchLessonsByCourseId(authClient, baseUrl, courseId, queryString = "") {
    const payload = await requestLearningJson(authClient, baseUrl, `/learning/courses/${courseId}/lessons${queryString}`);
    return Array.isArray(payload.lessons) ? payload.lessons : [];
  }

  async function fetchLessonById(authClient, baseUrl, lessonId) {
    return requestLearningJson(authClient, baseUrl, `/learning/lessons/${lessonId}`);
  }

  function formatLessonPreview(lesson, options = {}) {
    const words = Array.isArray(lesson?.words) ? lesson.words : [];
    const phrases = Array.isArray(lesson?.phrases) ? lesson.phrases : [];
    const wordLimit = Number(options.wordLimit) || 12;
    const phraseLimit = Number(options.phraseLimit) || 8;
    const headingLines = Array.isArray(options.headingLines) ? options.headingLines : [];
    const trailingLines = Array.isArray(options.trailingLines) ? options.trailingLines : [];

    const wordsPreview = words
      .slice(0, wordLimit)
      .map((item) => `- ${sharedUi.getLearningText(item)} — ${sharedUi.getTranslationText(item)}`)
      .join("\n");
    const phrasesPreview = phrases
      .slice(0, phraseLimit)
      .map((item) => `- ${sharedUi.getLearningText(item)} — ${sharedUi.getTranslationText(item)}`)
      .join("\n");

    return [
      ...headingLines,
      `Слова (${words.length}):`,
      wordsPreview || "(немає)",
      ``,
      `Фрази (${phrases.length}):`,
      phrasesPreview || "(немає)",
      ...trailingLines,
    ].join("\n");
  }

  window.LingvoSharedLearning = Object.freeze({
    requestLearningJson,
    fetchCourses,
    fetchLessonsByCourseId,
    fetchLessonById,
    formatLessonPreview,
  });
})();
