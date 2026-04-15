"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const healthRoutes_1 = require("./routes/healthRoutes");
const authRoutes_1 = require("./routes/authRoutes");
const learningContentRoutes_1 = require("./routes/learningContentRoutes");
const learningProgressRoutes_1 = require("./routes/learningProgressRoutes");
const adminRoutes_1 = require("./routes/adminRoutes");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const requestContextMiddleware_1 = require("./middleware/requestContextMiddleware");
const corsMiddleware_1 = require("./middleware/corsMiddleware");
function buildApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use(requestContextMiddleware_1.requestContextMiddleware);
    app.use(corsMiddleware_1.corsMiddleware);
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(requestLogger_1.requestLogger);
    app.get("/", (_request, response) => {
        response.status(200).json({ service: "lingvo-backend", status: "ok" });
    });
    app.use("/health", healthRoutes_1.healthRouter);
    app.use("/auth", authRoutes_1.authRouter);
    app.use("/learning", learningContentRoutes_1.learningContentRouter);
    app.use("/learning", learningProgressRoutes_1.learningProgressRouter);
    app.use("/admin", adminRoutes_1.adminRouter);
    app.use((_request, _response, next) => {
        next(new errorHandler_1.HttpError(404, "Route not found"));
    });
    app.use(errorHandler_1.errorHandler);
    return app;
}
