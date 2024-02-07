import {
	Body,
	Controller,
	HttpCode,
	Post,
	NotFoundException,
	UnauthorizedException,
	Res,
	Delete,
	Req,
	Get,
	UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { compareSync } from 'bcrypt'

import { Request, Response } from 'express'
import { Public } from 'src/config/configuration'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('')
	@HttpCode(200)
	async login(
		@Body() body: LoginDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const user = await this.authService.loginFindUser(body.username)

		if (!user) throw new NotFoundException('username or email not found')

		const checkPassword = compareSync(body.password, user.password)
		if (!checkPassword) throw new UnauthorizedException('wrong password')

		const accessToken = this.authService.createAccessToken({
			username: user.username,
			name: user.name,
		})

		const refreshToken = this.authService.createRefreshToken({
			username: user.username,
		})

		response.cookie('refresh_token', refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
		})

		this.authService.addRefreshToken({ token: refreshToken, userId: user.id })
		this.authService.deleteExpiredRefreshToken(user.id)

		return {
			access_token: accessToken,
		}
	}

	@Public()
	@Delete()
	delete(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const refreshToken: undefined | string = request.cookies.refresh_token

		if (!refreshToken)
			throw new UnauthorizedException('Refresh token not found')

		this.authService.deleteRefreshToken(refreshToken)
		response.clearCookie('refresh_token')

		return {
			message: 'auth deleted',
		}
	}

	@Public()
	@Get('new-token')
	async newToken(@Req() request: Request) {
		const refreshToken: undefined | string = request.cookies.refresh_token

		if (!refreshToken)
			throw new UnauthorizedException('Refresh token not found')

		const newToken = await this.authService.newAccessToken(refreshToken)
		if (!newToken) throw new UnauthorizedException('invalid refresh token')

		return {
			access_token: newToken,
		}
	}
}
