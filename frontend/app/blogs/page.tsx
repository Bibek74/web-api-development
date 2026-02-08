"use client";

import { useEffect, useState } from "react";
import { postApi, Post } from "@/lib/api/posts";
import { useRouter } from "next/navigation";

export default function BlogsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Check if user is authenticated
    useEffect(() => {
        const checkAuth = () => {
            if (typeof window !== "undefined") {
                const cookies = document.cookie.split(";").reduce((acc, cookie) => {
                    const [key, value] = cookie.trim().split("=");
                    acc[key] = value;
                    return acc;
                }, {} as Record<string, string>);
                
                setIsAuthenticated(!!cookies.auth_token);
            }
        };
        checkAuth();
    }, []);

    const fetchPosts = async () => {
        try {
            setRefreshing(true);
            const response = await postApi.getAllPosts();
            if (response.success) {
                setPosts(response.result);
            } else {
                console.error("Failed to fetch posts:", response.message);
            }
        } catch (error: any) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const response = await postApi.deletePost(id);
            if (response.success) {
                console.log("Post deleted successfully");
                setPosts(posts.filter(post => post._id !== id));
            } else {
                console.error("Failed to delete post:", response.message);
            }
        } catch (error: any) {
            console.error("Error deleting post:", error);
        }
    };

    const handleLike = async (id: string) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        
        try {
            const response = await postApi.likeUnlikePost(id);
            if (response.success) {
                // Refresh posts to get updated like count
                fetchPosts();
            }
        } catch (error: any) {
            console.error("Error liking post:", error);
            if (error.response?.status === 401) {
                router.push('/login');
            }
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newPostContent.trim()) {
            alert("Please enter some content");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await postApi.createPost(newPostContent);
            if (response.success) {
                console.log("Post created successfully");
                setNewPostContent("");
                setShowCreateForm(false);
                // Refresh posts to show the new post
                fetchPosts();
            } else {
                alert(response.message || "Failed to create post");
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Error creating post");
            console.error("Error creating post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Hero Section for Non-Authenticated Users */}
            {!isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                ✨ Welcome to Blogify
                            </h1>
                            <p className="text-lg md:text-xl mb-6 text-blue-100">
                                Discover amazing stories, ideas, and insights from our community
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button
                                    onClick={() => router.push('/login')}
                                    className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => router.push('/register')}
                                    className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {isAuthenticated ? "All Blog Posts" : "Latest Posts"}
                    </h2>
                    <div className="flex gap-3">
                        {isAuthenticated && (
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
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
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                {showCreateForm ? "Cancel" : "Create Post"}
                            </button>
                        )}
                        <button
                            onClick={fetchPosts}
                            disabled={refreshing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md"
                        >
                            <svg
                                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Create Post Form - Only for Authenticated Users */}
                {isAuthenticated && showCreateForm && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Blog Post</h2>
                        <form onSubmit={handleCreatePost}>
                            <div className="mb-4">
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                                    Post Content
                                </label>
                                <textarea
                                    id="content"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Write your blog post here... (Max 5000 characters)"
                                    maxLength={5000}
                                    required
                                />
                                <div className="mt-1 text-sm text-gray-500 text-right">
                                    {newPostContent.length} / 5000 characters
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewPostContent("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newPostContent.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
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
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            Publish Post
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {posts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <div className="text-gray-400 mb-4">
                            <svg
                                className="mx-auto h-16 w-16"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                        <p className="text-gray-500 mb-6">
                            {isAuthenticated 
                                ? "Be the first to share your thoughts!"
                                : "Check back later for amazing content from our community."}
                        </p>
                        {isAuthenticated && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Create First Post
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post, index) => (
                            <article
                                key={post._id}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {post.user?.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {post.user?.name || "Unknown User"}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(post.date)}
                                            </p>
                                        </div>
                                    </div>
                                    {isAuthenticated && (
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded"
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
                                    )}
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                                        {post.content}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-2 transition-colors ${
                                            isAuthenticated 
                                                ? "text-gray-600 hover:text-red-500" 
                                                : "text-gray-400 cursor-pointer hover:text-red-400"
                                        }`}
                                        title={isAuthenticated ? "Like this post" : "Sign in to like"}
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill={post.likes.length > 0 ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                        <span className="font-medium">
                                            {post.likes.length} {post.likes.length === 1 ? "Like" : "Likes"}
                                        </span>
                                    </button>
                                    {!isAuthenticated && (
                                        <span className="text-sm text-gray-400 ml-auto">
                                            👉 Sign in to interact
                                        </span>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Call to Action for Non-Authenticated Users */}
                {!isAuthenticated && posts.length > 0 && (
                    <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-xl">
                        <h3 className="text-2xl font-bold mb-3">Ready to share your story?</h3>
                        <p className="text-blue-100 mb-6 text-lg">
                            Join our community and start creating amazing content today!
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <button
                                onClick={() => router.push('/register')}
                                className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
                            >
                                Get Started Free
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
