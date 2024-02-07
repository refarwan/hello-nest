export default () => ({
	accessTokenSecret:
		process.env.ACCESS_TOKEN_SECRET ||
		'kajsdliwaakslda2e123dsad324easdsax243rslkdj',

	refreshTokenSecret:
		process.env.REFRESH_TOKEN_SECRET ||
		'sadlasdklaksjasda343adasdadlaksjdlaskdjlkas',
})

import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
