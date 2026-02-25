import axiosInstance from "./axios";
import { API } from "./endpoints";

export interface Post {
    _id: string;
    user: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    title?: string;
    content: string;
    image?: string;
    date: string;
    likes: string[];
}

export interface PostResponse {
    message: string;
    result: Post[];
    success: boolean;
}

export interface SinglePostResponse {
    message: string;
    result: Post;
    success: boolean;
}

export const postApi = {
    // Fetch all posts
    getAllPosts: async () => {
        const response = await axiosInstance.get<PostResponse>(API.POST.ALL);
        return response.data;
    },

    // Create new post
    createPost: async (title: string, content: string, imageFile?: File | null) => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (imageFile) {
            formData.append("postImage", imageFile);
        }

        const response = await axiosInstance.post<SinglePostResponse>(API.POST.NEW, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },

    // Get user's posts
    getMyPosts: async () => {
        const response = await axiosInstance.get<PostResponse>(API.POST.MY_POSTS);
        return response.data;
    },

    // Update post
    updatePost: async (id: string, title: string, content: string, imageFile?: File | null) => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (imageFile) {
            formData.append("postImage", imageFile);
        }

        const response = await axiosInstance.put<SinglePostResponse>(
            API.POST.UPDATE(id),
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
        return response.data;
    },

    // Delete post
    deletePost: async (id: string) => {
        const response = await axiosInstance.delete(API.POST.DELETE(id));
        return response.data;
    },

    // Like/Unlike post
    likeUnlikePost: async (id: string) => {
        const response = await axiosInstance.post(API.POST.LIKE_UNLIKE(id));
        return response.data;
    },

    // Get post likes
    getPostLikes: async (id: string) => {
        const response = await axiosInstance.get(API.POST.LIKES(id));
        return response.data;
    }
};
