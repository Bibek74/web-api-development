"use client";

import { useEffect, useState } from "react";
import { postApi, Post } from "@/lib/api/posts";

export default function BlogsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
        try {
            const response = await postApi.likeUnlikePost(id);
            if (response.success) {
                // Refresh posts to get updated like count
                fetchPosts();
            }
        } catch (error: any) {
            console.error("Error liking post:", error);
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
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">All Blog Posts</h1>
                <button
                    onClick={fetchPosts}
                    disabled={refreshing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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

            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg
                            className="mx-auto h-12 w-12"
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-500">There are no blog posts to display yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <article
                            key={post._id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                        {post.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {post.user?.name || "Unknown User"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(post.date)}
                                        </p>
                                    </div>
                                </div>
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
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {post.content}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleLike(post._id)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
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
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
