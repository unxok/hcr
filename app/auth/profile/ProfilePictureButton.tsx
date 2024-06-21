"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createBrowserClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Compressor from "compressorjs";
import { getCurrentUTC } from "@/lib/utils";

export const ProfilePictureButton = ({
  userId,
  currentProfilePictureUrl,
}: {
  userId: string;
  currentProfilePictureUrl: string;
}) => {
  const supabase = createBrowserClient();
  const [file, setFile] = useState<File>();
  const [err, setErr] = useState<string>();

  useEffect(() => {
    console.log("file: ", file);
  }, [file]);

  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "outline" })}>
        update profile picture
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Upload profile picture</DialogTitle>
        <DialogDescription>Files must be under 5 MB!</DialogDescription>
        <Input
          type="file"
          accept="image/*"
          className="dark:file:text-foreground"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            new Compressor(f, {
              resize: "contain",
              width: 250,
              height: 250,
              convertTypes: "image/*",
              convertSize: 5000000,
              success: (f) => setFile(f as File),
              error: (e) => setErr(e.message),
            });
          }}
        />
        {file && (
          <span className="flex w-full flex-col items-center justify-center">
            <img
              className="w-fit"
              src={URL.createObjectURL(file)}
              alt="user uploaded file"
            />
            <span>{(file.size / 1024 / 1024).toFixed(3)} MB</span>
            <span>{err}</span>
            <div className="flex w-full justify-end">
              {!err && (
                <DialogClose
                  className={buttonVariants({ variant: "default" })}
                  onClick={async (e) => {
                    const newPath = userId + "/" + getCurrentUTC() + file.name;
                    const { error: uploadError } = await supabase.storage
                      .from("profile-pictures")
                      .upload(newPath, file);
                    if (uploadError) {
                      setErr("Image upload failed. Please try again.");
                      e.preventDefault();
                      return;
                    }
                    const {
                      data: { publicUrl },
                    } = supabase.storage
                      .from("profile-pictures")
                      .getPublicUrl(newPath);
                    const { error: updateProfileUrlError } = await supabase
                      .from("profiles")
                      .update({ profile_picture_url: publicUrl })
                      .eq("user_id", userId);
                    if (updateProfileUrlError) {
                      setErr(
                        "Failed to updated profile profile_picture_url. Please try again.",
                      );
                    }
                    const { error: removeOldError } = await supabase.storage
                      .from("profile-pictures")
                      .remove([currentProfilePictureUrl]);
                    if (removeOldError) {
                      setErr(
                        "Failed to remove old profile picture. Please try again",
                      );
                      e.preventDefault();
                      return;
                    }
                  }}
                >
                  submit
                </DialogClose>
              )}
            </div>
          </span>
        )}
      </DialogContent>
    </Dialog>
  );
};
