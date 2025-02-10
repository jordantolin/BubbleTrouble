
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavMenu from "@/components/nav-menu";
import { BellIcon, Loader2, LogOut, Plus } from "lucide-react";
import CreatePost from "@/components/create-post";
import BubbleCard from "@/components/bubble-card";
import PostCard from "@/components/post-card";
import { useQuery } from "@tanstack/react-query";
import type { Bubble, Post } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateBubble from "@/components/create-bubble";

export default function HomePage() {
  const { data: bubbles, isLoading: bubblesLoading } = useQuery<Bubble[]>({
    queryKey: ["/api/bubbles"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/bubbles/1/posts"],
  });

  if (bubblesLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <header>
        <NavMenu />
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Bubble Trouble
            </h1>
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => window.location.href = '/'}>Home</Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => window.location.href = '/explore'}>Explore</Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => window.location.href = '/trending'}>Trending</Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <BellIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">{user?.username}</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-7 w-7"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!posts?.length && (
          <div className="mb-8 bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-lg p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Welcome to Bubble Trouble! 👋</h2>
            <p className="text-muted-foreground">Share your thoughts, connect with others, and explore different bubbles. Your posts will naturally fade away over time, creating space for fresh conversations.</p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CreatePost />
            <div className="space-y-4">
              {posts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {posts?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No posts yet. Be the first to share something!
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Active Bubbles</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Bubble
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Bubble</DialogTitle>
                  </DialogHeader>
                  <CreateBubble />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {bubbles?.map((bubble) => (
                <BubbleCard key={bubble.id} bubble={bubble} />
              ))}
              {bubbles?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No bubbles yet. Create one to get started!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
