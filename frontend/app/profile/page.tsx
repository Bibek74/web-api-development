"use client";

import { useEffect, useState } from "react";
import { profileApi, UserProfile } from "@/lib/api/profile";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState({ name: "", email: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setAuthError(false);
            const response = await profileApi.getMyProfile();
            if (response.success) {
                // Extract user data from the response
                const userData = {
                    _id: "",
                    name: "",
                    email: "",
                    role: "",
                    posts: response.posts || [],
                    profileImage: ""
                };
                
                // Get user data from cookies
                const userCookie = document.cookie
                    .split("; ")
                    .find(row => row.startsWith("user="));
                
                if (userCookie) {
                    const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
                    userData._id = user._id;
                    userData.name = user.name;
                    userData.email = user.email;
                    userData.role = user.role;
                }

                setProfile(userData as UserProfile);
                setPosts(response.posts || []);
                setEditData({ name: userData.name, email: userData.email });
            }
        } catch (error: any) {
            console.error("Error fetching profile:", error);
            if (error.response?.status === 401) {
                setAuthError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setIsSaving(true);
            const response = await profileApi.updateProfile(editData);
            if (response.success && response.result) {
                setProfile(prev => prev ? { ...prev, ...response.result } : null);
                setIsEditMode(false);
                
                // Update cookie
                document.cookie = `user=${encodeURIComponent(JSON.stringify(response.result))}; path=/; sameSite=lax`;
                
                alert("Profile updated successfully!");
            } else {
                alert(response.message || "Failed to update profile");
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Error updating profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size should be less than 5MB");
            return;
        }

        try {
            setUploadingImage(true);
            const response = await profileApi.uploadProfileImage(file);
            if (response.success && response.result) {
                setProfile(prev => prev ? { ...prev, profileImage: response.result!.profileImage } : null);
                alert("Profile image uploaded successfully!");
            } else {
                alert(response.message || "Failed to upload image");
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Error uploading image");
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 pt-20">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="container mx-auto px-4 py-8 pt-20 max-w-2xl">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
                
                {/* Profile Info Section */}
                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6">
                        {/* Profile Image */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                                {profile.profileImage ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${profile.profileImage}`}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                                        {profile.name[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="profile-image"
                                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg"
                            >
                                {uploadingImage ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </label>
                            <input
                                id="profile-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploadingImage}
                            />
                        </div>

                        {/* Name and Role */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                            <p className="text-gray-600">{profile.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                {profile.role}
                            </span>
                        </div>

                        {/* Edit Button */}
                        {!isEditMode && (
                            <button
                                onClick={() => setIsEditMode(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Edit Form */}
                    {isEditMode && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        minLength={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                                    >
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setEditData({ name: profile.name, email: profile.email });
                                        }}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600">{posts.length}</div>
                            <div className="text-gray-600 text-sm">Blog Posts</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0)}
                            </div>
                            <div className="text-gray-600 text-sm">Total Likes</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-green-600">{profile.role === "admin" ? "Admin" : "User"}</div>
                            <div className="text-gray-600 text-sm">Account Type</div>
                        </div>
                    </div>

                    {/* My Posts */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Blog Posts</h2>
                        {posts.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">You haven't posted anything yet.</p>
                                <button
                                    onClick={() => router.push('/blogs')}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Your First Post
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post: any) => (
                                    <div key={post._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm text-gray-500">
                                                {new Date(post.date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                            <span className="text-sm text-gray-600">
                                                ❤️ {post.likes?.length || 0} likes
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{post.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
