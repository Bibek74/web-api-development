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
                <div className={`backdrop-blur-xl rounded-2xl shadow-lg p-12 flex items-center justify-center ${isDark ? "bg-zinc-900/65 border border-white/10 shadow-black/40" : "bg-white/85 border border-black/10"}`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-300/20 border-t-amber-300"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className={`backdrop-blur-xl rounded-2xl shadow-lg p-6 ${isDark ? "bg-zinc-900/65 border border-white/10 shadow-black/40" : "bg-white/85 border border-black/10"}`}>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Blogs Management</h1>
                        <p className={`mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Manage user blog content from admin panel</p>
                    </div>

                    <button
                        onClick={fetchPosts}
                        disabled={refreshing}
                        className={`px-4 py-2 rounded-lg disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${isDark ? "bg-zinc-800 border border-white/15 text-slate-100 hover:bg-zinc-700 disabled:bg-zinc-700" : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"}`}
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
                        className={`w-full md:w-md px-3 py-2 rounded-lg ${isDark ? "bg-black/50 border border-white/15 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "bg-white border border-black/15 text-slate-900 placeholder:text-slate-500"}`}
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
                                <article key={post._id} className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-zinc-900/70 hover:border-amber-200/30" : "border-black/10 bg-white/85"}`}>
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-linear-to-br from-zinc-700 to-zinc-900 ring-1 ring-amber-200/30 flex items-center justify-center text-amber-100 font-semibold text-sm">
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
                                                <Link href={`/admin/${post.user._id}/edit`} className={`px-3 py-1.5 rounded transition-colors text-sm ${isDark ? "bg-zinc-700 text-slate-100 hover:bg-zinc-600" : "bg-slate-700 text-white hover:bg-slate-600"}`}>
                                                    Edit User
                                                </Link>
                                            )}

                                            {!isEditing ? (
                                                <button
                                                    onClick={() => startEditing(post)}
                                                    className={`px-3 py-1.5 rounded transition-colors text-sm ${isDark ? "bg-amber-300 text-slate-950 hover:bg-amber-200" : "bg-yellow-600 text-white hover:bg-yellow-700"}`}
                                                >
                                                    Edit Blog
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => savePost(post._id)}
                                                        disabled={savingPost}
                                                        className={`px-3 py-1.5 rounded disabled:bg-green-400 transition-colors text-sm ${isDark ? "bg-amber-300 text-slate-950 hover:bg-amber-200" : "bg-green-600 text-white hover:bg-green-700"}`}
                                                    >
                                                        {savingPost ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className={`px-3 py-1.5 rounded transition-colors text-sm ${isDark ? "bg-zinc-700 text-slate-100 hover:bg-zinc-600" : "bg-slate-600 text-white hover:bg-slate-500"}`}
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

                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                    className={`w-full rounded-lg px-3 py-2 ${isDark ? "border border-white/20 bg-black/50 text-white focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "border border-black/15 bg-white text-slate-900"}`}
                                                placeholder="Post title"
                                            />
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={6}
                                                    className={`w-full rounded-lg px-3 py-2 ${isDark ? "border border-white/20 bg-black/50 text-white focus:ring-2 focus:ring-amber-300/40 focus:border-amber-200" : "border border-black/15 bg-white text-slate-900"}`}
                                                placeholder="Post content"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                                <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{post.title || "Untitled Post"}</h2>
                                                <p className={`whitespace-pre-wrap leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>{displayedContent}</p>
                                                {post.image && (
                                                    <div className="mt-4 flex justify-center">
                                                        <img
                                                            src={buildPostImageUrl(post.image)}
                                                            alt={post.title || "Post image"}
                                                            className="w-full max-w-3xl max-h-80 object-cover rounded-lg border border-white/10"
                                                        />
                                                    </div>
                                                )}
                                            {shouldTruncate && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpandedPost(post._id)}
                                                        className={`mt-2 text-sm font-medium ${isDark ? "text-amber-200 hover:text-amber-100" : "text-blue-700 hover:text-blue-800"}`}
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
