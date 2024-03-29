import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
	ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { IS_PUBLIC_KEY } from 'src/config/configuration'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		])
		if (isPublic) {
			// 💡 See this condition
			return true
		}

		const request = context.switchToHttp().getRequest()
		const token = this.extractTokenFromHeader(request)
		if (!token) {
			throw new UnauthorizedException('access token not found')
		}
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: process.env.ACCESS_TOKEN_SECRET,
			})
			// 💡 We're assigning the payload to the request object here
			// so that we can access it in our route handlers
			request['username'] = payload.username
		} catch {
			throw new ForbiddenException('cant verify access token')
		}
		return true
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? []
		return type === 'Bearer' ? token : undefined
	}
}
