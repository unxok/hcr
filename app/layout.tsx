import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "HCR | Welcome!",
	description: "Humboldt County Rentals for all",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			className={`${GeistSans.variable} ${GeistMono.variable} dark`}
		>
			<body className='bg-background'>
				<header className='w-full bg-secondary flex p-5'>
					<h1 className='text-4xl font-bold tracking-wider w-full'>HCR</h1>
					<nav className='flex gap-2 justify-center items-center w-full'>
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
					<div className='flex justify-end w-full items-center'>
						<Button variant={"ghost"}>login</Button>
						<Button>sign up</Button>
					</div>
				</header>
				{children}
			</body>
		</html>
	);
}
