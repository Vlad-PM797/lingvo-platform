"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
exports.logoutSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
