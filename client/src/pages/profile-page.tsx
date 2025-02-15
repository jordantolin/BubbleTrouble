import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { BubbleWithUser } from "@shared/schema";
import { BubbleCard } from "@/components/bubbles/bubble-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: userBubbles, isLoading } = useQuery<BubbleWithUser[]>({
    queryKey: [`/api/users/${user!.id}/bubbles`],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user?.displayName}</h1>
              <p className="text-gray-500">@{user?.username}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {userBubbles?.map((bubble) => (
              <BubbleCard key={bubble.id} bubble={bubble} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
