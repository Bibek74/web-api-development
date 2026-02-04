//backend routes
export const API = {
    AUTH: {
        REGISTER: "/api/auth/signup",
        LOGIN: "/api/auth/login"
    },
    ADMIN: {
        USERS: {
            LIST: "/api/admin/users",
            BY_ID: (id: string) => `/api/admin/users/${id}`,
            DELETE: (id: string) => `/api/admin/users/${id}`
        }
    }
}