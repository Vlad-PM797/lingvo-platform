export const SHORT_WORD_TEST_COUNT = 10;
export const SHORT_PHRASE_TEST_COUNT = 8;
export const INTRO_CONTENT_VERSION = 4;

export function buildSampleIndices(totalCount, sampleCount) {
  const targetCount = Math.min(totalCount, sampleCount);
  const indices = Array.from({ length: totalCount }, (_, index) => index);
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const tempValue = indices[index];
    indices[index] = indices[randomIndex];
    indices[randomIndex] = tempValue;
  }
  return indices.slice(0, targetCount);
}

export function createIntroState(projectIntro) {
  return {
    contentVersion: INTRO_CONTENT_VERSION,
    wordsShown: false,
    wordsTestIndex: 0,
    wordsDirection: "ua_to_en",
    wordsSampleIndices: buildSampleIndices(projectIntro.words.length, SHORT_WORD_TEST_COUNT),
    phrasesShown: false,
    phrasesTestIndex: 0,
    phrasesDirection: "ua_to_en",
    phrasesSampleIndices: buildSampleIndices(projectIntro.phrases.length, SHORT_PHRASE_TEST_COUNT),
    completed: false,
  };
}

export function resetIntroState(introState, projectIntro) {
  Object.assign(introState, createIntroState(projectIntro));
  return introState;
}

export function ensureIntroState(progressState, projectName, projectIntro) {
  if (!progressState.introProgress) {
    progressState.introProgress = {};
  }

  if (!progressState.introProgress[projectName]) {
    progressState.introProgress[projectName] = createIntroState(projectIntro);
  }

  const introState = progressState.introProgress[projectName];
  if (introState.contentVersion !== INTRO_CONTENT_VERSION) {
    resetIntroState(introState, projectIntro);
  }

  if (!Array.isArray(introState.wordsSampleIndices) || introState.wordsSampleIndices.length === 0) {
    introState.wordsSampleIndices = buildSampleIndices(projectIntro.words.length, SHORT_WORD_TEST_COUNT);
  }
  if (!Array.isArray(introState.phrasesSampleIndices) || introState.phrasesSampleIndices.length === 0) {
    introState.phrasesSampleIndices = buildSampleIndices(projectIntro.phrases.length, SHORT_PHRASE_TEST_COUNT);
  }

  return introState;
}

export function collectExpectedAnswers(list, getMatchValue, matchFieldValue, getResultValue, normalizeAnswer) {
  const normalizedMatchFieldValue = normalizeAnswer(matchFieldValue);
  const answers = [];
  const answerSet = new Set();
  for (const item of list) {
    const normalizedItemMatchValue = normalizeAnswer(getMatchValue(item));
    if (normalizedItemMatchValue !== normalizedMatchFieldValue) {
      continue;
    }
    const normalizedAnswerValue = normalizeAnswer(getResultValue(item));
    if (answerSet.has(normalizedAnswerValue)) {
      continue;
    }
    answerSet.add(normalizedAnswerValue);
    answers.push(normalizedAnswerValue);
  }

  if (answers.length === 0) {
    answers.push(normalizeAnswer(matchFieldValue));
  }
  return answers;
}
