
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <a href={`/post/${post.id}`}>
      <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={post.author?.avatarUrl} />
            <AvatarFallback>{post.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">@{post.author?.username}</div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
            </div>
            <p className="mt-2 text-sm text-foreground/90">{post.content}</p>
            {post.mediaUrl && (
              <img src={post.mediaUrl} alt="Post media" className="mt-3 rounded-lg max-h-96 object-cover" />
            )}
          </div>
        </div>
      </Card>
    </a>
  );
}
