//backend routes
export const API = {
    AUTH: {
<<<<<<< HEAD
        REGISTER: "/api/auth/signup",
        LOGIN: "/api/auth/login"
    },
    ADMIN: {
        USERS: {
            LIST: "/api/admin/users",
            BY_ID: (id: string) => `/api/admin/users/${id}`,
            DELETE: (id: string) => `/api/admin/users/${id}`
        }
=======
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login"
>>>>>>> 73a061defa90ed1972e6196403ab71724714d0af
    }
}