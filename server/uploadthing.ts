import { createUploadthing, type FileRouter } from "uploadthing/server";
import type { User } from "@shared/schema";

declare module "express" {
  interface Request {
    user?: User;
  }
}

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      if (!req.user) throw new Error("Unauthorized");
      return { userId: req.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),

  mediaUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      if (!req.user) throw new Error("Unauthorized");
      return { userId: req.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;