UPDATE lesson_words
SET it_text = seeded.it_text
FROM (
  VALUES
    ('a0-basics-01', 1, 'ciao'),
    ('a0-basics-01', 2, 'nome'),
    ('a0-basics-01', 3, 'studente'),
    ('a0-basics-01', 4, 'insegnante'),
    ('a0-basics-02', 1, 'mattina'),
    ('a0-basics-02', 2, 'sera'),
    ('a0-basics-02', 3, 'acqua'),
    ('a0-basics-02', 4, 'caffè')
) AS seeded(lesson_code, ordinal, it_text)
INNER JOIN lessons ON lessons.code = seeded.lesson_code
WHERE lesson_words.lesson_id = lessons.id
  AND lesson_words.ordinal = seeded.ordinal;

UPDATE lesson_phrases
SET it_text = seeded.it_text
FROM (
  VALUES
    ('a0-basics-01', 1, 'Mi chiamo Anna.'),
    ('a0-basics-01', 2, 'Sono uno studente.'),
    ('a0-basics-01', 3, 'Piacere di conoscerti.'),
    ('a0-basics-02', 1, 'Buongiorno!'),
    ('a0-basics-02', 2, 'Come stai?'),
    ('a0-basics-02', 3, 'Vorrei dell''acqua.')
) AS seeded(lesson_code, ordinal, it_text)
INNER JOIN lessons ON lessons.code = seeded.lesson_code
WHERE lesson_phrases.lesson_id = lessons.id
  AND lesson_phrases.ordinal = seeded.ordinal;
