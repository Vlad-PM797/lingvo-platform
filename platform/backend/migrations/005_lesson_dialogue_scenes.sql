-- MVP: статичні сцени (SVG) прив'язані до уроку + індексу репліки (ordinal фрази).
CREATE TABLE IF NOT EXISTS lesson_dialogue_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  dialogue_index INTEGER NOT NULL CHECK (dialogue_index >= 1),
  prompt_type TEXT NOT NULL DEFAULT '',
  asset_slug TEXT NOT NULL,
  alt_text_ua TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, dialogue_index, prompt_type)
);

CREATE INDEX IF NOT EXISTS idx_lesson_dialogue_scenes_lesson_id ON lesson_dialogue_scenes(lesson_id);

INSERT INTO lesson_dialogue_scenes (lesson_id, dialogue_index, prompt_type, asset_slug, alt_text_ua)
SELECT lessons.id, seed.dialogue_index, '', seed.asset_slug, seed.alt_text_ua
FROM lessons
INNER JOIN (
  VALUES
    ('a0-basics-01', 1, 'scene-a0-basics-01-d1', 'Двоє студентів хвилюються перед першим «привітом» англійською.'),
    ('a0-basics-01', 2, 'scene-a0-basics-01-d2', 'Хтось представляється: «Я студент» — нотатки й усмішка.'),
    ('a0-basics-01', 3, 'scene-a0-basics-01-d3', 'Перша зустріч: «Приємно познайомитися» — дружні жести.'),
    ('a0-basics-02', 1, 'scene-a0-basics-02-d1', 'Ранкова пара з кавою й «Good morning!»'),
    ('a0-basics-02', 2, 'scene-a0-basics-02-d2', 'Розмова «Як справи?» біля розкладу на дошці.'),
    ('a0-basics-02', 3, 'scene-a0-basics-02-d3', 'У коридорі: «Я б хотів води» — пляшка й жест «будь ласка».')
) AS seed(lesson_code, dialogue_index, asset_slug, alt_text_ua) ON lessons.code = seed.lesson_code
ON CONFLICT (lesson_id, dialogue_index, prompt_type) DO NOTHING;
