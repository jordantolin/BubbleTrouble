import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBubbleSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export function CreateBubble() {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(
      insertBubbleSchema.omit({ userId: true }).extend({
        content: insertBubbleSchema.shape.content.min(1).max(280),
      })
    ),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await apiRequest("POST", "/api/bubbles", {
        ...data,
        userId: user!.id,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/bubbles"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bubble",
        variant: "destructive",
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="What's floating in your mind?"
                  className="bubble-input resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bubble-button">
          Float it!
        </Button>
      </form>
    </Form>
  );
}
