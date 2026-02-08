//backend routes
export const API = {
    AUTH: {
        REGISTER: "/api/auth/signup",
        LOGIN: "/api/auth/login"
    },
    POST: {
        ALL: "/api/post/all",
        NEW: "/api/post/new",
        MY_POSTS: "/api/post/my-posts",
        UPDATE: (id: string) => `/api/post/update/${id}`,
        DELETE: (id: string) => `/api/post/delete-post/${id}`,
        LIKE_UNLIKE: (id: string) => `/api/post/like-unlike/${id}`,
        LIKES: (id: string) => `/api/post/user/likes/${id}`
    },
    PROFILE: {
        ME: "/api/profile/me",
        UPDATE: "/api/profile/update",
        DELETE: "/api/profile/delete",
        UPLOAD_IMAGE: "/api/profile/upload-image",
        VISIT: "/api/profile/visit"
    }
}