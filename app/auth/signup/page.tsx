import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleX, OctagonAlert } from "lucide-react";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const messages = searchParams["messages"];
  const messagesArr = messages
    ? Array.isArray(messages)
      ? messages
      : messages.split(";")
    : null;
  console.log("messages: ", messagesArr);
  return (
    <div className="flex h-full w-full flex-col items-center gap-10 p-5">
      <div className="w-full">
        <h2 className="text-2xl font-semibold">Sign up</h2>
        <p>
          Free forever! Enjoy the benefits of favorites, comments,
          notifications, and more.
        </p>
      </div>
      <form action={signup} className="flex w-full flex-col gap-4">
        <div>
          <Label htmlFor="email" className="text-lg">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            placeholder="abc@example.com"
            className="sm:w-1/2"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-lg">
            Password
          </Label>
          <Input
            type="password"
            id="password"
            name="password"
            required
            placeholder="••••••••"
            className="sm:w-1/2"
          />
        </div>
        {messagesArr && (
          <div className="flex w-full flex-col gap-1">
            {messagesArr?.map((m) => (
              <div key={m} className="flex items-center gap-1">
                <CircleX className="text-destructive" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        )}
        {!!searchParams["error"] && (
          <div className="flex gap-2 rounded-md border border-destructive p-5">
            <OctagonAlert className="text-destructive" />
            <div>
              Something went wrong. Perhaps this email is in use already? If
              not, please{" "}
              <a className="underline" href="/issues">
                report an issue
              </a>
            </div>
          </div>
        )}
        <Button type="submit" className="w-fit">
          complete sign up
        </Button>
      </form>
    </div>
  );
}
