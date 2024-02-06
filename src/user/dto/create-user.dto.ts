import { IsAlpha, IsEmail, IsNotEmpty } from 'class-validator'

export class CreateUserDto {
	@IsNotEmpty()
	@IsAlpha()
	username: string

	@IsNotEmpty()
	name: string

	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsNotEmpty()
	password: string
}
