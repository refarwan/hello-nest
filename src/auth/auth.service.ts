import { Injectable, UnauthorizedException } from '@nestjs/common'

import { PrismaService } from 'src/prisma.service'

import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { DateTime } from 'luxon'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	async loginFindUser(usernameOrEmail: string): Promise<null | User> {
		const user = await this.prisma.user.findFirst({
			where: {
				OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
			},
		})

		return user
	}

	createAccessToken(payload: {}) {
		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get<string>('accessTokenSecret'),
			expiresIn: '1m',
		})
		return accessToken
	}

	createRefreshToken(payload: {}) {
		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.get<string>('refreshTokenSecret'),
			expiresIn: '30d',
		})

		return refreshToken
	}

	async addRefreshToken({ token, userId }: { token: string; userId: number }) {
		const expirationTime = Math.floor(
			DateTime.now().plus({ days: 30 }).toSeconds(),
		)

		await this.prisma.refreshToken.create({
			data: {
				userId,
				token,
				expirationTime,
			},
		})
	}

	async deleteExpiredRefreshToken(userId: number) {
		const timeNow = Math.floor(DateTime.now().toSeconds())
		await this.prisma.refreshToken.deleteMany({
			where: {
				userId,
				expirationTime: {
					lt: timeNow,
				},
			},
		})
	}

	async deleteRefreshToken(token: string) {
		await this.prisma.refreshToken.delete({
			where: {
				token: token,
			},
		})
	}

	async newAccessToken(token: string): Promise<null | string> {
		const tokenData = await this.prisma.refreshToken.findUnique({
			where: {
				token: token,
			},
			include: {
				user: {
					select: {
						username: true,
						name: true,
					},
				},
			},
		})

		if (!tokenData) return null

		const accessToken = this.createAccessToken({
			username: tokenData.user.username,
			name: tokenData.user.name,
		})

		return accessToken
	}

	async accessTokenGuard() {
		throw new UnauthorizedException('wrong password')
	}
}
