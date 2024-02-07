import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'

@Module({
	imports: [
		UserModule,
		AuthModule,
		ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
