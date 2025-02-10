
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/post-card";
import TrendingBubbles from "@/components/trending-bubbles";

export default function TrendingPage() {
  const { data: trendingPosts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/trending"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <div className="space-y-4">
            {trendingPosts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <TrendingBubbles />
        </div>
      </div>
    </div>
  );
}
