import { LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { MVP_LESSON_SCENE_FALLBACK_BY_LESSON_CODE } from "../config/mvpLessonSceneFallback";
import { HttpError } from "../middleware/errorHandler";
import { courseRepository } from "../repositories/courseRepository";
import { lessonRepository } from "../repositories/lessonRepository";
import { lessonSceneRepository, type LessonDialogueSceneRecord } from "../repositories/lessonSceneRepository";
import { logger } from "../utils/logger";

export class LearningContentService {
  async getCoursesWithLessons(filters: { learningLanguage?: string; translationLanguage?: string } = {}): Promise<
    Array<{
      id: string;
      code: string;
      title: string;
      description: string;
      learningLanguage: string;
      translationLanguage: string;
      lessons: Array<{
        id: string;
        code: string;
        title: string;
        description: string;
        ordinal: number;
        learningLanguage: string;
        translationLanguage: string;
        learningLanguageLabel: string;
      }>;
    }>
  > {
    const courses = await courseRepository.getActiveCourses(filters);
    return Promise.all(
      courses.map(async (course) => {
        const lessons = await courseRepository.getActiveLessonsByCourseId(course.id, filters);
        return {
          id: course.id,
          code: course.code,
          title: course.title,
          description: course.description,
          learningLanguage: course.learning_language_code,
          translationLanguage: course.translation_language_code,
          lessons: lessons.map((lesson) => ({
            id: lesson.id,
            code: lesson.code,
            title: lesson.title,
            description: lesson.description,
            ordinal: lesson.ordinal,
            learningLanguage: lesson.learning_language_code,
            translationLanguage: lesson.translation_language_code,
            learningLanguageLabel: lesson.learning_language_code,
          })),
        };
      }),
    );
  }

  async getLessonsByCourseId(
    courseId: string,
    filters: { learningLanguage?: string; translationLanguage?: string } = {},
  ): Promise<{
    course: {
      id: string;
      code: string;
      title: string;
      description: string;
      learningLanguage: string;
      translationLanguage: string;
      learningLanguageLabel: string;
    };
    lessons: Array<{
      id: string;
      code: string;
      title: string;
      description: string;
      ordinal: number;
      learningLanguage: string;
      translationLanguage: string;
      learningLanguageLabel: string;
    }>;
  }> {
    const course = await courseRepository.findActiveCourseById(courseId);
    if (!course) {
      throw new HttpError(404, LEARNING_ERROR_MESSAGES.courseNotFound);
    }
    const lessons = await courseRepository.getActiveLessonsByCourseId(courseId, filters);
    return {
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        learningLanguage: course.learning_language_code,
        translationLanguage: course.translation_language_code,
        learningLanguageLabel: course.learning_language_code,
      },
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        code: lesson.code,
        title: lesson.title,
        description: lesson.description,
        ordinal: lesson.ordinal,
        learningLanguage: lesson.learning_language_code,
        translationLanguage: lesson.translation_language_code,
        learningLanguageLabel: lesson.learning_language_code,
      })),
    };
  }

  async getLessonById(lessonId: string): Promise<{
    id: string;
    code: string;
    title: string;
    description: string;
    ordinal: number;
    courseId: string;
    learningLanguage: string;
    translationLanguage: string;
    words: Array<{
      en: string;
      ua: string;
      learningText: string;
      translationText: string;
      learningLanguage: string;
      translationLanguage: string;
      ordinal: number;
    }>;
    phrases: Array<{
      en: string;
      ua: string;
      learningText: string;
      translationText: string;
      learningLanguage: string;
      translationLanguage: string;
      ordinal: number;
    }>;
    dialogueScenes: Array<{
      dialogueIndex: number;
      promptType: string | null;
      svgPath: string;
      altTextUa: string;
    }>;
  }> {
    const lesson = await lessonRepository.findActiveLessonById(lessonId);
    if (!lesson) {
      throw new HttpError(404, LEARNING_ERROR_MESSAGES.lessonNotFound);
    }
    const [words, phrases] = await Promise.all([
      lessonRepository.getWordsByLessonId(lessonId),
      lessonRepository.getPhrasesByLessonId(lessonId),
    ]);

    let sceneRows: LessonDialogueSceneRecord[] = [];
    try {
      sceneRows = await lessonSceneRepository.getScenesByLessonId(lessonId);
    } catch (error) {
      logger.info("learning.lesson.scenes.db_read_failed", {
        lessonId,
        lessonCode: lesson.code,
        message: error instanceof Error ? error.message : String(error),
      });
      sceneRows = [];
    }

    if (sceneRows.length === 0) {
      const fallbackRows = MVP_LESSON_SCENE_FALLBACK_BY_LESSON_CODE[lesson.code];
      if (fallbackRows && fallbackRows.length > 0) {
        sceneRows = [...fallbackRows];
        logger.info("learning.lesson.scenes.fallback_used", { lessonId, lessonCode: lesson.code });
      }
    }

    const dialogueScenes = sceneRows.map((row) => ({
      dialogueIndex: row.dialogue_index,
      promptType: row.prompt_type === "" ? null : row.prompt_type,
      svgPath: `./scenes/${row.asset_slug}.svg`,
      altTextUa: row.alt_text_ua,
    }));

    return {
      id: lesson.id,
      code: lesson.code,
      title: lesson.title,
      description: lesson.description,
      ordinal: lesson.ordinal,
      courseId: lesson.course_id,
      learningLanguage: lesson.learning_language_code,
      translationLanguage: lesson.translation_language_code,
      words: words.map((word) => ({
        en: word.en_text,
        ua: word.ua_text,
        learningText: word.en_text,
        translationText: word.ua_text,
        learningLanguage: lesson.learning_language_code,
        translationLanguage: lesson.translation_language_code,
        ordinal: word.ordinal,
      })),
      phrases: phrases.map((phrase) => ({
        en: phrase.en_text,
        ua: phrase.ua_text,
        learningText: phrase.en_text,
        translationText: phrase.ua_text,
        learningLanguage: lesson.learning_language_code,
        translationLanguage: lesson.translation_language_code,
        ordinal: phrase.ordinal,
      })),
      dialogueScenes,
    };
  }
}

export const learningContentService = new LearningContentService();
