import express from "express";
import helmet from "helmet";
import { healthRouter } from "./routes/healthRoutes";
import { authRouter } from "./routes/authRoutes";
import { learningContentRouter } from "./routes/learningContentRoutes";
import { learningProgressRouter } from "./routes/learningProgressRoutes";
import { adminRouter } from "./routes/adminRoutes";
import { errorHandler, HttpError } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { requestContextMiddleware } from "./middleware/requestContextMiddleware";
import { corsMiddleware } from "./middleware/corsMiddleware";

export function buildApp() {
  const app = express();

  app.use(helmet());
  app.use(requestContextMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  app.get("/", (_request, response) => {
    response.status(200).json({ service: "lingvo-backend", status: "ok" });
  });

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/learning", learningContentRouter);
  app.use("/learning", learningProgressRouter);
  app.use("/admin", adminRouter);

  app.use((_request, _response, next) => {
    next(new HttpError(404, "Route not found"));
  });

  app.use(errorHandler);
  return app;
}
