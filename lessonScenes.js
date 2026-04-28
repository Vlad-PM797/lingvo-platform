(function () {
  "use strict";

  function buildSceneCards(phrasePairs, lessonLabel, scenePaths) {
    return Object.freeze(
      phrasePairs.map((pair, index) =>
        Object.freeze({
          dialogueIndex: index + 1,
          promptType: null,
          src: scenePaths[index % scenePaths.length],
          svgPath: scenePaths[index % scenePaths.length],
          alt: `${lessonLabel}: репліка ${index + 1}`,
          altTextUa: pair.ua,
          en: pair.en,
          ua: pair.ua,
        }),
      ),
    );
  }

  const lessonOnePhrases = Object.freeze([
    Object.freeze({ en: "My name is ...", ua: "Мене звати ..." }),
    Object.freeze({ en: "I am from Ukraine.", ua: "Я з України." }),
    Object.freeze({ en: "I live in Kyiv.", ua: "Я живу в Києві." }),
    Object.freeze({ en: "I am a student.", ua: "Я студент." }),
    Object.freeze({ en: "I am a teacher.", ua: "Я вчитель." }),
    Object.freeze({ en: "How are you?", ua: "Як справи?" }),
    Object.freeze({ en: "I am fine, thank you.", ua: "Я добре, дякую." }),
    Object.freeze({ en: "Nice to meet you.", ua: "Приємно познайомитися." }),
    Object.freeze({ en: "Nice to meet you too.", ua: "Мені також приємно познайомитися." }),
    Object.freeze({ en: "What is your name?", ua: "Як тебе звати?" }),
    Object.freeze({ en: "Where are you from?", ua: "Звідки ти?" }),
    Object.freeze({ en: "I speak a little English.", ua: "Я трохи говорю англійською." }),
    Object.freeze({ en: "Please speak slowly.", ua: "Будь ласка, говори повільно." }),
    Object.freeze({ en: "Can you help me?", ua: "Ти можеш мені допомогти?" }),
  ]);

  const lessonTwoPhrases = Object.freeze([
    Object.freeze({ en: "Where are you from?", ua: "Звідки ти?" }),
    Object.freeze({ en: "I am from Ukraine.", ua: "Я з України." }),
    Object.freeze({ en: "I live in Kyiv.", ua: "Я живу в Києві." }),
    Object.freeze({ en: "What is your address?", ua: "Яка твоя адреса?" }),
    Object.freeze({ en: "My street is Shevchenko Street.", ua: "Моя вулиця - вулиця Шевченка." }),
    Object.freeze({ en: "I live near the city center.", ua: "Я живу біля центру міста." }),
    Object.freeze({ en: "Kyiv is the capital of Ukraine.", ua: "Київ - столиця України." }),
    Object.freeze({ en: "Can you show it on the map?", ua: "Можеш показати це на мапі?" }),
    Object.freeze({ en: "I want to visit London.", ua: "Я хочу відвідати Лондон." }),
    Object.freeze({ en: "My postcode is 01001.", ua: "Мій поштовий індекс 01001." }),
    Object.freeze({ en: "I am from a small town.", ua: "Я з маленького містечка." }),
    Object.freeze({ en: "Where do you live now?", ua: "Де ти живеш зараз?" }),
    Object.freeze({ en: "I live abroad now.", ua: "Я зараз живу за кордоном." }),
    Object.freeze({ en: "Is your city big?", ua: "Твоє місто велике?" }),
  ]);

  const scenesByLessonCode = Object.freeze({
    "a0-basics-01": buildSceneCards(lessonOnePhrases, "Basics 01", [
      "./scenes/scene-a0-basics-01-d1.svg",
      "./scenes/scene-a0-basics-01-d2.svg",
      "./scenes/scene-a0-basics-01-d3.svg",
    ]),
    "a0-basics-02": buildSceneCards(lessonTwoPhrases, "Basics 02", [
      "./scenes/scene-a0-basics-02-d1.svg",
      "./scenes/scene-a0-basics-02-d2.svg",
      "./scenes/scene-a0-basics-02-d3.svg",
    ]),
  });

  window.LingvoLessonScenes = Object.freeze({
    getByLessonCode(lessonCode) {
      const key = String(lessonCode || "").trim().toLowerCase();
      return scenesByLessonCode[key] ? [...scenesByLessonCode[key]] : [];
    },
  });
})();
