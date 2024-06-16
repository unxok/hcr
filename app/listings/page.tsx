import { supabase } from "@/lib/supabase";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Database } from "@/lib/supabase.types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	CheckCircledIcon,
	CrossCircledIcon,
	ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { Bath, Bed, BedSingle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "HCR | Listings!",
	description: "Listings from Humboldt County, all in one place!",
};

type ListingRow = Database["public"]["Tables"]["listings"]["Row"] & {
	property_managements: Database["public"]["Tables"]["property_managements"]["Row"];
};

export default async function Page() {
	const { data: listings } = await supabase
		.from("listings")
		.select("*, property_managements ( * )")
		.gt("market_rent", 0);
	return (
		<div className='bg-background dark size-full flex flex-col justify-start items-center p-5'>
			<div className='flex flex-wrap gap-3 w-fit justify-center'>
				{(listings as ListingRow[])?.map((l) => (
					<Listing
						key={l.listable_uid}
						{...l}
					/>
				))}
			</div>
		</div>
	);
}

const Listing = ({
	listable_uid,
	full_address,
	marketing_title,
	default_photo_thumbnail_url,
	market_rent,
	deposit,
	dogs,
	cats,
	bedrooms,
	bathrooms,
	available_date,
	photos,
	property_managements: {
		accent_color,
		display_name,
		listing_item_url,
		logo_url,
		accent_color_foreground,
	},
}: ListingRow) => {
	const available =
		typeof available_date === "string"
			? new Date(available_date).toLocaleDateString()
			: "unknown";
	const availableNow = new Date() > new Date(available_date ?? "");

	const photoUrls = (photos as { url?: string }[])
		.map((p) => p.url)
		.filter((p) => p);

	return (
		<Card className='min-w-0 w-[80vw] sm:w-[500px] sm:h-[500px]'>
			<CardHeader>
				<CardTitle
					title={full_address ?? ""}
					className='truncate'
				>
					{full_address}
				</CardTitle>
				<CardDescription>{marketing_title}</CardDescription>
				<Badge
					className='w-fit'
					style={{
						backgroundColor: accent_color,
						color: accent_color_foreground,
					}}
				>
					{display_name}
				</Badge>
			</CardHeader>
			<div className='w-full flex justify-center items-center bg-secondary'>
				<Carousel
					className='w-2/3'
					opts={{
						loop: true,
					}}
				>
					<CarouselContent>
						<CarouselItem className='flex justify-center items-center w-full'>
							<img
								src={default_photo_thumbnail_url ?? ""}
								alt='Listing photo'
								className='w-auto h-40'
							/>
							<img
								src={logo_url}
								alt={display_name}
								className='absolute bottom-0 right-0 h-16'
							/>
						</CarouselItem>
						{photoUrls.map((url) => (
							<CarouselItem
								key={url}
								className='w-full flex justify-center items-center'
							>
								<img
									src={url}
									alt='Listing photo'
									className='w-auto h-40'
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
			</div>
			<CardFooter className='flex flex-col gap-2 py-2 justify-center items-start'>
				<div className='text-2xl font-bold tracking-wide flex gap-4 items-center'>
					<span>${market_rent?.toLocaleString()}</span>
					<div className='flex gap-1 items-center justify-center text-base'>
						{bedrooms ?? 0}
						<Bed />
						&nbsp;&nbsp;
						{bathrooms ?? 0} <Bath />
					</div>
				</div>
				<div className='flex flex-wrap gap-1 items-start justify-start'>
					{/* <Badge>Rent: ${market_rent?.toLocaleString()}</Badge> */}
					<Badge>Deposit: ${deposit?.toLocaleString()}</Badge>
					<Badge variant={dogs ? "default" : "destructive"}>
						Dogs&nbsp;{dogs ? <CheckCircledIcon /> : <CrossCircledIcon />}
					</Badge>
					<Badge variant={cats ? "default" : "destructive"}>
						Cats&nbsp;{cats ? <CheckCircledIcon /> : <CrossCircledIcon />}
					</Badge>
					{/* <Badge>{bedrooms ?? 0} Bed</Badge>
					<Badge>{bathrooms ?? 0} Bath</Badge> */}
				</div>
				<div className='text-sm text-muted-foreground pt-3'>
					{availableNow ? "Available now since " : "Will be available "}{" "}
					{available}
				</div>
				<div className='flex w-full justify-end'>
					<a
						href={listing_item_url + "/" + listable_uid}
						className={buttonVariants({ variant: "default" })}
						target='_blank'
						title={listing_item_url + "/" + listable_uid}
					>
						Official listing&nbsp;
						<ExternalLinkIcon />
					</a>
				</div>
			</CardFooter>
		</Card>
	);
};
