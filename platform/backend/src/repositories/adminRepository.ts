import { PoolClient } from "pg";
import { dbPool } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { ADMIN_ERROR_MESSAGES } from "../config/adminConstants";
import { logger } from "../utils/logger";

interface CourseRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  is_active: boolean;
}

interface LessonRecord {
  id: string;
  course_id: string;
  code: string;
  title: string;
  description: string;
  ordinal: number;
  is_active: boolean;
}

interface WordRecord {
  id: string;
  lesson_id: string;
  en_text: string;
  ua_text: string;
  ordinal: number;
}

interface PhraseRecord {
  id: string;
  lesson_id: string;
  en_text: string;
  ua_text: string;
  ordinal: number;
}

type EntityType = "course" | "lesson" | "word" | "phrase";
type ActionType = "create" | "update" | "deactivate" | "delete";

const QUERY_INSERT_AUDIT = `
  INSERT INTO admin_audit_logs (admin_user_id, entity_type, entity_id, action, payload)
  VALUES ($1, $2, $3, $4, $5::jsonb)
`;

function buildUpdateQuery(
  tableName: "courses" | "lessons" | "lesson_words" | "lesson_phrases",
  identifierColumn: "id",
  identifierValue: string,
  fields: Record<string, unknown>,
): { query: string; values: unknown[] } {
  const entries = Object.entries(fields).filter((entry) => entry[1] !== undefined);
  if (entries.length === 0) {
    throw new HttpError(400, "No fields provided to update");
  }

  const setClauses = entries.map((entry, index) => `${entry[0]} = $${index + 1}`);
  const values = entries.map((entry) => entry[1]);
  const query = `
    UPDATE ${tableName}
    SET ${setClauses.join(", ")}
    WHERE ${identifierColumn} = $${entries.length + 1}
    RETURNING *
  `;
  return { query, values: [...values, identifierValue] };
}

async function logAudit(
  databaseClient: PoolClient,
  adminUserId: string,
  entityType: EntityType,
  entityId: string,
  action: ActionType,
  payload: Record<string, unknown>,
): Promise<void> {
  await databaseClient.query(QUERY_INSERT_AUDIT, [adminUserId, entityType, entityId, action, JSON.stringify(payload)]);
}

export class AdminRepository {
  async createCourse(
    adminUserId: string,
    input: { code: string; title: string; description: string; isActive: boolean },
  ): Promise<CourseRecord> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.courses.create.start", { adminUserId, code: input.code });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const createdResult = await databaseClient.query<CourseRecord>(
        `
          INSERT INTO courses (code, title, description, is_active)
          VALUES ($1, $2, $3, $4)
          RETURNING id, code, title, description, is_active
        `,
        [input.code, input.title, input.description, input.isActive],
      );
      const created = createdResult.rows[0];
      await logAudit(databaseClient, adminUserId, "course", created.id, "create", input);
      await databaseClient.query("COMMIT");
      logger.info("db.admin.courses.create.success", { adminUserId, courseId: created.id });
      return created;
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      logger.error("db.admin.courses.create.error", error, { adminUserId, code: input.code });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async updateCourse(adminUserId: string, courseId: string, fields: Record<string, unknown>): Promise<CourseRecord> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.courses.update.start", { adminUserId, courseId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const { query, values } = buildUpdateQuery("courses", "id", courseId, fields);
      const updatedResult = await databaseClient.query<CourseRecord>(query, values);
      if (updatedResult.rowCount === 0) {
        throw new HttpError(404, ADMIN_ERROR_MESSAGES.courseNotFound);
      }
      await logAudit(databaseClient, adminUserId, "course", courseId, "update", fields);
      await databaseClient.query("COMMIT");
      logger.info("db.admin.courses.update.success", { adminUserId, courseId });
      return updatedResult.rows[0];
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error("db.admin.courses.update.error", error, { adminUserId, courseId });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async deactivateCourse(adminUserId: string, courseId: string): Promise<void> {
    await this.updateCourse(adminUserId, courseId, { is_active: false });
  }

  async createLesson(
    adminUserId: string,
    input: { courseId: string; code: string; title: string; description: string; ordinal: number; isActive: boolean },
  ): Promise<LessonRecord> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.lessons.create.start", { adminUserId, courseId: input.courseId, code: input.code });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const createdResult = await databaseClient.query<LessonRecord>(
        `
          INSERT INTO lessons (course_id, code, title, description, ordinal, is_active)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, course_id, code, title, description, ordinal, is_active
        `,
        [input.courseId, input.code, input.title, input.description, input.ordinal, input.isActive],
      );
      const created = createdResult.rows[0];
      await logAudit(databaseClient, adminUserId, "lesson", created.id, "create", input);
      await databaseClient.query("COMMIT");
      logger.info("db.admin.lessons.create.success", { adminUserId, lessonId: created.id });
      return created;
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      logger.error("db.admin.lessons.create.error", error, { adminUserId, courseId: input.courseId, code: input.code });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async updateLesson(adminUserId: string, lessonId: string, fields: Record<string, unknown>): Promise<LessonRecord> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.lessons.update.start", { adminUserId, lessonId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const { query, values } = buildUpdateQuery("lessons", "id", lessonId, fields);
      const updatedResult = await databaseClient.query<LessonRecord>(query, values);
      if (updatedResult.rowCount === 0) {
        throw new HttpError(404, ADMIN_ERROR_MESSAGES.lessonNotFound);
      }
      await logAudit(databaseClient, adminUserId, "lesson", lessonId, "update", fields);
      await databaseClient.query("COMMIT");
      logger.info("db.admin.lessons.update.success", { adminUserId, lessonId });
      return updatedResult.rows[0];
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error("db.admin.lessons.update.error", error, { adminUserId, lessonId });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async deactivateLesson(adminUserId: string, lessonId: string): Promise<void> {
    await this.updateLesson(adminUserId, lessonId, { is_active: false });
  }

  async createWord(
    adminUserId: string,
    input: { lessonId: string; enText: string; uaText: string; ordinal: number },
  ): Promise<WordRecord> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.words.create.start", { adminUserId, lessonId: input.lessonId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const createdResult = await databaseClient.query<WordRecord>(
        `
          INSERT INTO lesson_words (lesson_id, en_text, ua_text, ordinal)
          VALUES ($1, $2, $3, $4)
          RETURNING id, lesson_id, en_text, ua_text, ordinal
        `,
        [input.lessonId, input.enText, input.uaText, input.ordinal],
      );
      const created = createdResult.rows[0];
      await logAudit(databaseClient, adminUserId, "word", created.id, "create", input);
      await databaseClient.query("COMMIT");
      logger.info("db.admin.words.create.success", { adminUserId, wordId: created.id });
      return created;
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      logger.error("db.admin.words.create.error", error, { adminUserId, lessonId: input.lessonId });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async updateWord(adminUserId: string, wordId: string, fields: Record<string, unknown>): Promise<WordRecord> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.words.update.start", { adminUserId, wordId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const { query, values } = buildUpdateQuery("lesson_words", "id", wordId, fields);
      const updatedResult = await databaseClient.query<WordRecord>(query, values);
      if (updatedResult.rowCount === 0) {
        throw new HttpError(404, ADMIN_ERROR_MESSAGES.wordNotFound);
      }
      await logAudit(databaseClient, adminUserId, "word", wordId, "update", fields);
      await databaseClient.query("COMMIT");
      logger.info("db.admin.words.update.success", { adminUserId, wordId });
      return updatedResult.rows[0];
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error("db.admin.words.update.error", error, { adminUserId, wordId });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async deleteWord(adminUserId: string, wordId: string): Promise<void> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.words.delete.start", { adminUserId, wordId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const deleteResult = await databaseClient.query("DELETE FROM lesson_words WHERE id = $1", [wordId]);
      if (deleteResult.rowCount === 0) {
        throw new HttpError(404, ADMIN_ERROR_MESSAGES.wordNotFound);
      }
      await logAudit(databaseClient, adminUserId, "word", wordId, "delete", {});
      await databaseClient.query("COMMIT");
      logger.info("db.admin.words.delete.success", { adminUserId, wordId });
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error("db.admin.words.delete.error", error, { adminUserId, wordId });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async createPhrase(
    adminUserId: string,
    input: { lessonId: string; enText: string; uaText: string; ordinal: number },
  ): Promise<PhraseRecord> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.phrases.create.start", { adminUserId, lessonId: input.lessonId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const createdResult = await databaseClient.query<PhraseRecord>(
        `
          INSERT INTO lesson_phrases (lesson_id, en_text, ua_text, ordinal)
          VALUES ($1, $2, $3, $4)
          RETURNING id, lesson_id, en_text, ua_text, ordinal
        `,
        [input.lessonId, input.enText, input.uaText, input.ordinal],
      );
      const created = createdResult.rows[0];
      await logAudit(databaseClient, adminUserId, "phrase", created.id, "create", input);
      await databaseClient.query("COMMIT");
      logger.info("db.admin.phrases.create.success", { adminUserId, phraseId: created.id });
      return created;
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      logger.error("db.admin.phrases.create.error", error, { adminUserId, lessonId: input.lessonId });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async updatePhrase(adminUserId: string, phraseId: string, fields: Record<string, unknown>): Promise<PhraseRecord> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.phrases.update.start", { adminUserId, phraseId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const { query, values } = buildUpdateQuery("lesson_phrases", "id", phraseId, fields);
      const updatedResult = await databaseClient.query<PhraseRecord>(query, values);
      if (updatedResult.rowCount === 0) {
        throw new HttpError(404, ADMIN_ERROR_MESSAGES.phraseNotFound);
      }
      await logAudit(databaseClient, adminUserId, "phrase", phraseId, "update", fields);
      await databaseClient.query("COMMIT");
      logger.info("db.admin.phrases.update.success", { adminUserId, phraseId });
      return updatedResult.rows[0];
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error("db.admin.phrases.update.error", error, { adminUserId, phraseId });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }

  async deletePhrase(adminUserId: string, phraseId: string): Promise<void> {
    let databaseClient: PoolClient | null = null;
    try {
      logger.info("db.admin.phrases.delete.start", { adminUserId, phraseId });
      databaseClient = await dbPool.connect();
      await databaseClient.query("BEGIN");
      const deleteResult = await databaseClient.query("DELETE FROM lesson_phrases WHERE id = $1", [phraseId]);
      if (deleteResult.rowCount === 0) {
        throw new HttpError(404, ADMIN_ERROR_MESSAGES.phraseNotFound);
      }
      await logAudit(databaseClient, adminUserId, "phrase", phraseId, "delete", {});
      await databaseClient.query("COMMIT");
      logger.info("db.admin.phrases.delete.success", { adminUserId, phraseId });
    } catch (error) {
      if (databaseClient) {
        await databaseClient.query("ROLLBACK");
      }
      if (error instanceof HttpError) {
        throw error;
      }
      logger.error("db.admin.phrases.delete.error", error, { adminUserId, phraseId });
      throw new HttpError(500, ADMIN_ERROR_MESSAGES.adminMutationFailed);
    } finally {
      databaseClient?.release();
    }
  }
}

export const adminRepository = new AdminRepository();
