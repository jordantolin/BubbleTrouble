import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="bubble-nav px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <img
              src="/bubble-removebg-preview.png"
              alt="Bubble Trouble"
              className="h-8 w-8 hover:scale-110 transition-transform"
            />
            <span className="text-xl font-bold text-gray-900">Bubble Trouble</span>
          </div>
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  className={`text-gray-600 hover:text-yellow-500 transition-colors ${
                    location === "/profile" ? "text-yellow-500" : ""
                  }`}
                >
                  Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => logoutMutation.mutate()}
                className="text-gray-600 hover:text-yellow-500 transition-colors"
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bubble-button px-6 py-2">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}