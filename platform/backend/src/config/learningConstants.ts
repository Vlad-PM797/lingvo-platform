export const LEARNING_CONSTANTS = Object.freeze({
  completionTargetPercent: 70,
  promptTypeMaxLength: 64,
  textFieldMaxLength: 500,
  minAnswerLength: 1,
  comparisonWhitespacePattern: /\s+/g,
});

export const LEARNING_ERROR_MESSAGES = Object.freeze({
  unauthorized: "Unauthorized request",
  courseNotFound: "Course not found",
  lessonNotFound: "Lesson not found",
  failedToReadCourses: "Failed to read courses",
  failedToReadLessons: "Failed to read lessons",
  failedToReadLesson: "Failed to read lesson",
  failedToSaveAttempt: "Failed to save attempt",
  failedToReadProgress: "Failed to read progress",
});
