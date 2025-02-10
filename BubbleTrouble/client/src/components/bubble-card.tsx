import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bubble, Post } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Users } from "lucide-react";
import { Link } from 'wouter';

interface BubbleCardProps {
  bubble: Bubble;
}

export default function BubbleCard({ bubble }: BubbleCardProps) {
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: [`/api/bubbles/${bubble.id}/posts`],
  });

  return (
    <Link href={`/bubble/${bubble.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur cursor-pointer">
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg">{bubble.name}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {bubble.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{posts.length} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>3 members</span>
            </div>
          </div>
          <Button
            className="w-full rounded-full group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300"
            variant="outline"
          >
            Join Bubble
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}