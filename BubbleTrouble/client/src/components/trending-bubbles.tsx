
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Bubble } from "@shared/schema";

export default function TrendingBubbles() {
  const { data: trendingBubbles } = useQuery<Bubble[]>({
    queryKey: ["/api/bubbles/trending"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-yellow-500" />
          Trending Bubbles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trendingBubbles?.map(bubble => (
            <div key={bubble.id} className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full" />
              <span>{bubble.name}</span>
              <span className="text-sm text-muted-foreground ml-auto">
                {bubble.memberCount} members
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
