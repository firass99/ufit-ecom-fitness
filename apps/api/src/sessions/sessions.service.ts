import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { ConfigType } from '@nestjs/config';
import refreshJwtConfig from 'src/auth/configs/refreshJwt.config';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaClient,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async create(userId: string, refreshToken: string | null) {
    const hashedRefreshToken = refreshToken
      ? await argon2.hash(refreshToken)
      : null;

    return await this.prisma.session.create({
      data: {
        userId,
        refreshToken: hashedRefreshToken,
      },
      include: { user: true }, // Ensure the related user is included
    });
  }

  // async create(userId: string, refreshToken: string | null) {
  //     if (refreshToken === null) {
  //         return await this.prisma.session.create({
  //             data: {
  //                 userId,
  //                 refreshToken: null,
  //             },
  //         });
  //     }

  //     const hashedRefreshToken = await argon2.hash(refreshToken);
  //     return await this.prisma.session.create({
  //         data: {
  //             userId,
  //             refreshToken: hashedRefreshToken,
  //         },
  //     });
  // }

  // async findById(sessionId: string) {
  //     return await this.prisma.session.findUnique({
  //         where: { id: sessionId },
  //     });
  // }

  // async findByUserId(userId: string) {
  //     return await this.prisma.session.findUnique({
  //         where: { userId },
  //         include: { user: true }, // Ensure user details are fetched
  //     });
  // }

  async getSessionsByUserId(userId: string) {
    return await this.prisma.session.findMany({
      where: { userId },
    });
  }

  async updateOrCreateSession(userId: string, hashedRefreshToken: string) {
    return await this.prisma.session.upsert({
      where: { userId },
      update: { refreshToken: hashedRefreshToken, valid: true },
      create: { userId, refreshToken: hashedRefreshToken, valid: true },
    });
  }

  async findByUserId(userId: string) {
    return await this.prisma.session.findUnique({
      where: { userId },
      include: { user: true }, // Ensure user details are fetched
    });
  }

  async findById(sessionId: string) {
    return await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }, // Ensure user details are fetched
    });
  }

  // async updateSession(identifier: string, hashedRefreshToken: string) {
  //     try {
  //         // First, try to update by sessionId
  //         const sessionUpdate = await this.prisma.session.update({
  //             where: { id: identifier },
  //             data: { refreshToken: hashedRefreshToken, valid: true },
  //         });
  //         return sessionUpdate;
  //     } catch (error) {
  //         // If update by sessionId fails, try to update by userId
  //         return await this.prisma.session.update({
  //             where: { userId: identifier },
  //             data: { refreshToken: hashedRefreshToken, valid: true },
  //         });
  //     }
  // }

  async invalidateAllUserSessions(userId: string) {
    console.log(`Invalidating all sessions for user: ${userId}`);
    return await this.prisma.session.updateMany({
      where: { userId },
      data: { valid: false },
    });
  }

  async invalidateSessionById(sessionId: string) {
    console.log(`Invalidating session: ${sessionId}`);
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { valid: false },
    });
  }

  async invalidateSession(sessionId: string) {
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { valid: false },
    });
  }

  async deleteSession(sessionId: string) {
    return await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }
}
