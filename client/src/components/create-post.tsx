import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import type { Bubble } from "@shared/schema";
import MediaUpload from "./media-upload";

export default function CreatePost() {
  const { data: bubbles } = useQuery<Bubble[]>({
    queryKey: ["/api/bubbles"],
  });

  const form = useForm({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      content: "",
      bubbleId: undefined,
      isAnonymous: false,
      mediaUrls: [],
      mediaType: null,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/bubbles/${data.bubbleId}/posts`] 
      });
      form.reset();
    },
  });

  return (
    <Card className="border-2 border-yellow-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))}
          className="space-y-4"
        >
          <Controller
            name="bubbleId"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="bubble">Select Bubble</Label>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Choose a bubble" />
                  </SelectTrigger>
                  <SelectContent>
                    {bubbles?.map((bubble) => (
                      <SelectItem
                        key={bubble.id}
                        value={bubble.id.toString()}
                      >
                        {bubble.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="content">Your Message</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              className="rounded-lg resize-none"
              {...form.register("content")}
              disabled={createPostMutation.isPending}
            />
          </div>

          <Controller
            name="mediaUrls"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Add Media</Label>
                <MediaUpload
                  onChange={(url) => {
                    const urls = field.value || [];
                    field.onChange([...urls, url]);
                    form.setValue("mediaType", url.endsWith(".mp4") ? "video" : "image");
                  }}
                />
              </div>
            )}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              {...form.register("isAnonymous")}
              disabled={createPostMutation.isPending}
            />
            <Label htmlFor="anonymous">Post anonymously</Label>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Post
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}