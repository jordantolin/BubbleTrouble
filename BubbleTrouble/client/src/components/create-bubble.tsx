import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBubbleSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { useRef } from "react";

export default function CreateBubble() {
  const closeRef = useRef<HTMLButtonElement>(null);
  const form = useForm({
    resolver: zodResolver(insertBubbleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createBubbleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bubbles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bubbles"] });
      form.reset();
      closeRef.current?.click();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => createBubbleMutation.mutate(data))}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Bubble Name</Label>
        <Input
          id="name"
          placeholder="Enter a name for your bubble"
          className="rounded-full"
          {...form.register("name")}
          disabled={createBubbleMutation.isPending}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What's this bubble about?"
          className="rounded-lg resize-none"
          {...form.register("description")}
          disabled={createBubbleMutation.isPending}
        />
      </div>

      <div className="flex justify-end gap-2">
        <DialogClose ref={closeRef} asChild>
          <Button type="button" variant="outline" className="rounded-full">
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="rounded-full"
          disabled={createBubbleMutation.isPending}
        >
          {createBubbleMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Bubble
        </Button>
      </div>
    </form>
  );
}
