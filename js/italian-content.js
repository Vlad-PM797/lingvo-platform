const THEME_NAMES = Object.freeze([
  "Basi 01",
  "Lezione 02",
]);

export const PROJECT_INTROS = Object.freeze({
  "Basi 01": {
    words: Object.freeze([
      { en: "ciao", ua: "привіт" },
      { en: "nome", ua: "ім'я" },
      { en: "studente", ua: "студент" },
      { en: "insegnante", ua: "вчитель" },
      { en: "amico", ua: "друг" },
      { en: "famiglia", ua: "сім'я" },
      { en: "città", ua: "місто" },
      { en: "paese", ua: "країна" },
      { en: "casa", ua: "дім" },
      { en: "acqua", ua: "вода" },
    ]),
    phrases: Object.freeze([
      { en: "Mi chiamo Anna.", ua: "Мене звати Анна." },
      { en: "Sono uno studente.", ua: "Я студент." },
      { en: "Piacere di conoscerti.", ua: "Приємно познайомитися." },
      { en: "Come ti chiami?", ua: "Як тебе звати?" },
      { en: "Sono dell'Ucraina.", ua: "Я з України." },
      { en: "Abito a Kyiv.", ua: "Я живу в Києві." },
      { en: "Sto bene, grazie.", ua: "Я добре, дякую." },
      { en: "Parlo un po' di italiano.", ua: "Я трохи говорю італійською." },
    ]),
    themeOrder: 1,
  },
  "Lezione 02": {
    words: Object.freeze([
      { en: "mattina", ua: "ранок" },
      { en: "sera", ua: "вечір" },
      { en: "caffè", ua: "кава" },
      { en: "tè", ua: "чай" },
      { en: "menu", ua: "меню" },
      { en: "conto", ua: "рахунок" },
      { en: "strada", ua: "вулиця" },
      { en: "indirizzo", ua: "адреса" },
      { en: "mappa", ua: "мапа" },
      { en: "viaggio", ua: "подорож" },
    ]),
    phrases: Object.freeze([
      { en: "Buongiorno!", ua: "Доброго ранку!" },
      { en: "Come stai?", ua: "Як справи?" },
      { en: "Vorrei dell'acqua.", ua: "Я б хотів води." },
      { en: "Dov'è il museo?", ua: "Де музей?" },
      { en: "Qual è il tuo indirizzo?", ua: "Яка твоя адреса?" },
      { en: "Abito vicino al centro.", ua: "Я живу біля центру." },
      { en: "Posso avere il menu?", ua: "Можна меню?" },
      { en: "Posso avere il conto?", ua: "Можна рахунок?" },
    ]),
    themeOrder: 2,
  },
});

export const LESSON_STEPS = Object.freeze([
  {
    id: "it_step_1",
    type: "translate_ua_to_it",
    project: THEME_NAMES[0],
    promptUa: "Переклади італійською: Мене звати Олексій.",
    expectedAnswers: ["mi chiamo oleksii", "mi chiamo oleksiy", "mi chiamo oleksi"],
    explanationUa: "Використай шаблон: Mi chiamo ...",
  },
  {
    id: "it_step_2",
    type: "translate_ua_to_it",
    project: THEME_NAMES[1],
    promptUa: "Переклади італійською: Доброго ранку! Я б хотів води.",
    expectedAnswers: ["buongiorno vorrei dell acqua", "buongiorno vorrei dell'acqua"],
    explanationUa: "Використай Buongiorno! і конструкцію Vorrei ...",
  },
]);

export const LESSON_MATERIALS = Object.freeze({
  "Basi 01": [
    "Урок 1. Італійська: знайомство",
    "[IMG:lesson-01-intro.svg]",
    "Ситуація: перше знайомство та коротка самопрезентація.",
    "Діалог:",
    "- Mi chiamo Anna. (Мене звати Анна.)",
    "- Piacere di conoscerti. (Приємно познайомитися.)",
    "Граматика: sono / mi chiamo.",
    "Міні-завдання: скажи 2 фрази про себе італійською.",
  ].join("\n"),
  "Lezione 02": [
    "Урок 2. Італійська: щоденні фрази",
    "[IMG:lesson-02-from.svg]",
    "Ситуація: побутові питання, вода, меню, адреса.",
    "Діалог:",
    "- Buongiorno! Come stai? (Доброго ранку! Як справи?)",
    "- Vorrei dell'acqua. (Я б хотів води.)",
    "Граматика: vorrei / posso avere.",
    "Міні-завдання: попроси воду та меню італійською.",
  ].join("\n"),
});

export const EN_UA_GLOSSARY = Object.freeze({
  "ciao": "привіт",
  "mi chiamo": "мене звати",
  "sono": "я є / я",
  "studente": "студент",
  "insegnante": "вчитель",
  "piacere di conoscerti": "приємно познайомитися",
  "come ti chiami": "як тебе звати",
  "buongiorno": "доброго ранку",
  "come stai": "як справи",
  "vorrei": "я б хотів",
  "acqua": "вода",
  "posso avere": "можна мені",
  "menu": "меню",
  "conto": "рахунок",
  "abito": "я живу",
});
