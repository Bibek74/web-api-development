import axiosInstance from "./axios";
import { API } from "./endpoints";
import { Post } from "./posts";

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
    posts: Post[];
}

export interface PublicUserProfile {
    _id: string;
    name: string;
    role: string;
    profileImage?: string;
}

export interface ProfileResponse {
    message: string;
    posts?: Post[];
    result?: UserProfile;
    success: boolean;
}

export interface PublicProfileResponse {
    message: string;
    posts?: Post[];
    result?: PublicUserProfile;
    success: boolean;
}

export const profileApi = {
    // Get my profile
    getMyProfile: async () => {
        const response = await axiosInstance.get<ProfileResponse>(API.PROFILE.ME);
        return response.data;
    },

    // Update profile
    updateProfile: async (data: { name: string; email: string }) => {
        const response = await axiosInstance.put<ProfileResponse>(API.PROFILE.UPDATE, data);
        return response.data;
    },

    // Delete profile
    deleteProfile: async (password: string) => {
        const response = await axiosInstance.delete(API.PROFILE.DELETE, {
            data: { password }
        });
        return response.data;
    },

    // Upload profile image
    uploadProfileImage: async (file: File) => {
        const formData = new FormData();
        formData.append("profileImage", file);
        
        const response = await axiosInstance.put<ProfileResponse>(
            API.PROFILE.UPLOAD_IMAGE,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    // Visit other profiles
    visitProfiles: async () => {
        const response = await axiosInstance.get(API.PROFILE.VISIT);
        return response.data;
    },

    // Get public profile by id
    getPublicProfileById: async (id: string) => {
        const response = await axiosInstance.get<PublicProfileResponse>(API.PROFILE.VISIT_BY_ID(id));
        return response.data;
    }
};
