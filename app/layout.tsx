import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { MobileSideBar } from "@/components/MobileSideBar";
import { getTheme, setTheme } from "./actions/setTheme";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "HCR | Welcome!",
  description: "Humboldt County Rentals for all",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = getTheme();
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark box-border flex flex-col items-center justify-center transition-colors`}
    >
      <body className="flex w-[95%] min-w-0 flex-col items-center justify-center lg:w-5/6">
        <header className="flex w-full items-center justify-center bg-background/50 pt-5">
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
            <Button className="hover:animate-pulse" variant={"ghost"}>
              login
            </Button>
            <Button className="hover:animate-wiggle">sign up</Button>
          </div>
          <div className="flex w-full items-center justify-end md:hidden">
            <MobileSideBar />
          </div>
        </header>
        <hr className="w-full" />

        {children}
      </body>
    </html>
  );
}
