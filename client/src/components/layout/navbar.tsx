import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="bubble-nav px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Bubble Trouble" className="h-8 w-8" />
            <span className="text-xl font-bold">Bubble Trouble</span>
          </a>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/profile">
                <a className="text-sm hover:text-primary transition-colors">
                  Profile
                </a>
              </Link>
              <Button
                variant="ghost"
                onClick={() => logoutMutation.mutate()}
                className="text-sm"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <a className="bubble-button text-sm">Login</a>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
