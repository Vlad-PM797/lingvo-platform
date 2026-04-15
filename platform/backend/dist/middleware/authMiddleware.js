"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const userRepository_1 = require("../repositories/userRepository");
function requireAuth(request, _response, next) {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        throw new errorHandler_1.HttpError(401, "Missing access token");
    }
    const token = authorizationHeader.slice("Bearer ".length);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
        if (!payload?.sub || payload.typ !== "access") {
            throw new errorHandler_1.HttpError(401, "Invalid access token");
        }
        request.userId = payload.sub;
        next();
    }
    catch {
        throw new errorHandler_1.HttpError(401, "Invalid or expired access token");
    }
}
async function requireAdmin(request, _response, next) {
    requireAuth(request, _response, () => undefined);
    if (!request.userId) {
        throw new errorHandler_1.HttpError(401, "Unauthorized request");
    }
    const user = await userRepository_1.userRepository.findById(request.userId);
    if (!user) {
        throw new errorHandler_1.HttpError(401, "Unauthorized request");
    }
    if (user.role !== "admin") {
        throw new errorHandler_1.HttpError(403, "Admin access required");
    }
    request.userRole = user.role;
    next();
}
