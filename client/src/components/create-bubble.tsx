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
import { motion } from 'framer-motion';

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
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={form.handleSubmit((data) => createBubbleMutation.mutate(data))}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Bubble Name</Label>
        <Input
          id="name"
          placeholder="Enter a name for your bubble"
          className="rounded-full border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500"
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
          className="w-full bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-300"
          disabled={createBubbleMutation.isPending}
        >
          {createBubbleMutation.isPending ? <Loader2 className="animate-spin" /> : "Create Bubble"}
        </Button>
      </div>
    </motion.form>
  );
}
