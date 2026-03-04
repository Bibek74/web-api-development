//backend routes
export const API = {
    AUTH: {
        REGISTER: "/api/auth/signup",
        LOGIN: "/api/auth/login",
        FORGOT_PASSWORD: "/api/auth/forgot-password",
        RESET_PASSWORD: "/api/auth/reset-password"
    },
    POST: {
        ALL: "/api/post/all",
        NEW: "/api/post/new",
        MY_POSTS: "/api/post/my-posts",
        UPDATE: (id: string) => `/api/post/update/${id}`,
        DELETE: (id: string) => `/api/post/delete-post/${id}`,
        LIKE_UNLIKE: (id: string) => `/api/post/like-unlike/${id}`,
        FAVORITE_UNFAVORITE: (id: string) => `/api/post/favorite-unfavorite/${id}`,
        COMMENT: (id: string) => `/api/post/comment/${id}`,
        LIKES: (id: string) => `/api/post/user/likes/${id}`
    },
    PROFILE: {
        ME: "/api/profile/me",
        UPDATE: "/api/profile/update",
        DELETE: "/api/profile/delete",
        UPLOAD_IMAGE: "/api/profile/upload-image",
        VISIT: "/api/profile/visit",
        VISIT_BY_ID: (id: string) => `/api/profile/visit/${id}`
    }
}