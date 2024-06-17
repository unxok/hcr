"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

export const MobileSideBar = () => {
  //
  return (
    <Sheet>
      <SheetTrigger className={buttonVariants({ variant: "outline" })}>
        <HamburgerMenuIcon />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Welcome to HCR!</SheetDescription>
        </SheetHeader>
        <nav className="flex animate-fade-left flex-col py-5 animate-delay-300 [&>a]:w-full [&>a]:py-5">
          <Link href={"/"}>Home</Link>
          <Link href={"/listings"}>Listings</Link>
          <Link href={"/favorites"}>Favorites</Link>
          <Link href={"/analytics"}>Analytics</Link>
          <Link href={"/about"}>About</Link>
        </nav>
        <div className="flex flex-col items-center justify-center gap-3">
          <Select>
            <SelectTrigger className="animate-fade-up animate-delay-500">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="w-full animate-fade-up animate-delay-700"
            variant={"outline"}
          >
            login
          </Button>
          <Button className="w-full animate-fade-up animate-delay-1000">
            sign up
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
