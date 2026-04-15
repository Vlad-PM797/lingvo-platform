"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const sessionRepository_1 = require("../repositories/sessionRepository");
const userRepository_1 = require("../repositories/userRepository");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    async register(email, password) {
        const existingUser = await userRepository_1.userRepository.findByEmail(email);
        if (existingUser) {
            throw new errorHandler_1.HttpError(409, "User already exists");
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const createdUser = await userRepository_1.userRepository.createUser(email, passwordHash);
        return { userId: createdUser.id, email: createdUser.email };
    }
    async login(email, password) {
        const user = await userRepository_1.userRepository.findByEmail(email);
        if (!user) {
            throw new errorHandler_1.HttpError(401, "Invalid credentials");
        }
        const passwordIsValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordIsValid) {
            throw new errorHandler_1.HttpError(401, "Invalid credentials");
        }
        const accessToken = this.signAccessToken(user.id);
        const refreshToken = this.signRefreshToken(user.id);
        await sessionRepository_1.sessionRepository.createSession(user.id, this.hashToken(refreshToken), new Date(Date.now() + env_1.env.jwtRefreshTtlDays * 24 * 60 * 60 * 1000));
        return { accessToken, refreshToken };
    }
    async refresh(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        const refreshTokenHash = this.hashToken(refreshToken);
        const existingSession = await sessionRepository_1.sessionRepository.findByRefreshTokenHash(refreshTokenHash);
        if (!existingSession) {
            throw new errorHandler_1.HttpError(401, "Invalid refresh token");
        }
        if (new Date(existingSession.expires_at).getTime() < Date.now()) {
            await sessionRepository_1.sessionRepository.deleteByRefreshTokenHash(refreshTokenHash);
            throw new errorHandler_1.HttpError(401, "Refresh token expired");
        }
        await sessionRepository_1.sessionRepository.deleteByRefreshTokenHash(refreshTokenHash);
        const nextAccessToken = this.signAccessToken(payload.sub);
        const nextRefreshToken = this.signRefreshToken(payload.sub);
        await sessionRepository_1.sessionRepository.createSession(payload.sub, this.hashToken(nextRefreshToken), new Date(Date.now() + env_1.env.jwtRefreshTtlDays * 24 * 60 * 60 * 1000));
        return { accessToken: nextAccessToken, refreshToken: nextRefreshToken };
    }
    async logout(refreshToken) {
        await sessionRepository_1.sessionRepository.deleteByRefreshTokenHash(this.hashToken(refreshToken));
    }
    signAccessToken(userId) {
        return jsonwebtoken_1.default.sign({ sub: userId, typ: "access" }, env_1.env.jwtAccessSecret, {
            expiresIn: this.parseAccessTtlToSeconds(env_1.env.jwtAccessTtl),
        });
    }
    signRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ sub: userId, typ: "refresh" }, env_1.env.jwtRefreshSecret, {
            expiresIn: env_1.env.jwtRefreshTtlDays * 24 * 60 * 60,
        });
    }
    verifyRefreshToken(refreshToken) {
        try {
            const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwtRefreshSecret);
            if (!payload?.sub || payload.typ !== "refresh") {
                throw new errorHandler_1.HttpError(401, "Invalid refresh token");
            }
            return payload;
        }
        catch {
            throw new errorHandler_1.HttpError(401, "Invalid or expired refresh token");
        }
    }
    hashToken(token) {
        return crypto_1.default.createHash("sha256").update(token).digest("hex");
    }
    parseAccessTtlToSeconds(accessTtl) {
        const ttlValue = accessTtl.trim().toLowerCase();
        if (/^\d+$/.test(ttlValue)) {
            return Number(ttlValue);
        }
        const matched = ttlValue.match(/^(\d+)(s|m|h|d)$/);
        if (!matched) {
            return 15 * 60;
        }
        const amount = Number(matched[1]);
        const unit = matched[2];
        switch (unit) {
            case "s":
                return amount;
            case "m":
                return amount * 60;
            case "h":
                return amount * 60 * 60;
            case "d":
                return amount * 24 * 60 * 60;
            default:
                return 15 * 60;
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
