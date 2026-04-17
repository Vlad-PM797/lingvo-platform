/**
 * MVP-ілюстрації для перших двох уроків, якщо у БД ще немає рядків у lesson_dialogue_scenes
 * (місія 005 не застосована) або таблиця недоступна.
 * Поля збігаються з lesson_dialogue_scenes; asset_slug → ./scenes/{slug}.svg на фронті.
 */
export type MvpSceneRow = {
  dialogue_index: number;
  prompt_type: string;
  asset_slug: string;
  alt_text_ua: string;
};

export const MVP_LESSON_SCENE_FALLBACK_BY_LESSON_CODE: Readonly<Record<string, readonly MvpSceneRow[]>> = Object.freeze({
  "a0-basics-01": Object.freeze([
    Object.freeze({
      dialogue_index: 1,
      prompt_type: "",
      asset_slug: "scene-a0-basics-01-d1",
      alt_text_ua: "Двоє студентів хвилюються перед першим «привітом» англійською.",
    }),
    Object.freeze({
      dialogue_index: 2,
      prompt_type: "",
      asset_slug: "scene-a0-basics-01-d2",
      alt_text_ua: "Хтось представляється: «Я студент» — нотатки й усмішка.",
    }),
    Object.freeze({
      dialogue_index: 3,
      prompt_type: "",
      asset_slug: "scene-a0-basics-01-d3",
      alt_text_ua: "Перша зустріч: «Приємно познайомитися» — дружні жести.",
    }),
  ]),
  "a0-basics-02": Object.freeze([
    Object.freeze({
      dialogue_index: 1,
      prompt_type: "",
      asset_slug: "scene-a0-basics-02-d1",
      alt_text_ua: "Ранкова пара з кавою й «Good morning!»",
    }),
    Object.freeze({
      dialogue_index: 2,
      prompt_type: "",
      asset_slug: "scene-a0-basics-02-d2",
      alt_text_ua: "Розмова «Як справи?» біля розкладу на дошці.",
    }),
    Object.freeze({
      dialogue_index: 3,
      prompt_type: "",
      asset_slug: "scene-a0-basics-02-d3",
      alt_text_ua: "У коридорі: «Я б хотів води» — пляшка й жест «будь ласка».",
    }),
  ]),
});
