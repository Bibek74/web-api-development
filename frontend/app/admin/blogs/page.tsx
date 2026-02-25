"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { postApi, Post } from "@/lib/api/posts";
import { useToast } from "@/lib/toast";
import { buildPostImageUrl, buildProfileImageUrl } from "@/lib/user-session";
import { useTheme } from "@/lib/theme";

export default function BlogsPage() {
    const toast = useToast();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [savingPost, setSavingPost] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
    const CONTENT_PREVIEW_LENGTH = 260;

    const fetchPosts = async () => {
        try {
            setRefreshing(true);
            const response = await postApi.getAllPosts();
            if (response.success) {
                setPosts(response.result);
            } else {
                toast.error(response.message || "Failed to fetch posts");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error fetching posts");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        const shouldDelete = await toast.confirm("Are you sure you want to delete this post?", "Delete Post");
        if (!shouldDelete) return;

        try {
            const response = await postApi.deletePost(id);
            if (response.success) {
                setPosts((prev) => prev.filter((post) => post._id !== id));
                if (editingPostId === id) {
                    setEditingPostId(null);
                    setEditTitle("");
                    setEditContent("");
                }
                toast.success("Post deleted successfully!");
            } else {
                toast.error(response.message || "Failed to delete post");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error deleting post");
        }
    };

    const startEditing = (post: Post) => {
        setEditingPostId(post._id);
        setEditTitle(post.title || "Untitled Post");
        setEditContent(post.content || "");
    };

    const cancelEditing = () => {
        setEditingPostId(null);
        setEditTitle("");
        setEditContent("");
    };

    const toggleExpandedPost = (postId: string) => {
        setExpandedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };

    const savePost = async (postId: string) => {
        const trimmedTitle = editTitle.trim();
        const trimmedContent = editContent.trim();

        if (trimmedTitle.length < 3) {
            toast.error("Title must be at least 3 characters");
            return;
        }

        if (!trimmedContent) {
            toast.error("Content cannot be empty");
            return;
        }

        try {
            setSavingPost(true);
            const response = await postApi.updatePost(postId, trimmedTitle, trimmedContent);
            if (response.success && response.result) {
                setPosts((prev) =>
                    prev.map((post) =>
                        post._id === postId
                            ? { ...post, title: response.result.title, content: response.result.content }
                            : post
                    )
                );
                toast.success("Post updated successfully!");
                cancelEditing();
            } else {
                toast.error(response.message || "Failed to update post");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error updating post");
        } finally {
            setSavingPost(false);
        }
    };

    const filteredPosts = posts.filter((post) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;

        return (
            (post.title || "").toLowerCase().includes(query) ||
            (post.content || "").toLowerCase().includes(query) ||
            (post.user?.name || "").toLowerCase().includes(query)
        );
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className={`backdrop-blur-xl rounded-lg shadow-lg p-12 flex items-center justify-center ${isDark ? "bg-slate-800/50 border border-white/10" : "bg-white/85 border border-black/10"}`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className={`backdrop-blur-xl rounded-lg shadow-lg p-6 ${isDark ? "bg-slate-800/50 border border-white/10" : "bg-white/85 border border-black/10"}`}>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Blogs Management</h1>
                        <p className={`mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Manage user blog content from admin panel</p>
                    </div>

                    <button
                        onClick={fetchPosts}
                        disabled={refreshing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                <div className="mb-5">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search blogs by title, content, or user"
                        className={`w-full md:w-md px-3 py-2 rounded-md ${isDark ? "bg-slate-900/50 border border-white/15 text-white placeholder:text-slate-400" : "bg-white border border-black/15 text-slate-900 placeholder:text-slate-500"}`}
                    />
                </div>

                {filteredPosts.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? "text-slate-400" : "text-slate-600"}`}>No blogs found.</div>
                ) : (
                    <div className="space-y-5">
                        {filteredPosts.map((post) => {
                            const isEditing = editingPostId === post._id;
                            const isExpanded = !!expandedPosts[post._id];
                            const content = post.content || "";
                            const shouldTruncate = content.length > CONTENT_PREVIEW_LENGTH;
                            const displayedContent = shouldTruncate && !isExpanded
                                ? `${content.slice(0, CONTENT_PREVIEW_LENGTH)}...`
                                : content;

                            return (
                                <article key={post._id} className={`rounded-xl border p-5 ${isDark ? "border-white/10 bg-slate-900/35" : "border-black/10 bg-white/85"}`}>
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {post.user?.profileImage ? (
                                                    <img src={buildProfileImageUrl(post.user.profileImage)} alt={post.user?.name || "User"} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span>{post.user?.name?.[0]?.toUpperCase() || "U"}</span>
                                                )}
                                            </div>

                                            <div>
                                                <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{post.user?.name || "Unknown User"}</p>
                                                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>{formatDate(post.date)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {post.user?._id && (
                                                <Link href={`/admin/${post.user._id}/edit`} className="px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors text-sm">
                                                    Edit User
                                                </Link>
                                            )}

                                            {!isEditing ? (
                                                <button
                                                    onClick={() => startEditing(post)}
                                                    className="px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
                                                >
                                                    Edit Blog
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => savePost(post._id)}
                                                        disabled={savingPost}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition-colors text-sm"
                                                    >
                                                        {savingPost ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="px-3 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => handleDelete(post._id)}
                                                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                                            >
                                                Delete Blog
                                            </button>
                                        </div>
                                    </div>

                                    {post.image && (
                                        <img
                                            src={buildPostImageUrl(post.image)}
                                            alt={post.title || "Post image"}
                                            className="mb-4 w-full max-h-80 object-cover rounded-lg border border-white/10"
                                        />
                                    )}

                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                    className={`w-full rounded-md px-3 py-2 ${isDark ? "border border-white/20 bg-slate-900/60 text-white" : "border border-black/15 bg-white text-slate-900"}`}
                                                placeholder="Post title"
                                            />
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={6}
                                                    className={`w-full rounded-md px-3 py-2 ${isDark ? "border border-white/20 bg-slate-900/60 text-white" : "border border-black/15 bg-white text-slate-900"}`}
                                                placeholder="Post content"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                                <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{post.title || "Untitled Post"}</h2>
                                                <p className={`whitespace-pre-wrap leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>{displayedContent}</p>
                                            {shouldTruncate && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpandedPost(post._id)}
                                                        className={`mt-2 text-sm font-medium ${isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-800"}`}
                                                >
                                                    {isExpanded ? "Show less" : "Show more"}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
