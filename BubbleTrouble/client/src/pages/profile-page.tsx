import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Camera, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema, type Post } from "@shared/schema";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userPosts } = useQuery<Post[]>({
    queryKey: [`/api/users/${user?.id}/posts`],
  });

  const form = useForm({
    resolver: zodResolver(
      insertUserSchema
        .omit({ password: true })
        .extend({
          preferences: insertUserSchema.shape.preferences,
        })
    ),
    defaultValues: {
      username: user?.username || "",
      displayName: user?.displayName || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
      preferences: user?.preferences || {
        theme: "light",
        notifications: true,
        privacy: "public",
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative w-32 h-32 mx-auto">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>
                    {user?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  variant="secondary"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{user?.displayName || user?.username}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.bio}</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{userPosts?.length || 0} posts</span>
                <span>Member since {new Date(user?.createdAt || "").toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy & Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <form
                    onSubmit={form.handleSubmit((data) =>
                      updateProfileMutation.mutate(data)
                    )}
                    className="space-y-4 mt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        {...form.register("displayName")}
                        className="rounded-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        {...form.register("bio")}
                        className="rounded-lg resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-full"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="privacy">
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about new posts and messages
                        </p>
                      </div>
                      <Switch
                        checked={form.watch("preferences.notifications")}
                        onCheckedChange={(checked) =>
                          form.setValue("preferences.notifications", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Profile Privacy</Label>
                        <p className="text-sm text-muted-foreground">
                          Make your profile visible to everyone
                        </p>
                      </div>
                      <Switch
                        checked={form.watch("preferences.privacy") === "public"}
                        onCheckedChange={(checked) =>
                          form.setValue(
                            "preferences.privacy",
                            checked ? "public" : "private"
                          )
                        }
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-full mt-4"
                    onClick={() =>
                      updateProfileMutation.mutate({
                        preferences: form.getValues("preferences"),
                      })
                    }
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Privacy Settings
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Posts Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts?.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  {post.mediaUrls?.length > 0 && (
                    <img
                      src={post.mediaUrls[0] as string}
                      alt=""
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="p-4">
                    <p className="line-clamp-3">{post.content}</p>
                    <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Expires in{" "}
                        {Math.floor(
                          (new Date(post.expiresAt).getTime() - Date.now()) /
                            (1000 * 60 * 60)
                        )}
                        h
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
