"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { profileApi, PublicUserProfile } from "@/lib/api/profile";
import { Post } from "@/lib/api/posts";
import { buildPostImageUrl, buildProfileImageUrl } from "@/lib/user-session";

export default function UserPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string | undefined;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const POST_PREVIEW_LENGTH = 280;

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError("");

        const response = await profileApi.getPublicProfileById(userId);
        if (!response.success || !response.result) {
          setError(response.message || "Profile not found");
          return;
        }

        setProfile(response.result);
        setPosts(response.posts || []);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Unable to load this profile right now";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  const totalLikes = useMemo(
    () => posts.reduce((count, post) => count + post.likes.length, 0),
    [posts]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const toggleExpandedPost = (postId: string) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 pt-24 text-white">
        <div className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-400" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 pt-24 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Profile unavailable</h1>
          <p className="mb-6 text-slate-300">{error || "This profile could not be found."}</p>
          <Link
            href="/blogs"
            className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-12 pt-20 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-4 rounded-lg border border-white/20 bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          ← Back
        </button>

        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-linear-to-br from-blue-500 to-purple-600">
                {profile.profileImage ? (
                  <img
                    src={buildProfileImageUrl(profile.profileImage)}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                    {profile.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">{profile.name}</h1>
                <p className="text-sm text-slate-300">{profile.role?.toUpperCase() || "USER"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-center">
                <p className="text-slate-400">Posts</p>
                <p className="text-lg font-bold text-white">{posts.length}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-center">
                <p className="text-slate-400">Likes</p>
                <p className="text-lg font-bold text-white">{totalLikes}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white md:text-2xl">Published Blogs</h2>
            <Link href="/blogs" className="text-sm font-medium text-blue-300 hover:text-blue-200">
              Explore all blogs
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-slate-950/70 px-4 py-6 text-center text-slate-300">
              This user has not published any blogs yet.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="rounded-xl border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{formatDate(post.date)}</span>
                    <span>❤️ {post.likes.length}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{post.title || "Untitled"}</h3>
                  {(() => {
                    const isExpanded = !!expandedPosts[post._id];
                    const isLongPost = post.content.length > POST_PREVIEW_LENGTH;
                    const displayedContent = isExpanded || !isLongPost
                      ? post.content
                      : `${post.content.slice(0, POST_PREVIEW_LENGTH)}...`;

                    return (
                      <>
                        {post.image && (
                          <img
                            src={buildPostImageUrl(post.image)}
                            alt={post.title || "Post image"}
                            className="mb-3 w-full max-h-96 rounded-lg border border-white/10 object-cover"
                          />
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-200">{displayedContent}</p>
                        {isLongPost && (
                          <button
                            type="button"
                            onClick={() => toggleExpandedPost(post._id)}
                            className="mt-2 text-sm font-medium text-blue-300 hover:text-blue-200"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
