import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Link } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  type: string;
  read: number;
  createdAt: string;
  actor: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  bubble?: {
    content: string;
  };
}

export function NotificationsDropdown() {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
  });

  const { data: unreadCount = 0 } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) throw new Error('Failed to fetch unread count');
      return response.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark notifications as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  useEffect(() => {
    // Mark notifications as read when dropdown is opened
    return () => {
      if (notifications.some(n => !n.read)) {
        markReadMutation.mutate();
      }
    };
  }, [notifications]);

  function getNotificationText(notification: Notification): string {
    const actorName = notification.actor.displayName || notification.actor.username;
    switch (notification.type) {
      case 'follow':
        return `${actorName} started following you`;
      case 'like':
        return `${actorName} liked your bubble`;
      case 'comment':
        return `${actorName} commented on your bubble`;
      default:
        return 'New notification';
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount.count > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-xs text-white flex items-center justify-center">
              {unreadCount.count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <ScrollArea className="h-80">
          <div className="p-4 space-y-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.bubble ? `/bubble/${notification.bubble.id}` : `/profile/${notification.actor.username}`}
                >
                  <div className={`p-3 rounded-lg hover:bg-accent cursor-pointer ${!notification.read ? 'bg-accent/50' : ''}`}>
                    <p className="text-sm">{getNotificationText(notification)}</p>
                    {notification.bubble && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {notification.bubble.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
