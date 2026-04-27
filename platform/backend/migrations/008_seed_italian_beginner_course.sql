INSERT INTO courses (
  code,
  title,
  description,
  learning_language_code,
  translation_language_code,
  is_active
)
VALUES
  ('italian-beginner-a0', 'Italian Beginner A0', 'Beginner Italian course with greetings, food, and travel themes', 'it', 'ua', TRUE)
ON CONFLICT (code) DO NOTHING;

WITH selected_course AS (
  SELECT id
  FROM courses
  WHERE code = 'italian-beginner-a0'
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
    ('it-beginner-greetings', 'Greetings: first conversations', 'Say hello, introduce yourself, and ask simple personal questions', 1),
    ('it-beginner-food', 'Food: cafe and restaurant basics', 'Order food and drinks, ask for a menu, and talk about preferences', 2),
    ('it-beginner-travel', 'Travel: city and transport basics', 'Navigate a city, ask for directions, and use simple travel phrases', 3)
) AS lesson_seed(code, title, description, ordinal) ON TRUE
ON CONFLICT (code) DO NOTHING;

INSERT INTO lesson_words (lesson_id, en_text, ua_text, ordinal)
SELECT lessons.id, seeded.learning_text, seeded.translation_text, seeded.ordinal
FROM lessons
INNER JOIN (
  VALUES
    ('it-beginner-greetings', 'ciao', 'hello / bye', 1),
    ('it-beginner-greetings', 'buongiorno', 'good morning', 2),
    ('it-beginner-greetings', 'buonasera', 'good evening', 3),
    ('it-beginner-greetings', 'arrivederci', 'goodbye', 4),
    ('it-beginner-greetings', 'grazie', 'thank you', 5),
    ('it-beginner-greetings', 'prego', 'you are welcome', 6),
    ('it-beginner-greetings', 'scusa', 'sorry / excuse me', 7),
    ('it-beginner-greetings', 'nome', 'name', 8),
    ('it-beginner-greetings', 'amico', 'friend', 9),
    ('it-beginner-greetings', 'piacere', 'nice to meet you', 10),
    ('it-beginner-food', 'acqua', 'water', 1),
    ('it-beginner-food', 'caffe', 'coffee', 2),
    ('it-beginner-food', 'te', 'tea', 3),
    ('it-beginner-food', 'pane', 'bread', 4),
    ('it-beginner-food', 'pasta', 'pasta', 5),
    ('it-beginner-food', 'pizza', 'pizza', 6),
    ('it-beginner-food', 'formaggio', 'cheese', 7),
    ('it-beginner-food', 'frutta', 'fruit', 8),
    ('it-beginner-food', 'menu', 'menu', 9),
    ('it-beginner-food', 'conto', 'bill', 10),
    ('it-beginner-travel', 'treno', 'train', 1),
    ('it-beginner-travel', 'autobus', 'bus', 2),
    ('it-beginner-travel', 'biglietto', 'ticket', 3),
    ('it-beginner-travel', 'stazione', 'station', 4),
    ('it-beginner-travel', 'aeroporto', 'airport', 5),
    ('it-beginner-travel', 'hotel', 'hotel', 6),
    ('it-beginner-travel', 'strada', 'street', 7),
    ('it-beginner-travel', 'mappa', 'map', 8),
    ('it-beginner-travel', 'sinistra', 'left', 9),
    ('it-beginner-travel', 'destra', 'right', 10)
) AS seeded(lesson_code, learning_text, translation_text, ordinal) ON seeded.lesson_code = lessons.code
ON CONFLICT DO NOTHING;

INSERT INTO lesson_phrases (lesson_id, en_text, ua_text, ordinal)
SELECT lessons.id, seeded.learning_text, seeded.translation_text, seeded.ordinal
FROM lessons
INNER JOIN (
  VALUES
    ('it-beginner-greetings', 'Ciao, come stai?', 'Hello, how are you?', 1),
    ('it-beginner-greetings', 'Sto bene, grazie.', 'I am fine, thank you.', 2),
    ('it-beginner-greetings', 'Come ti chiami?', 'What is your name?', 3),
    ('it-beginner-greetings', 'Mi chiamo Anna.', 'My name is Anna.', 4),
    ('it-beginner-greetings', 'Piacere di conoscerti.', 'Nice to meet you.', 5),
    ('it-beginner-greetings', 'Di dove sei?', 'Where are you from?', 6),
    ('it-beginner-greetings', 'Sono dell''Ucraina.', 'I am from Ukraine.', 7),
    ('it-beginner-greetings', 'Parlo un po'' di italiano.', 'I speak a little Italian.', 8),
    ('it-beginner-greetings', 'Non capisco.', 'I do not understand.', 9),
    ('it-beginner-greetings', 'Puoi ripetere?', 'Can you repeat?', 10),
    ('it-beginner-greetings', 'A presto!', 'See you soon!', 11),
    ('it-beginner-greetings', 'Buona giornata!', 'Have a nice day!', 12),
    ('it-beginner-food', 'Vorrei un caffe.', 'I would like a coffee.', 1),
    ('it-beginner-food', 'Vorrei dell''acqua.', 'I would like some water.', 2),
    ('it-beginner-food', 'Posso avere il menu?', 'Can I have the menu?', 3),
    ('it-beginner-food', 'Quanto costa?', 'How much does it cost?', 4),
    ('it-beginner-food', 'Il conto, per favore.', 'The bill, please.', 5),
    ('it-beginner-food', 'Mi piace la pizza.', 'I like pizza.', 6),
    ('it-beginner-food', 'Non mi piace il caffe.', 'I do not like coffee.', 7),
    ('it-beginner-food', 'Ho fame.', 'I am hungry.', 8),
    ('it-beginner-food', 'Ho sete.', 'I am thirsty.', 9),
    ('it-beginner-food', 'E molto buono.', 'It is very good.', 10),
    ('it-beginner-food', 'Senza formaggio, per favore.', 'Without cheese, please.', 11),
    ('it-beginner-food', 'Un tavolo per due, per favore.', 'A table for two, please.', 12),
    ('it-beginner-travel', 'Dov''e la stazione?', 'Where is the station?', 1),
    ('it-beginner-travel', 'Vorrei un biglietto.', 'I would like a ticket.', 2),
    ('it-beginner-travel', 'Il treno parte alle nove.', 'The train leaves at nine.', 3),
    ('it-beginner-travel', 'Dov''e l''hotel?', 'Where is the hotel?', 4),
    ('it-beginner-travel', 'Vado in centro.', 'I am going to the center.', 5),
    ('it-beginner-travel', 'Gira a sinistra.', 'Turn left.', 6),
    ('it-beginner-travel', 'Gira a destra.', 'Turn right.', 7),
    ('it-beginner-travel', 'E lontano?', 'Is it far?', 8),
    ('it-beginner-travel', 'E vicino.', 'It is near.', 9),
    ('it-beginner-travel', 'Mi serve una mappa.', 'I need a map.', 10),
    ('it-beginner-travel', 'Parla inglese?', 'Do you speak English?', 11),
    ('it-beginner-travel', 'Grazie per l''aiuto.', 'Thank you for the help.', 12)
) AS seeded(lesson_code, learning_text, translation_text, ordinal) ON seeded.lesson_code = lessons.code
ON CONFLICT DO NOTHING;
