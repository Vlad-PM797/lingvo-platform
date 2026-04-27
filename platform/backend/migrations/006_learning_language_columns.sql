ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS learning_language_code TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS translation_language_code TEXT NOT NULL DEFAULT 'ua';

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS learning_language_code TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS translation_language_code TEXT NOT NULL DEFAULT 'ua';

UPDATE lessons
SET
  learning_language_code = courses.learning_language_code,
  translation_language_code = courses.translation_language_code
FROM courses
WHERE lessons.course_id = courses.id
  AND (
    lessons.learning_language_code IS DISTINCT FROM courses.learning_language_code
    OR lessons.translation_language_code IS DISTINCT FROM courses.translation_language_code
  );

CREATE INDEX IF NOT EXISTS idx_courses_learning_language_code ON courses(learning_language_code);
CREATE INDEX IF NOT EXISTS idx_lessons_learning_language_code ON lessons(learning_language_code);
