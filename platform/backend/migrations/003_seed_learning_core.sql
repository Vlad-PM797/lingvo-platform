INSERT INTO courses (code, title, description, is_active)
VALUES
  ('english-a0', 'English A0 Starter', 'Starter English course for Ukrainian speaking users', TRUE)
ON CONFLICT (code) DO NOTHING;

WITH selected_course AS (
  SELECT id
  FROM courses
  WHERE code = 'english-a0'
  LIMIT 1
)
INSERT INTO lessons (course_id, code, title, description, ordinal, is_active)
SELECT selected_course.id, lesson_seed.code, lesson_seed.title, lesson_seed.description, lesson_seed.ordinal, TRUE
FROM selected_course
INNER JOIN (
  VALUES
    ('a0-basics-01', 'Basics 01: Greetings', 'First steps with greetings and introductions', 1),
    ('a0-basics-02', 'Basics 02: Daily Phrases', 'Common phrases for everyday communication', 2)
) AS lesson_seed(code, title, description, ordinal) ON TRUE
ON CONFLICT (code) DO NOTHING;

INSERT INTO lesson_words (lesson_id, en_text, ua_text, ordinal)
SELECT lessons.id, seeded.en_text, seeded.ua_text, seeded.ordinal
FROM lessons
INNER JOIN (
  VALUES
    ('a0-basics-01', 'hello', 'привіт', 1),
    ('a0-basics-01', 'name', 'ім''я', 2),
    ('a0-basics-01', 'student', 'студент', 3),
    ('a0-basics-01', 'teacher', 'вчитель', 4),
    ('a0-basics-02', 'morning', 'ранок', 1),
    ('a0-basics-02', 'evening', 'вечір', 2),
    ('a0-basics-02', 'water', 'вода', 3),
    ('a0-basics-02', 'coffee', 'кава', 4)
) AS seeded(lesson_code, en_text, ua_text, ordinal) ON seeded.lesson_code = lessons.code
ON CONFLICT DO NOTHING;

INSERT INTO lesson_phrases (lesson_id, en_text, ua_text, ordinal)
SELECT lessons.id, seeded.en_text, seeded.ua_text, seeded.ordinal
FROM lessons
INNER JOIN (
  VALUES
    ('a0-basics-01', 'My name is Anna.', 'Мене звати Анна.', 1),
    ('a0-basics-01', 'I am a student.', 'Я студент.', 2),
    ('a0-basics-01', 'Nice to meet you.', 'Приємно познайомитися.', 3),
    ('a0-basics-02', 'Good morning!', 'Доброго ранку!', 1),
    ('a0-basics-02', 'How are you?', 'Як справи?', 2),
    ('a0-basics-02', 'I would like water.', 'Я б хотів води.', 3)
) AS seeded(lesson_code, en_text, ua_text, ordinal) ON seeded.lesson_code = lessons.code
ON CONFLICT DO NOTHING;
