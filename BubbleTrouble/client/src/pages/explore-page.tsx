
import { useQuery } from "@tanstack/react-query";
import { Bubble, Post } from "@shared/schema";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/post-card";
import BubbleCard from "@/components/bubble-card";
import TrendingBubbles from "@/components/trending-bubbles";

export default function ExplorePage() {
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/explore"],
  });

  const { data: bubbles, isLoading: bubblesLoading } = useQuery<Bubble[]>({
    queryKey: ["/api/bubbles/discover"],
  });

  if (postsLoading || bubblesLoading) {
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
          <h2 className="text-2xl font-bold">Discover Posts</h2>
          <div className="space-y-4">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <TrendingBubbles />
          <h2 className="text-xl font-bold">Suggested Bubbles</h2>
          <div className="space-y-4">
            {bubbles?.map((bubble) => (
              <BubbleCard key={bubble.id} bubble={bubble} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
