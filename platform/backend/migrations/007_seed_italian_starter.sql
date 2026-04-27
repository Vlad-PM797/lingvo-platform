INSERT INTO courses (
  code,
  title,
  description,
  learning_language_code,
  translation_language_code,
  is_active
)
VALUES
  ('italian-a0', 'Italian A0 Starter', 'Starter Italian course for Ukrainian speaking users', 'it', 'ua', TRUE)
ON CONFLICT (code) DO NOTHING;

WITH selected_course AS (
  SELECT id
  FROM courses
  WHERE code = 'italian-a0'
  LIMIT 1
)
INSERT INTO lessons (
  course_id,
  code,
  title,
  description,
  ordinal,
  learning_language_code,
  translation_language_code,
  is_active
)
SELECT
  selected_course.id,
  lesson_seed.code,
  lesson_seed.title,
  lesson_seed.description,
  lesson_seed.ordinal,
  'it',
  'ua',
  TRUE
FROM selected_course
INNER JOIN (
  VALUES
    ('it-a0-basics-01', 'Basi 01: Saluti', 'Prime frasi per saluti e presentazioni', 1),
    ('it-a0-basics-02', 'Basi 02: Frasi quotidiane', 'Frasi comuni per la comunicazione quotidiana', 2)
) AS lesson_seed(code, title, description, ordinal) ON TRUE
ON CONFLICT (code) DO NOTHING;

INSERT INTO lesson_words (lesson_id, en_text, ua_text, ordinal)
SELECT lessons.id, seeded.learning_text, seeded.ua_text, seeded.ordinal
FROM lessons
INNER JOIN (
  VALUES
    ('it-a0-basics-01', 'ciao', 'привіт', 1),
    ('it-a0-basics-01', 'nome', 'ім''я', 2),
    ('it-a0-basics-01', 'studente', 'студент', 3),
    ('it-a0-basics-01', 'insegnante', 'вчитель', 4),
    ('it-a0-basics-02', 'mattina', 'ранок', 1),
    ('it-a0-basics-02', 'sera', 'вечір', 2),
    ('it-a0-basics-02', 'acqua', 'вода', 3),
    ('it-a0-basics-02', 'caffè', 'кава', 4)
) AS seeded(lesson_code, learning_text, ua_text, ordinal) ON seeded.lesson_code = lessons.code
ON CONFLICT DO NOTHING;

INSERT INTO lesson_phrases (lesson_id, en_text, ua_text, ordinal)
SELECT lessons.id, seeded.learning_text, seeded.ua_text, seeded.ordinal
FROM lessons
INNER JOIN (
  VALUES
    ('it-a0-basics-01', 'Mi chiamo Anna.', 'Мене звати Анна.', 1),
    ('it-a0-basics-01', 'Sono uno studente.', 'Я студент.', 2),
    ('it-a0-basics-01', 'Piacere di conoscerti.', 'Приємно познайомитися.', 3),
    ('it-a0-basics-02', 'Buongiorno!', 'Доброго ранку!', 1),
    ('it-a0-basics-02', 'Come stai?', 'Як справи?', 2),
    ('it-a0-basics-02', 'Vorrei dell''acqua.', 'Я б хотів води.', 3)
) AS seeded(lesson_code, learning_text, ua_text, ordinal) ON seeded.lesson_code = lessons.code
ON CONFLICT DO NOTHING;
