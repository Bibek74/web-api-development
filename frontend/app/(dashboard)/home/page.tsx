"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { postApi, Post } from "@/lib/api/posts";
import { buildPostImageUrl, buildProfileImageUrl } from "@/lib/user-session";

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await postApi.getAllPosts();
        if (response.success) {
          // Get only the 3 most recent posts
          setRecentPosts(response.result.slice(0, 3));
        }
      } catch (error: any) {
        // Silently handle auth errors - user might not be logged in
        if (error?.response?.status !== 401) {
          console.error("Error fetching posts:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">
      
      {/* Hero Section */}
      <section className="relative h-screen w-full">
        {/* Background Image */}
        <Image
          src="/background.png"
          alt="Blogify hero background"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Hero Content */}
        <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-16 max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Unlimited Blogs,<br /> Stories & Ideas
          </h1>

          <p className="mb-6 max-w-xl text-lg text-white/80">
            Read anywhere. Share anytime. Experience blogging like never before.
          </p>

          <div className="flex gap-4">
            <Link
              href="/blogs"
              className="rounded bg-red-600 px-6 py-3 text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Read Now
            </Link>

            <Link
              href="/about"
              className="rounded border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              More Info
            </Link>
          </div>
        </div>
      </section>

      {/* Read Now Section - Recent Posts */}
      <section className="relative bg-linear-to-b from-gray-900 to-black py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Read Now</h2>
              <p className="text-white/70">Discover the latest stories and ideas</p>
            </div>
            <Link
              href="/blogs"
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
            >
              View All Posts →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-white/40 mb-4">
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
              <h3 className="text-xl font-medium text-white/80 mb-2">Discover Amazing Stories</h3>
              <p className="text-white/60 mb-6">Login to read and share blog posts with the community</p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Login to Read
                </Link>
                <Link
                  href="/register"
                  className="inline-block px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <article
                  key={post._id}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all duration-300 hover:transform hover:scale-[1.02]"
                >
                  <div className="p-6">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {post.user?._id ? (
                        <Link href={`/users/${post.user._id}`} className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
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
                            <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {post.user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-white/60">
                              {formatDate(post.date)}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
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
                            <p className="font-semibold text-white">
                              {post.user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-white/60">
                              {formatDate(post.date)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Post Content Preview */}
                    <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                      {post.title || "Untitled"}
                    </h3>
                    {post.image && (
                      <img
                        src={buildPostImageUrl(post.image)}
                        alt={post.title || "Post image"}
                        className="w-full h-48 object-cover rounded-lg mb-3 border border-white/10"
                      />
                    )}
                    <p className="text-white/80 line-clamp-4 mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-white/60">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-sm">{post.likes.length}</span>
                      </div>
                      <Link
                        href="/blogs"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-black py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose Blogify?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Link
              href="/blogs"
              className="text-center rounded-xl p-4 transition-all duration-300 hover:bg-white/5 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Writing</h3>
              <p className="text-white/70">
                Create and publish your stories with our intuitive editor
              </p>
            </Link>

            {/* Feature 2 */}
            <Link
              href="/register"
              className="text-center rounded-xl p-4 transition-all duration-300 hover:bg-white/5 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <div className="w-16 h-16 bg-linear-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Share</h3>
              <p className="text-white/70">
                Build your audience and engage with readers
              </p>
            </Link>

            {/* Feature 3 */}
            <Link
              href="/blogs"
              className="text-center rounded-xl p-4 transition-all duration-300 hover:bg-white/5 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Feedback</h3>
              <p className="text-white/70">
                Receive likes and comments from your community
              </p>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
