"use client";

import { useEffect, useMemo, useState } from "react";
import { postApi, Post } from "@/lib/api/posts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { buildPostImageUrl, buildProfileImageUrl, getSessionUser } from "@/lib/user-session";

const BLOG_TYPE_KEYWORDS: Record<string, string[]> = {
    Technology: ["tech", "ai", "software", "coding", "programming", "javascript", "typescript", "react", "node", "backend", "frontend", "database", "api"],
    Travel: ["travel", "trip", "journey", "destination", "adventure", "tour", "flight", "vacation", "itinerary"],
    Food: ["food", "recipe", "cooking", "kitchen", "meal", "restaurant", "dish", "ingredients", "chef"],
    Lifestyle: ["lifestyle", "daily", "routine", "wellness", "mindset", "habits", "selfcare", "fitness", "health"],
    Business: ["business", "startup", "market", "finance", "career", "productivity", "strategy", "sales", "management"],
};

const BLOG_TYPE_HASHTAGS: Record<string, string[]> = {
    Technology: ["technology", "tech", "ai", "coding", "programming"],
    Travel: ["travel", "trip", "adventure", "journey"],
    Food: ["food", "recipe", "cooking"],
    Lifestyle: ["lifestyle", "wellness", "mindset", "fitness"],
    Business: ["business", "startup", "finance", "career"]
};

const STOP_WORDS = new Set([
    "the", "and", "for", "with", "that", "this", "from", "have", "your", "about", "into", "there", "their", "what", "when", "where", "would", "could", "should", "will", "you", "are", "was", "were", "has", "had", "not", "but", "all", "any", "can", "our", "out", "how", "why", "who", "its", "they", "them"
]);

const getBlogType = (content: string) => {
    const lowerContent = content.toLowerCase();

    const hashtags = (lowerContent.match(/#[a-z0-9_]+/g) || []).map((tag) => tag.slice(1));
    for (const [type, tags] of Object.entries(BLOG_TYPE_HASHTAGS)) {
        if (tags.some((tag) => hashtags.includes(tag))) {
            return type;
        }
    }

    const tokens = lowerContent
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2);

    const scores = new Map<string, number>();
    for (const [type, keywords] of Object.entries(BLOG_TYPE_KEYWORDS)) {
        const score = keywords.reduce((count, keyword) => {
            return count + tokens.filter((token) => token === keyword).length;
        }, 0);
        scores.set(type, score);
    }

    let detectedType = "General";
    let maxScore = 0;

    for (const [type, score] of scores.entries()) {
        if (score > maxScore) {
            maxScore = score;
            detectedType = type;
        }
    }

    if (maxScore >= 1) {
        return detectedType;
    }

    return "General";
};

export default function BlogsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [selectedType, setSelectedType] = useState("All");
    const [showNameSuggestions, setShowNameSuggestions] = useState(false);
    const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();
    const toast = useToast();
    const POST_PREVIEW_LENGTH = 280;

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
                setCurrentUserId(getSessionUser()?._id || null);
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

        const trimmedTitle = newPostTitle.trim();
        const trimmedContent = newPostContent.trim();

        if (!trimmedTitle) {
            toast.error("Please enter a heading");
            return;
        }
        
        if (!trimmedContent) {
            toast.error("Please enter some content");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await postApi.createPost(trimmedTitle, trimmedContent, newPostImage);
            if (response.success) {
                console.log("Post created successfully");
                setNewPostTitle("");
                setNewPostContent("");
                setNewPostImage(null);
                setShowCreateForm(false);
                toast.success("Post created successfully!");
                // Refresh posts to show the new post
                fetchPosts();
            } else {
                toast.error(response.message || "Failed to create post");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error creating post");
            console.error("Error creating post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFavorite = async (id: string) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        try {
            const response = await postApi.favoriteUnfavoritePost(id);
            if (response.success) {
                fetchPosts();
            } else {
                toast.error(response.message || "Failed to update favorites");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error updating favorites");
            if (error.response?.status === 401) {
                router.push('/login');
            }
        }
    };

    const handleAddComment = async (id: string) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const text = (commentDrafts[id] || "").trim();
        if (!text) {
            toast.error("Please write a comment first");
            return;
        }

        try {
            setActiveCommentPostId(id);
            const response = await postApi.addComment(id, text);
            if (response.success) {
                setCommentDrafts((prev) => ({ ...prev, [id]: "" }));
                fetchPosts();
            } else {
                toast.error(response.message || "Failed to add comment");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error adding comment");
            if (error.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setActiveCommentPostId(null);
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

    const toggleExpandedPost = (postId: string) => {
        setExpandedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const blogTypeCounts = useMemo(() => {
        return posts.reduce((acc, post) => {
            const type = getBlogType(post.content);
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [posts]);

    const blogTypes = useMemo(() => {
        const sortedTypes = Object.keys(blogTypeCounts).sort((a, b) => blogTypeCounts[b] - blogTypeCounts[a]);
        return ["All", ...sortedTypes];
    }, [blogTypeCounts]);

    const searchSuggestions = useMemo(() => {
        const authorSuggestions = Array.from(new Set(posts.map((post) => post.user?.name).filter(Boolean) as string[])).slice(0, 4);

        const keywordMap = new Map<string, number>();
        for (const post of posts) {
            const words = post.content
                .toLowerCase()
                .split(/[^a-z0-9]+/)
                .filter((word) => word.length >= 4 && !STOP_WORDS.has(word));

            for (const word of words) {
                keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
            }
        }

        const keywordSuggestions = Array.from(keywordMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([keyword]) => keyword);

        return [...authorSuggestions, ...keywordSuggestions].slice(0, 8);
    }, [posts]);

    const authorNameSuggestions = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return [];

        const allAuthors = Array.from(
            new Set(posts.map((post) => post.user?.name).filter(Boolean) as string[])
        );

        return allAuthors
            .filter((name) => name.toLowerCase().includes(query))
            .slice(0, 6);
    }, [posts, searchTerm]);

    const globalAutocompleteSuggestions = useMemo(() => {
        const allAuthors = Array.from(
            new Set(posts.map((post) => post.user?.name).filter(Boolean) as string[])
        );

        const source = Array.from(new Set([...allAuthors, ...searchSuggestions]));
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
            return source.slice(0, 8);
        }

        return source
            .filter((item) => item.toLowerCase().includes(query))
            .slice(0, 8);
    }, [posts, searchSuggestions, searchTerm]);

    const filteredPosts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return posts.filter((post) => {
            const content = post.content?.toLowerCase() || "";
            const title = post.title?.toLowerCase() || "";
            const authorName = post.user?.name?.toLowerCase() || "";
            const blogType = getBlogType(post.content);

            const matchesQuery = !query || content.includes(query) || title.includes(query) || authorName.includes(query);
            const matchesType = selectedType === "All" || blogType === selectedType;

            return matchesQuery && matchesType;
        });
    }, [posts, searchTerm, selectedType]);

    if (loading) {
        return (
            <div className="blogs-page min-h-screen bg-linear-to-b from-black via-zinc-950 to-slate-950 text-white pt-24 px-4">
                <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-300/20 border-t-amber-300"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="blogs-page relative min-h-screen overflow-hidden bg-linear-to-b from-black via-zinc-950 to-slate-950 text-slate-100">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-amber-300/8 blur-3xl" />
                <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-yellow-200/6 blur-3xl" />
            </div>
            {/* Hero Section for Non-Authenticated Users */}
            {!isAuthenticated && (
                <div className="relative border-b border-white/10 bg-linear-to-r from-zinc-950/95 via-slate-950/95 to-black/95 text-white py-14">
                    <div className="container mx-auto px-4 max-w-7xl relative">
                        <div className="text-center">
                            <p className="inline-flex items-center rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-1 text-xs font-medium tracking-[0.18em] uppercase text-amber-100 mb-4">
                                Curated stories from the community
                            </p>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                ✨ Welcome to Blogify
                            </h1>
                            <p className="text-lg md:text-xl mb-7 text-slate-300 max-w-2xl mx-auto">
                                Discover amazing stories, ideas, and insights from our community
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button
                                    onClick={() => router.push('/login')}
                                    className="min-h-11 px-8 py-3 bg-amber-300 text-slate-950 rounded-xl hover:bg-amber-200 transition-colors font-semibold shadow-lg shadow-amber-900/20"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => router.push('/register')}
                                    className="min-h-11 px-8 py-3 bg-transparent border border-amber-100/60 text-amber-100 rounded-xl hover:bg-amber-200 hover:text-slate-950 transition-colors font-semibold"
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container relative mx-auto px-4 pt-8 pb-14 max-w-7xl">
                <div className="mb-4 flex items-center justify-start">
                    <button
                        onClick={() => router.push('/home')}
                        className="min-h-11 px-4 py-2 bg-zinc-800 text-slate-100 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2 border border-white/15"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/65 backdrop-blur-xl shadow-lg shadow-black/40 p-5 md:p-7 mb-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                                {isAuthenticated ? "All Blog Posts" : "Latest Posts"}
                            </h2>
                            <p className="text-sm text-slate-300 mt-2">
                                Explore stories from the community and interact with posts.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {isAuthenticated && (
                                <button
                                    onClick={() => setShowCreateForm(!showCreateForm)}
                                    className="min-h-11 px-4 py-2 bg-amber-300 text-slate-950 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {showCreateForm ? "Close Creator" : "Create Post"}
                                </button>
                            )}

                            <button
                                onClick={fetchPosts}
                                disabled={refreshing}
                                className="min-h-11 px-4 py-2 bg-zinc-800 text-slate-100 rounded-lg hover:bg-zinc-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center gap-2 border border-white/15"
                            >
                                <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="blog-search" className="block text-sm font-medium text-slate-200 mb-2">
                            Search Posts
                        </label>
                        <div className="relative flex gap-2">
                            <input
                                id="blog-search"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowNameSuggestions(true);
                                }}
                                onFocus={() => {
                                    setShowNameSuggestions(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowNameSuggestions(false), 120);
                                }}
                                placeholder="Search by content or author name..."
                                className="w-full min-h-11 rounded-lg border border-white/15 bg-black/50 px-4 py-2 text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSearchPanel((prev) => !prev)}
                                className="min-h-11 px-4 py-2 bg-amber-300 text-slate-950 rounded-lg hover:bg-amber-200 transition-colors"
                            >
                                Search
                            </button>

                            {showNameSuggestions && (
                                <div className="absolute left-0 right-22.5 top-13 z-20 rounded-lg border border-white/15 bg-zinc-900 shadow-lg shadow-black/40 overflow-hidden">
                                    {globalAutocompleteSuggestions.length > 0 ? (
                                        <>
                                            <div className="px-4 py-2 text-xs text-slate-400 border-b border-white/10">
                                                Global Suggestions
                                            </div>
                                            {globalAutocompleteSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        setSearchTerm(suggestion);
                                                        setShowNameSuggestions(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-slate-400">No suggestions found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {showSearchPanel && (
                            <div className="mt-3 rounded-2xl border border-white/10 bg-black/60 p-4 md:p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-white mb-2">Blog Types</p>
                                    <div className="flex flex-wrap gap-2">
                                        {blogTypes.map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setSelectedType(type)}
                                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                                    selectedType === type
                                                        ? "bg-amber-300 border-amber-200 text-slate-950"
                                                        : "bg-zinc-900 border-white/15 text-slate-300 hover:bg-zinc-800"
                                                }`}
                                            >
                                                {type} {type !== "All" ? `(${blogTypeCounts[type] || 0})` : `(${posts.length})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-white mb-2">Suggestions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {searchSuggestions.length > 0 ? (
                                            searchSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onClick={() => setSearchTerm(suggestion)}
                                                    className="px-3 py-1.5 rounded-full text-sm bg-zinc-900 border border-white/15 text-slate-300 hover:bg-zinc-800 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400">No suggestions yet</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedType("All");
                                        }}
                                        className="px-3 py-1.5 rounded-md text-sm bg-zinc-900 border border-white/15 text-slate-300 hover:bg-zinc-800 transition-colors"
                                    >
                                        Reset Filters
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSearchPanel(false)}
                                        className="px-3 py-1.5 rounded-md text-sm bg-zinc-900 border border-white/15 text-slate-300 hover:bg-zinc-800 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Post Form - Only for Authenticated Users */}
                {isAuthenticated && showCreateForm && (
                    <div className="bg-zinc-900/65 rounded-2xl border border-white/10 shadow-lg shadow-black/40 p-6 mb-6">
                        <h2 className="text-2xl font-semibold tracking-tight text-white mb-4">Create New Blog Post</h2>
                        <form onSubmit={handleCreatePost}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-slate-200 mb-2">
                                    Heading
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={newPostTitle}
                                    onChange={(e) => setNewPostTitle(e.target.value)}
                                    maxLength={120}
                                    className="w-full px-4 py-3 border border-white/15 bg-black/50 text-white rounded-lg focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300"
                                    placeholder="Enter blog heading..."
                                    required
                                />
                                <div className="mt-1 text-sm text-slate-400 text-right">
                                    {newPostTitle.length} / 120 characters
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="content" className="block text-sm font-medium text-slate-200 mb-2">
                                    Post Content
                                </label>
                                <textarea
                                    id="content"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-white/15 bg-black/50 text-white rounded-lg focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300 resize-none"
                                    placeholder="Write your blog post here... (Max 5000 characters)"
                                    maxLength={5000}
                                    required
                                />
                                <div className="mt-1 text-sm text-slate-400 text-right">
                                    {newPostContent.length} / 5000 characters
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="post-image" className="block text-sm font-medium text-slate-200 mb-2">
                                    Post Image (optional)
                                </label>
                                <input
                                    id="post-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 border border-white/15 bg-black/50 text-white rounded-lg focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300"
                                />
                            </div>
                            <div className="flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewPostTitle("");
                                        setNewPostContent("");
                                        setNewPostImage(null);
                                    }}
                                    className="min-h-11 px-4 py-2 border border-white/20 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
                                    className="min-h-11 px-6 py-2 bg-amber-300 text-slate-950 rounded-lg hover:bg-amber-200 disabled:bg-amber-200/70 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                    <div className="text-center py-16 bg-zinc-900/65 rounded-2xl border border-white/10 shadow-lg shadow-black/40">
                        <div className="text-slate-400 mb-4">
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
                        <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                        <p className="text-slate-400 mb-6">
                            {isAuthenticated 
                                ? "Be the first to share your thoughts!"
                                : "Check back later for amazing content from our community."}
                        </p>
                        {isAuthenticated && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="min-h-11 px-6 py-3 bg-amber-300 text-slate-950 rounded-lg hover:bg-amber-200 transition-colors font-medium"
                            >
                                Create First Post
                            </button>
                        )}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-16 bg-zinc-900/65 rounded-2xl border border-white/10 shadow-lg shadow-black/40">
                        <h3 className="text-xl font-semibold text-white mb-2">No matching posts found</h3>
                        <p className="text-slate-400 mb-6">Try a different keyword, choose another type, or clear your search.</p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedType("All");
                            }}
                            className="min-h-11 px-6 py-3 bg-amber-300 text-slate-950 rounded-lg hover:bg-amber-200 transition-colors font-medium"
                        >
                            Clear Search & Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredPosts.map((post) => (
                            <article
                                key={post._id}
                                className="bg-zinc-900/70 rounded-2xl border border-white/10 hover:border-amber-200/30 hover:-translate-y-0.5 transition-all duration-300 p-6 shadow-lg shadow-black/40"
                            >
                                {(() => {
                                    const isExpanded = !!expandedPosts[post._id];
                                    const isLongPost = post.content.length > POST_PREVIEW_LENGTH;
                                    const hasLiked = !!currentUserId && post.likes.includes(currentUserId);
                                    const hasFavorited = !!currentUserId && (post.favorites || []).includes(currentUserId);
                                    const displayedContent = isExpanded || !isLongPost
                                        ? post.content
                                        : `${post.content.slice(0, POST_PREVIEW_LENGTH)}...`;

                                    return (
                                        <>
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        {post.user?._id ? (
                                            <Link href={`/users/${post.user._id}`} className="flex items-center gap-3 group">
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 ring-2 ring-amber-100/20 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
                                                    {post.user?.profileImage ? (
                                                        <img
                                                            src={buildProfileImageUrl(post.user.profileImage)}
                                                            alt={post.user?.name || "User"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <>{post.user?.name?.[0]?.toUpperCase() || "U"}</>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white text-lg group-hover:text-amber-100 transition-colors leading-tight">
                                                        {post.user?.name || "Unknown User"}
                                                    </h3>
                                                    <p className="text-sm text-slate-400 mt-0.5">
                                                        {formatDate(post.date)}
                                                    </p>
                                                </div>
                                            </Link>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 ring-2 ring-amber-100/20 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
                                                    {post.user?.profileImage ? (
                                                        <img
                                                            src={buildProfileImageUrl(post.user.profileImage)}
                                                            alt={post.user?.name || "User"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <>{post.user?.name?.[0]?.toUpperCase() || "U"}</>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white text-lg leading-tight">
                                                        {post.user?.name || "Unknown User"}
                                                    </h3>
                                                    <p className="text-sm text-slate-400 mt-0.5">
                                                        {formatDate(post.date)}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-xs px-3 py-1 rounded-full bg-amber-200/10 border border-amber-200/30 text-amber-100 font-medium tracking-wide">
                                        {getBlogType(post.content)}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-semibold tracking-tight text-white mb-3">
                                    {post.title || "Untitled"}
                                </h3>

                                <div className="mb-4">
                                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed text-base md:text-[1.03rem]">
                                        {displayedContent}
                                    </p>
                                    {post.image && (
                                        <div className="mt-4 flex justify-center">
                                            <img
                                                src={buildPostImageUrl(post.image)}
                                                alt={post.title || "Post image"}
                                                className="w-full max-w-3xl max-h-96 object-cover rounded-xl border border-white/10"
                                            />
                                        </div>
                                    )}
                                    {isLongPost && (
                                        <button
                                            type="button"
                                            onClick={() => toggleExpandedPost(post._id)}
                                            className="mt-2 text-sm text-amber-200 hover:text-amber-100 transition-colors"
                                        >
                                            {isExpanded ? "Show less" : "Read more"}
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
                                            isAuthenticated 
                                                ? "text-slate-300 border-white/15 hover:text-red-400 hover:border-red-500/40" 
                                                : "text-slate-500 border-white/10 cursor-pointer hover:text-red-300"
                                        }`}
                                        title={isAuthenticated ? "Like this post" : "Sign in to like"}
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill={hasLiked ? "currentColor" : "none"}
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

                                    <button
                                        onClick={() => handleFavorite(post._id)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
                                            isAuthenticated
                                                ? "text-slate-300 border-white/15 hover:text-amber-200 hover:border-amber-200/50"
                                                : "text-slate-500 border-white/10 cursor-pointer hover:text-amber-200"
                                        }`}
                                        title={isAuthenticated ? "Add to favorites" : "Sign in to favorite"}
                                    >
                                        <svg className="w-5 h-5" fill={hasFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.958c.3.921-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.958a1 1 0 00-.364-1.118L2.98 9.385c-.783-.57-.38-1.81.588-1.81H7.73a1 1 0 00.95-.69l1.286-3.958z" />
                                        </svg>
                                        <span className="font-medium">
                                            {(post.favorites || []).length} {(post.favorites || []).length === 1 ? "Favorite" : "Favorites"}
                                        </span>
                                    </button>
                                    {!isAuthenticated && (
                                        <span className="text-sm text-slate-400 ml-auto">
                                            👉 Sign in to interact
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-4">
                                    <h4 className="text-sm font-semibold text-slate-200 mb-3">Comments</h4>
                                    <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
                                        {(post.comments || []).length > 0 ? (
                                            post.comments!.map((comment) => (
                                                <div key={comment._id || `${comment.user?._id}-${comment.date}-${comment.text.slice(0, 10)}`} className="rounded-lg border border-white/10 bg-zinc-900/60 p-3">
                                                    <p className="text-sm text-amber-100 font-medium">{comment.user?.name || "User"}</p>
                                                    <p className="text-sm text-slate-200 mt-1 whitespace-pre-wrap">{comment.text}</p>
                                                    <p className="text-xs text-slate-500 mt-2">{formatDate(comment.date)}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400">No comments yet. Be the first to comment.</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={commentDrafts[post._id] || ""}
                                            onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                                            placeholder={isAuthenticated ? "Write a comment..." : "Sign in to write a comment"}
                                            disabled={!isAuthenticated}
                                            className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 disabled:cursor-not-allowed disabled:opacity-70"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddComment(post._id)}
                                            disabled={!isAuthenticated || activeCommentPostId === post._id}
                                            className="min-h-10 px-4 py-2 rounded-lg bg-amber-300 text-slate-950 hover:bg-amber-200 disabled:bg-amber-200/70 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            {activeCommentPostId === post._id ? "Posting..." : "Post"}
                                        </button>
                                    </div>
                                </div>
                                        </>
                                    );
                                })()}
                            </article>
                        ))}
                    </div>
                )}

                {/* Call to Action for Non-Authenticated Users */}
                {!isAuthenticated && filteredPosts.length > 0 && (
                    <div className="mt-12 bg-zinc-900/65 rounded-2xl border border-white/10 p-8 text-center text-white shadow-lg shadow-black/40">
                        <h3 className="text-2xl font-bold mb-3">Ready to share your story?</h3>
                        <p className="text-slate-300 mb-6 text-lg">
                            Join our community and start creating amazing content today!
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <button
                                onClick={() => router.push('/register')}
                                className="min-h-11 px-8 py-3 bg-amber-300 text-slate-950 rounded-lg hover:bg-amber-200 transition-colors font-semibold"
                            >
                                Get Started Free
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="min-h-11 px-8 py-3 bg-transparent border border-white/25 text-slate-200 rounded-lg hover:bg-zinc-800 transition-colors font-semibold"
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
