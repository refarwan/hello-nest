import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { PrismaService } from 'src/prisma.service'

import { User } from '@prisma/client'
import { hashSync } from 'bcrypt'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findByEmail(email: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { email },
		})

		return user
	}

	async findByUsername(username: string): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: {
				username,
			},
		})

		return user
	}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const hashedPassword = hashSync(createUserDto.password, 10)

		const user = await this.prisma.user.create({
			data: {
				username: createUserDto.username,
				email: createUserDto.email,
				name: createUserDto.name,
				password: hashedPassword,
			},
		})

		return user
	}

	async changePassword(username: string, password: string) {
		return await this.prisma.user.update({
			data: {
				password: hashSync(password, 10),
			},
			where: {
				username,
			},
		})
	}
}
