import { createServerClient } from "@/lib/supabase/server";
import { Form } from "./form";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProfilePictureButton } from "./ProfilePictureButton";

const page = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // redirect("/auth/login");
    return redirect("/auth/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id);

  if (!data) {
    // redirect("/auth/login");
    return redirect("/auth/login");
  }

  const { username, profile_picture_url, user_id } = data[0] ?? {};

  const email = user.email ?? "no email found";

  return (
    <div className="h-full w-full">
      <div className="py-3">
        <h2 className="text-2xl font-semibold tracking-wide">Profile</h2>
        <p className="text-muted-foreground">
          View and edit your profile details
        </p>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-2 py-2">
        {/* <h3>Profile picture</h3>
        <p>Must be less than 5 MB</p> */}

        <Image
          src={profile_picture_url ?? ""}
          alt="profile picture"
          width={100}
          height={100}
        />
        <ProfilePictureButton
          userId={user_id}
          currentProfilePictureUrl={profile_picture_url ?? ""}
        />
      </div>
      <Form defaultValues={{ username }} />
    </div>
  );
};

export default page;
