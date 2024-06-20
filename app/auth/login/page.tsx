import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OctagonAlert } from "lucide-react";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center gap-10 p-5">
      <div className="w-full">
        <h2 className="text-2xl font-semibold">Login</h2>
        <p>Welcome back :)</p>
      </div>
      <form action={login} className="flex w-full flex-col gap-4">
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
        {!!searchParams["error"] && (
          <div className="flex gap-2 rounded-md border border-destructive p-5">
            <OctagonAlert className="text-destructive" />
            <div>
              That didn&apos;t work. Maybe there&apos;s a typo? If it comes down
              to it, you can{" "}
              <a className="underline" href="/issues">
                request a password reset
              </a>
            </div>
          </div>
        )}
        <Button type="submit" className="w-fit">
          login
        </Button>
      </form>
    </div>
  );
}
