import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/hooks/use-upload";
import { Image, Video, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  onChange: (url: string) => void;
  value?: string;
  type?: "image" | "media";
  className?: string;
}

export default function MediaUpload({
  onChange,
  value,
  type = "media",
  className,
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string>(value || "");
  const { startUpload, isUploading } = useUploadThing(
    type === "image" ? "imageUploader" : "mediaUploader",
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload file
      const [res] = await startUpload([file]);
      if (res) {
        onChange(res.url);
      }

      // Cleanup preview
      URL.revokeObjectURL(objectUrl);
    },
    [startUpload, onChange],
  );

  const clearMedia = useCallback(() => {
    setPreview("");
    onChange("");
  }, [onChange]);

  return (
    <div className={cn("relative group", className)}>
      <input
        type="file"
        accept={type === "image" ? "image/*" : "image/*,video/*"}
        onChange={handleUpload}
        className="hidden"
        id="media-upload"
        disabled={isUploading}
      />
      
      {preview ? (
        <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
          {preview.endsWith(".mp4") ? (
            <video src={preview} className="w-full h-full object-cover" />
          ) : (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={clearMedia}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="media-upload"
          className="block cursor-pointer"
        >
          <div className="rounded-lg border-2 border-dashed p-12 text-center hover:border-primary transition-colors">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : (
              <>
                {type === "image" ? (
                  <Image className="h-8 w-8 mx-auto mb-2" />
                ) : (
                  <Video className="h-8 w-8 mx-auto mb-2" />
                )}
                <p className="text-sm text-muted-foreground">
                  Click to upload {type === "image" ? "an image" : "media"}
                </p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
