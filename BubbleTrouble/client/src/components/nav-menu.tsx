
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon, LogOut, Loader2 } from "lucide-react";

export default function NavMenu() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="border-b bg-white/95 dark:bg-background/95 backdrop-blur sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent cursor-pointer">
              Bubble Trouble
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Explore
              </Button>
            </Link>
            <Link href="/trending">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Trending
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <BellIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-full">
            <Link href="/profile">
              <Avatar className="h-7 w-7 cursor-pointer">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
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
  );
}
