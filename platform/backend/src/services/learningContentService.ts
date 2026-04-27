import { LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { MVP_LESSON_SCENE_FALLBACK_BY_LESSON_CODE } from "../config/mvpLessonSceneFallback";
import { HttpError } from "../middleware/errorHandler";
import { courseRepository } from "../repositories/courseRepository";
import { lessonRepository } from "../repositories/lessonRepository";
import { lessonSceneRepository, type LessonDialogueSceneRecord } from "../repositories/lessonSceneRepository";
import { logger } from "../utils/logger";

export class LearningContentService {
  async getCoursesWithLessons(): Promise<
    Array<{
      id: string;
      code: string;
      title: string;
      description: string;
      lessons: Array<{
        id: string;
        code: string;
        title: string;
        description: string;
        ordinal: number;
      }>;
    }>
  > {
    const courses = await courseRepository.getActiveCourses();
    return Promise.all(
      courses.map(async (course) => {
        const lessons = await courseRepository.getActiveLessonsByCourseId(course.id);
        return {
          id: course.id,
          code: course.code,
          title: course.title,
          description: course.description,
          lessons: lessons.map((lesson) => ({
            id: lesson.id,
            code: lesson.code,
            title: lesson.title,
            description: lesson.description,
            ordinal: lesson.ordinal,
          })),
        };
      }),
    );
  }

  async getLessonsByCourseId(courseId: string): Promise<{
    course: { id: string; code: string; title: string; description: string };
    lessons: Array<{ id: string; code: string; title: string; description: string; ordinal: number }>;
  }> {
    const course = await courseRepository.findActiveCourseById(courseId);
    if (!course) {
      throw new HttpError(404, LEARNING_ERROR_MESSAGES.courseNotFound);
    }
    const lessons = await courseRepository.getActiveLessonsByCourseId(courseId);
    return {
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
      },
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        code: lesson.code,
        title: lesson.title,
        description: lesson.description,
        ordinal: lesson.ordinal,
      })),
    };
  }

  async getLessonById(lessonId: string, targetLang: "en" | "it" = "en"): Promise<{
    id: string;
    code: string;
    title: string;
    description: string;
    ordinal: number;
    courseId: string;
    targetLang: "en" | "it";
    words: Array<{ en: string; ua: string; ordinal: number }>;
    phrases: Array<{ en: string; ua: string; ordinal: number }>;
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
      lessonRepository.getWordsByLessonId(lessonId, targetLang),
      lessonRepository.getPhrasesByLessonId(lessonId, targetLang),
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
      targetLang,
      words: words.map((word) => ({ en: word.target_text, ua: word.ua_text, ordinal: word.ordinal })),
      phrases: phrases.map((phrase) => ({ en: phrase.target_text, ua: phrase.ua_text, ordinal: phrase.ordinal })),
      dialogueScenes,
    };
  }
}

export const learningContentService = new LearningContentService();
