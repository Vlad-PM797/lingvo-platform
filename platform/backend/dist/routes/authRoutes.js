"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const asyncHandler_1 = require("../utils/asyncHandler");
const authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authRouter = (0, express_1.Router)();
exports.authRouter.use(authRateLimit);
exports.authRouter.post("/register", (0, asyncHandler_1.asyncHandler)((request, response) => authController_1.authController.register(request, response)));
exports.authRouter.post("/login", (0, asyncHandler_1.asyncHandler)((request, response) => authController_1.authController.login(request, response)));
exports.authRouter.post("/refresh", (0, asyncHandler_1.asyncHandler)((request, response) => authController_1.authController.refresh(request, response)));
exports.authRouter.post("/logout", (0, asyncHandler_1.asyncHandler)((request, response) => authController_1.authController.logout(request, response)));
