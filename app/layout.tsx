import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { MobileSideBar } from "@/components/MobileSideBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { logout } from "./actions/auth";
import { Toaster } from "@/components/ui/sonner";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "HCR | Welcome!",
  description: "Humboldt County Rentals for all",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark box-border flex flex-col items-center justify-center transition-colors`}
    >
      <body
        className="flex w-full justify-center overflow-y-scroll scrollbar-thin scrollbar-track-background scrollbar-thumb-secondary scrollbar-thumb-rounded-sm"
        // Should probably open an issue for the scrollbar plugin
        style={{ scrollbarColor: "unset", scrollbarWidth: "unset" }}
      >
        {/* <ScrollArea
          className="fixed inset-0 flex h-[100vh] w-[100vw] justify-center px-6"
          viewportClassName="flex justify-center w-full px-12"
        > */}
        <main className="flex h-full items-center justify-center">
          <div className="flex h-full w-[95vw] min-w-0 flex-col items-center justify-center md:w-[90vw] lg:w-[85vw]">
            <header className="flex w-full max-w-[90vw] items-center justify-center bg-background/50 pt-5">
              {/* <Image
						src={"/hcr-full-logo.svg"}
						alt='HCR'
						width={120}
						height={0 This doesn't actually matter}
            /> */}
              <Link
                href={"/"}
                className="h-24 w-48 text-foreground transition-all hover:animate-rotate-x hover:cursor-pointer hover:text-primary"
              >
                <Logo className="h-full w-full" />
              </Link>
              {/* <h1 className='text-4xl font-bold tracking-wider w-full'>HCR</h1> */}
              <nav className="hidden w-full items-center justify-center gap-2 md:flex">
                <Link
                  href={"/listings"}
                  className={buttonVariants({ variant: "link" })}
                >
                  Listings
                </Link>
                <Link
                  href={"/favorites"}
                  className={buttonVariants({ variant: "link" })}
                >
                  Favorites
                </Link>
                <Link
                  href={"/analytics"}
                  className={buttonVariants({ variant: "link" })}
                >
                  Analytics
                </Link>
                <Link
                  href={"/about"}
                  className={buttonVariants({ variant: "link" })}
                >
                  About
                </Link>
              </nav>
              <div className="hidden w-full items-center justify-end gap-1 md:flex">
                <ThemeToggle />
                {data?.user && (
                  <>
                    <div>Hey there, {data.user.email}</div>
                    <form action={logout}>
                      <Button type="submit">logout</Button>
                    </form>
                  </>
                )}
                {!data?.user && (
                  <>
                    <Link
                      href={"/auth/login"}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "hover:animate-pulse",
                      )}
                    >
                      login
                    </Link>
                    <Link
                      href={"/auth/signup"}
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "hover:animate-wiggle",
                      )}
                    >
                      sign up
                    </Link>
                  </>
                )}
              </div>
              <div className="flex w-full items-center justify-end md:hidden">
                <MobileSideBar />
              </div>
            </header>
            <hr className="w-full" />

            {children}
          </div>
        </main>
        {/* </ScrollArea> */}
        <Toaster />
      </body>
    </html>
  );
}
