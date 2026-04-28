ALTER TABLE lesson_words
ADD COLUMN IF NOT EXISTS it_text TEXT;

ALTER TABLE lesson_phrases
ADD COLUMN IF NOT EXISTS it_text TEXT;

-- Нормалізація: якщо італійський текст порожній рядок, зберігаємо як NULL.
UPDATE lesson_words
SET it_text = NULL
WHERE it_text IS NOT NULL AND btrim(it_text) = '';

UPDATE lesson_phrases
SET it_text = NULL
WHERE it_text IS NOT NULL AND btrim(it_text) = '';
