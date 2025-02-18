import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

interface User {
  id: number;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: followers = [] } = useQuery<User[]>({
    queryKey: [`/api/users/${user.id}/followers`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user.id}/followers`);
      if (!response.ok) throw new Error('Failed to fetch followers');
      return response.json();
    },
  });

  const { data: following = [] } = useQuery<User[]>({
    queryKey: [`/api/users/${user.id}/following`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user.id}/following`);
      if (!response.ok) throw new Error('Failed to fetch following');
      return response.json();
    },
  });

  const { data: isFollowing = false } = useQuery<{ isFollowing: boolean }>({
    queryKey: [`/api/users/${user.id}/is-following`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user.id}/is-following`);
      if (!response.ok) throw new Error('Failed to fetch following status');
      return response.json();
    },
    enabled: !!currentUser && currentUser.id !== user.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to follow user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/followers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/is-following`] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to unfollow user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/followers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/is-following`] });
    },
  });

  const handleFollowClick = () => {
    if (isFollowing.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        {currentUser && currentUser.id !== user.id && (
          <Button
            variant={isFollowing.isFollowing ? "outline" : "default"}
            onClick={handleFollowClick}
            disabled={followMutation.isPending || unfollowMutation.isPending}
          >
            {isFollowing.isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
      {user.bio && <p className="text-muted-foreground">{user.bio}</p>}
      <div className="flex gap-4 text-sm">
        <p>
          <span className="font-semibold">{followers.length}</span>{" "}
          <span className="text-muted-foreground">followers</span>
        </p>
        <p>
          <span className="font-semibold">{following.length}</span>{" "}
          <span className="text-muted-foreground">following</span>
        </p>
      </div>
    </div>
  );
}
