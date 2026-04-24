import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sessionRepository } from "../repositories/sessionRepository";
import { userRepository } from "../repositories/userRepository";
import { HttpError } from "../middleware/errorHandler";

interface AccessTokenPayload {
  sub: string;
  typ: "access";
}

interface RefreshTokenPayload {
  sub: string;
  typ: "refresh";
}

export class AuthService {
  async register(email: string, password: string): Promise<{ userId: string; email: string }> {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new HttpError(409, "User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const createdUser = await userRepository.createUser(email, passwordHash);
    return { userId: createdUser.id, email: createdUser.email };
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; userId: string; email: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const passwordIsValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordIsValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);
    await sessionRepository.createSession(
      user.id,
      this.hashToken(refreshToken),
      new Date(Date.now() + env.jwtRefreshTtlDays * 24 * 60 * 60 * 1000),
    );
    return { accessToken, refreshToken, userId: user.id, email: user.email };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.verifyRefreshToken(refreshToken);
    const refreshTokenHash = this.hashToken(refreshToken);
    const existingSession = await sessionRepository.findByRefreshTokenHash(refreshTokenHash);
    if (!existingSession) {
      throw new HttpError(401, "Invalid refresh token");
    }

    if (new Date(existingSession.expires_at).getTime() < Date.now()) {
      await sessionRepository.deleteByRefreshTokenHash(refreshTokenHash);
      throw new HttpError(401, "Refresh token expired");
    }

    await sessionRepository.deleteByRefreshTokenHash(refreshTokenHash);
    const nextAccessToken = this.signAccessToken(payload.sub);
    const nextRefreshToken = this.signRefreshToken(payload.sub);
    await sessionRepository.createSession(
      payload.sub,
      this.hashToken(nextRefreshToken),
      new Date(Date.now() + env.jwtRefreshTtlDays * 24 * 60 * 60 * 1000),
    );
    return { accessToken: nextAccessToken, refreshToken: nextRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await sessionRepository.deleteByRefreshTokenHash(this.hashToken(refreshToken));
  }

  private signAccessToken(userId: string): string {
    return jwt.sign({ sub: userId, typ: "access" }, env.jwtAccessSecret, {
      expiresIn: this.parseAccessTtlToSeconds(env.jwtAccessTtl),
    });
  }

  private signRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId, typ: "refresh" }, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshTtlDays * 24 * 60 * 60,
    });
  }

  private verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as RefreshTokenPayload;
      if (!payload?.sub || payload.typ !== "refresh") {
        throw new HttpError(401, "Invalid refresh token");
      }
      return payload;
    } catch {
      throw new HttpError(401, "Invalid or expired refresh token");
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private parseAccessTtlToSeconds(accessTtl: string): number {
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

export const authService = new AuthService();
