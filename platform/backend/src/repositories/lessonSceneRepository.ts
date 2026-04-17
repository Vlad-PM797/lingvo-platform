import { dbPool } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { LEARNING_ERROR_MESSAGES } from "../config/learningConstants";
import { logger } from "../utils/logger";

export type LessonDialogueSceneRecord = {
  dialogue_index: number;
  prompt_type: string;
  asset_slug: string;
  alt_text_ua: string;
};

const QUERY_SCENES_BY_LESSON_ID = `
  SELECT dialogue_index, prompt_type, asset_slug, alt_text_ua
  FROM lesson_dialogue_scenes
  WHERE lesson_id = $1
  ORDER BY dialogue_index ASC, prompt_type ASC
`;

export class LessonSceneRepository {
  async getScenesByLessonId(lessonId: string): Promise<LessonDialogueSceneRecord[]> {
    try {
      logger.info("db.lesson_dialogue_scenes.get_by_lesson_id.start", { lessonId });
      const queryResult = await dbPool.query<LessonDialogueSceneRecord>(QUERY_SCENES_BY_LESSON_ID, [lessonId]);
      logger.info("db.lesson_dialogue_scenes.get_by_lesson_id.success", { lessonId, rowCount: queryResult.rowCount });
      return queryResult.rows;
    } catch (error) {
      logger.error("db.lesson_dialogue_scenes.get_by_lesson_id.error", error, { lessonId });
      throw new HttpError(500, LEARNING_ERROR_MESSAGES.failedToReadLesson);
    }
  }
}

export const lessonSceneRepository = new LessonSceneRepository();
