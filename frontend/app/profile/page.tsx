"use client";

import { useEffect, useState } from "react";
import { profileApi, UserProfile } from "@/lib/api/profile";
import { postApi, Post } from "@/lib/api/posts";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { setSessionUser } from "@/lib/user-session";

export default function ProfilePage() {
    const router = useRouter();
    const toast = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState({ name: "", email: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editingPostContent, setEditingPostContent] = useState("");
    const [isUpdatingPost, setIsUpdatingPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
    const POST_PREVIEW_LENGTH = 280;

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setAuthError(false);
            const response = await profileApi.getMyProfile();
            if (response.success && response.result) {
                // Use the profile data directly from backend
                const userData: UserProfile = {
                    _id: response.result._id,
                    name: response.result.name,
                    email: response.result.email,
                    role: response.result.role,
                    profileImage: response.result.profileImage || "",
                    posts: response.posts || []
                };
                
                setProfile(userData);
                setPosts(response.posts || []);
                setEditData({ name: userData.name, email: userData.email });
                setSessionUser({
                    _id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    profileImage: userData.profileImage,
                });
            } else {
                setAuthError(true);
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
                // Update profile with backend response
                setProfile(prev => prev ? { 
                    ...prev, 
                    name: response.result!.name,
                    email: response.result!.email,
                    _id: response.result!._id,
                    role: response.result!.role,
                    profileImage: response.result!.profileImage || prev.profileImage
                } : null);
                setIsEditMode(false);
                setSessionUser({
                    _id: response.result._id,
                    name: response.result.name,
                    email: response.result.email,
                    role: response.result.role,
                    profileImage: response.result.profileImage || "",
                });
                
                toast.success("Profile updated successfully!");
            } else {
                toast.error(response.message || "Failed to update profile");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error updating profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        try {
            setUploadingImage(true);
            const response = await profileApi.uploadProfileImage(file);
            if (response.success && response.result) {
                // Update profile with backend response
                setProfile(prev => prev ? { 
                    ...prev, 
                    profileImage: response.result!.profileImage || "",
                    name: response.result!.name,
                    email: response.result!.email,
                    _id: response.result!._id,
                    role: response.result!.role
                } : null);
                setSessionUser({
                    _id: response.result._id,
                    name: response.result.name,
                    email: response.result.email,
                    role: response.result.role,
                    profileImage: response.result.profileImage || "",
                });
                toast.success("Profile image uploaded successfully!");
            } else {
                toast.error(response.message || "Failed to upload image");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error uploading image");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        const shouldDelete = await toast.confirm("Are you sure you want to delete this post?", "Delete Post");
        if (!shouldDelete) return;

        try {
            const response = await postApi.deletePost(postId);
            if (response.success) {
                setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
                toast.success("Post deleted successfully!");
            } else {
                toast.error(response.message || "Failed to delete post");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error deleting post");
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedContent = newPostContent.trim();
        if (!trimmedContent) {
            toast.error("Post content cannot be empty");
            return;
        }

        try {
            setIsCreatingPost(true);
            const response = await postApi.createPost(trimmedContent);

            if (response.success && response.result) {
                const createdPost: Post = {
                    ...response.result,
                    user: response.result.user || {
                        _id: profile!._id,
                        name: profile!.name,
                        email: profile!.email
                    }
                };

                setPosts((prevPosts) => [createdPost, ...prevPosts]);
                setNewPostContent("");
                toast.success("Post created successfully!");
            } else {
                toast.error(response.message || "Failed to create post");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error creating post");
        } finally {
            setIsCreatingPost(false);
        }
    };

    const handleStartEditPost = (post: Post) => {
        setEditingPostId(post._id);
        setEditingPostContent(post.content);
    };

    const handleCancelEditPost = () => {
        setEditingPostId(null);
        setEditingPostContent("");
    };

    const toggleExpandedPost = (postId: string) => {
        setExpandedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleSaveEditedPost = async () => {
        if (!editingPostId) return;

        const trimmedContent = editingPostContent.trim();
        if (!trimmedContent) {
            toast.error("Post content cannot be empty");
            return;
        }

        try {
            setIsUpdatingPost(true);
            const response = await postApi.updatePost(editingPostId, trimmedContent);

            if (response.success) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === editingPostId
                            ? { ...post, content: trimmedContent }
                            : post
                    )
                );
                setEditingPostId(null);
                setEditingPostContent("");
                toast.success("Post updated successfully!");
            } else {
                toast.error(response.message || "Failed to update post");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error updating post");
        } finally {
            setIsUpdatingPost(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="container mx-auto px-4 py-8 pt-20">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto"></div>
                            <p className="mt-4 text-slate-300 text-lg">Loading your profile...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="container mx-auto px-4 py-8 pt-20 max-w-2xl">
                    <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center">
                        <svg className="w-20 h-20 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h2 className="text-3xl font-bold text-white mb-2">Authentication Required</h2>
                        <p className="text-slate-300 mb-6 text-lg">You need to be logged in to view your profile.</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-purple-500/50"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative container mx-auto px-4 py-8 pt-20 max-w-5xl">
                <div className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                    {/* Header Section with Bold Gradient */}
                    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                        {/* Animated pattern overlay */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                        </div>
                    </div>
                    
                    {/* Profile Info Section */}
                    <div className="px-6 sm:px-8 pb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20 mb-8">
                            {/* Profile Image with Glow Effect */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
                                <div className="relative w-40 h-40 rounded-full border-4 border-slate-800 bg-slate-800 overflow-hidden shadow-2xl ring-4 ring-purple-500/30">
                                    {profile.profileImage ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${profile.profileImage}`}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center text-white text-5xl font-bold">
                                            {profile.name[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="profile-image"
                                    className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full cursor-pointer hover:from-purple-700 hover:to-pink-700 shadow-xl hover:scale-110 transition-transform"
                                >
                                    {uploadingImage ? (
                                        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                    {profile.name}
                                </h1>
                                <p className="text-slate-300 text-lg mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {profile.name}
                                </p>
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-bold rounded-full backdrop-blur-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    {profile.role.toUpperCase()}
                                </span>
                            </div>

                            {/* Edit Button */}
                            {!isEditMode && (
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 font-semibold"
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
                            <div className="bg-slate-700/50 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 transition-all text-white placeholder-slate-500"
                                            required
                                            minLength={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 transition-all text-white placeholder-slate-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 transition-all font-semibold shadow-lg"
                                        >
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditMode(false);
                                                setEditData({ name: profile.name, email: profile.email });
                                            }}
                                            className="px-8 py-3 border border-white/20 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-all font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Stats with Bold Colors */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="relative bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-purple-500/30 hover:scale-105 transition-transform">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl"></div>
                                <svg className="w-12 h-12 text-purple-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="relative text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    {posts.length}
                                </div>
                                <div className="text-slate-300 text-sm font-semibold mt-2">Blog Posts</div>
                            </div>
                            <div className="relative bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-pink-500/30 hover:scale-105 transition-transform">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent rounded-2xl"></div>
                                <svg className="w-12 h-12 text-pink-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <div className="relative text-5xl font-extrabold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                                    {posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0)}
                                </div>
                                <div className="text-slate-300 text-sm font-semibold mt-2">Total Likes</div>
                            </div>
                            <div className="relative bg-gradient-to-br from-blue-600/20 to-cyan-800/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-blue-500/30 hover:scale-105 transition-transform">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl"></div>
                                <svg className="w-12 h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div className="relative text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    {profile.role === "admin" ? "ADMIN" : "USER"}
                                </div>
                                <div className="text-slate-300 text-sm font-semibold mt-2">Account Type</div>
                            </div>
                        </div>

                        {/* Create Post */}
                        <div className="bg-slate-700/40 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">Create Post</h2>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    rows={5}
                                    maxLength={5000}
                                    className="w-full px-4 py-3 border border-white/15 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Write your new blog post..."
                                    required
                                />
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-slate-400">{newPostContent.length} / 5000</p>
                                    <button
                                        type="submit"
                                        disabled={isCreatingPost || !newPostContent.trim()}
                                        className="min-h-10 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isCreatingPost ? "Publishing..." : "Publish"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* My Posts */}
                        <div>
                            <h2 className="text-3xl font-extrabold text-white mb-6 flex items-center gap-3">
                                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                My Blog Posts
                            </h2>
                            {posts.length === 0 ? (
                                <div className="text-center py-16 bg-slate-700/30 backdrop-blur-xl rounded-2xl border border-white/10">
                                    <svg className="w-20 h-20 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-slate-300 text-lg mb-6">You haven't posted anything yet.</p>
                                    <button
                                        onClick={() => router.push('/blogs')}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-purple-500/50"
                                    >
                                        Create Your First Post
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {posts.map((post) => (
                                        <div key={post._id} className="group relative bg-slate-700/40 backdrop-blur-xl rounded-2xl p-6 hover:bg-slate-700/60 transition-all border border-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="relative flex justify-between items-start mb-4">
                                                <p className="text-sm text-slate-400 flex items-center gap-2 font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(post.date).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric"
                                                    })}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-2 px-3 py-1 bg-pink-500/20 border border-pink-500/30 text-pink-300 text-sm font-bold rounded-full backdrop-blur-sm">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                        {post.likes?.length || 0}
                                                    </span>
                                                    <button
                                                        onClick={() => handleStartEditPost(post)}
                                                        className="min-h-10 min-w-10 text-blue-300 hover:text-blue-200 transition-colors p-2 hover:bg-blue-500/20 rounded"
                                                        title="Edit post"
                                                    >
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(post._id)}
                                                        className="min-h-10 min-w-10 text-red-300 hover:text-red-200 transition-colors p-2 hover:bg-red-500/20 rounded"
                                                        title="Delete post"
                                                    >
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            {editingPostId === post._id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={editingPostContent}
                                                        onChange={(e) => setEditingPostContent(e.target.value)}
                                                        rows={5}
                                                        maxLength={5000}
                                                        className="w-full px-4 py-3 border border-white/15 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    />
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={handleCancelEditPost}
                                                            disabled={isUpdatingPost}
                                                            className="min-h-10 px-4 py-2 border border-white/20 text-slate-200 rounded-lg hover:bg-white/10 disabled:opacity-60 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleSaveEditedPost}
                                                            disabled={isUpdatingPost || !editingPostContent.trim()}
                                                            className="min-h-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {isUpdatingPost ? "Saving..." : "Save"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                        {expandedPosts[post._id] || post.content.length <= POST_PREVIEW_LENGTH
                                                            ? post.content
                                                            : `${post.content.slice(0, POST_PREVIEW_LENGTH)}...`}
                                                    </p>
                                                    {post.content.length > POST_PREVIEW_LENGTH && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleExpandedPost(post._id)}
                                                            className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                        >
                                                            {expandedPosts[post._id] ? "Show less" : "Read more"}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
