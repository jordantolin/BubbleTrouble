import { useQuery } from "@tanstack/react-query";
import { BubbleCard } from "./bubble-card";
import { CreateBubble } from "./create-bubble";
import { BubbleWithUser } from "@shared/schema";
import { Loader2 } from "lucide-react";

export function BubbleFeed() {
  const { data: bubbles, isLoading } = useQuery<BubbleWithUser[]>({
    queryKey: ["/api/bubbles"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <CreateBubble />
      <div className="mt-8 space-y-6">
        {bubbles?.map((bubble) => (
          <BubbleCard key={bubble.id} bubble={bubble} />
        ))}
      </div>
    </div>
  );
}
