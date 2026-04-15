import { LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { HttpError } from "../middleware/errorHandler";
import { courseRepository } from "../repositories/courseRepository";
import { lessonRepository } from "../repositories/lessonRepository";

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

  async getLessonById(lessonId: string): Promise<{
    id: string;
    code: string;
    title: string;
    description: string;
    ordinal: number;
    courseId: string;
    words: Array<{ en: string; ua: string; ordinal: number }>;
    phrases: Array<{ en: string; ua: string; ordinal: number }>;
  }> {
    const lesson = await lessonRepository.findActiveLessonById(lessonId);
    if (!lesson) {
      throw new HttpError(404, LEARNING_ERROR_MESSAGES.lessonNotFound);
    }
    const [words, phrases] = await Promise.all([
      lessonRepository.getWordsByLessonId(lessonId),
      lessonRepository.getPhrasesByLessonId(lessonId),
    ]);

    return {
      id: lesson.id,
      code: lesson.code,
      title: lesson.title,
      description: lesson.description,
      ordinal: lesson.ordinal,
      courseId: lesson.course_id,
      words: words.map((word) => ({ en: word.en_text, ua: word.ua_text, ordinal: word.ordinal })),
      phrases: phrases.map((phrase) => ({ en: phrase.en_text, ua: phrase.ua_text, ordinal: phrase.ordinal })),
    };
  }
}

export const learningContentService = new LearningContentService();
