import {
	Controller,
	Post,
	Body,
	Patch,
	ConflictException,
	Req,
	UseGuards,
	BadRequestException,
	ForbiddenException,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'

import { UpdatePasswordDto } from './dto/update-password.dto'

import { compareSync } from 'bcrypt'
import { Public } from 'src/config/configuration'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Public()
	@Post('register')
	async create(@Body() createUserDto: CreateUserDto) {
		const checkEmail = await this.userService.findByEmail(createUserDto.email)

		if (checkEmail) {
			throw new ConflictException('Email not available')
		}

		const checkUsername = await this.userService.findByUsername(
			createUserDto.username,
		)

		if (checkUsername) {
			throw new ConflictException('Username not available')
		}

		await this.userService.create(createUserDto)
		return { message: 'User created' }
	}

	@Patch('update-password')
	async editMyAccount(@Body() body: UpdatePasswordDto, @Req() request) {
		if (body.new_password !== body.confirm_password)
			throw new BadRequestException(
				'new password and confirmation password are not the same',
			)

		const user = await this.userService.findByUsername(request.username)

		if (!user) throw new ForbiddenException("can't find username")

		const checkPassword = compareSync(body.current_password, user.password)

		if (!checkPassword) throw new BadRequestException('wrong current password')

		this.userService.changePassword(request.username, body.new_password)

		return {
			message: 'pasword updated',
		}
	}
}
