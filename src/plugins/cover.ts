import config from '@/config'

export const emptyCover = require('@/assets/empty_cover.jpg')

export const emptyAvatar = require('@/assets/empty_avatar.jpg')

export default {
    animationOrEmpty(cover: string | null): string {
        return cover ? `${config.SERVER_URL}/api/database/cover/animation/${cover}` : emptyCover
    },
    staffOrEmpty(cover: string | null): string {
        return cover ? `${config.SERVER_URL}/api/database/cover/staff/${cover}` : emptyAvatar
    },
    animationOrNull(cover: string | null): string | null {
        return cover ? `${config.SERVER_URL}/api/database/cover/animation/${cover}` : null
    },
    staffOrNull(cover: string | null): string | null {
        return cover ? `${config.SERVER_URL}/api/database/cover/staff/${cover}` : null
    },
    userOrEmpty(cover: string | null): string {
        return cover ? `${config.BASIC_SERVICE_URL}/static/cover/${cover}` : emptyAvatar
    }
}
