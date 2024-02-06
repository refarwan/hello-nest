import { IsNotEmpty, IsStrongPassword } from 'class-validator'

export class UpdatePasswordDto {
	@IsNotEmpty()
	current_password: string

	@IsNotEmpty()
	@IsStrongPassword()
	new_password: string

	@IsNotEmpty()
	@IsStrongPassword()
	confirm_password: string
}
