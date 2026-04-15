"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authSchemas_1 = require("../schemas/authSchemas");
const logger_1 = require("../utils/logger");
class AuthController {
    async register(request, response) {
        const input = authSchemas_1.registerSchema.parse(request.body);
        logger_1.logger.info("auth.register.attempt", { email: input.email });
        const createdUser = await authService_1.authService.register(input.email, input.password);
        response.status(201).json(createdUser);
    }
    async login(request, response) {
        const input = authSchemas_1.loginSchema.parse(request.body);
        logger_1.logger.info("auth.login.attempt", { email: input.email });
        const tokens = await authService_1.authService.login(input.email, input.password);
        response.status(200).json(tokens);
    }
    async refresh(request, response) {
        const input = authSchemas_1.refreshSchema.parse(request.body);
        logger_1.logger.info("auth.refresh.attempt");
        const tokens = await authService_1.authService.refresh(input.refreshToken);
        response.status(200).json(tokens);
    }
    async logout(request, response) {
        const input = authSchemas_1.logoutSchema.parse(request.body);
        logger_1.logger.info("auth.logout.attempt");
        await authService_1.authService.logout(input.refreshToken);
        response.status(200).json({ success: true });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
