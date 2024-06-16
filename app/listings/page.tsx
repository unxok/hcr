import { supabase } from "@/lib/supabase";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Database } from "@/lib/supabase.types";
import { buttonVariants } from "@/components/ui/button";
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
import { Bath, Bed, MapPin } from "lucide-react";
import { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { cn, toNumber } from "@/lib/utils";
import { ListingSearchCard, TFormSchema } from "./ListingSearchCard";

export const metadata: Metadata = {
	title: "HCR | Listings!",
	description: "Listings from Humboldt County, all in one place!",
};

revalidatePath("/listings");

type ListingRow = Database["public"]["Tables"]["listings"]["Row"] & {
	property_managements: Database["public"]["Tables"]["property_managements"]["Row"];
};

export default async function Page({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const sp: TFormSchema = {
		rentMin: toNumber(searchParams.rentMin),
		rentMax: toNumber(searchParams.rentMax),
		depositMin: toNumber(searchParams.depositMin),
		depositMax: toNumber(searchParams.depositMax),
		bathsMin: toNumber(searchParams.bathsMin),
		bathsMax: toNumber(searchParams),
		bedsMin: toNumber(searchParams.bedsMin),
		bedsMax: toNumber(searchParams.bedsMax),
		dogs: searchParams.dogs === "true",
		cats: searchParams.cats === "true",
		cities:
			!searchParams.cities || searchParams.cities === "null"
				? null
				: (searchParams.cities as string).split(","),
		sqFtMin: toNumber(searchParams.sqFtMin),
		sqFtMax: toNumber(searchParams.sqFtMax),
	};

	// console.log("sp: ", sp);

	const {
		rentMin,
		rentMax,
		depositMin,
		depositMax,
		bathsMin,
		bathsMax,
		bedsMin,
		bedsMax,
		dogs,
		cats,
		cities: selectedCities,
		sqFtMin,
		sqFtMax,
	} = sp;

	const { data: citiesData } = await supabase
		.from("distinct_cities")
		.select("*");
	const cities = (citiesData ?? [{ address_city: "" }])
		.map((obj) => obj.address_city)
		.filter((c) => c !== null) as string[];

	let listingsQuery = supabase
		.from("listings")
		.select("*, property_managements ( * )")
		.gt("market_rent", 0)
		.gte("market_rent", rentMin)
		.gte("deposit", depositMin)
		.gte("bedrooms", bedsMin)
		.gte("bathrooms", bathsMin)
		.gte("square_feet", sqFtMin);

	if (rentMax > 0) {
		listingsQuery = listingsQuery.lte("market_rent", rentMax);
	}
	if (depositMax > 0) {
		listingsQuery = listingsQuery.lte("deposit", depositMax);
	}
	if (bedsMax > 0) {
		listingsQuery = listingsQuery.lte("bedrooms", bedsMax);
	}
	if (bathsMax > 0) {
		listingsQuery = listingsQuery.lte("bathrooms", bathsMax);
	}
	if (sqFtMax > 0) {
		listingsQuery = listingsQuery.lte("square_feet", sqFtMax);
	}
	if (dogs) {
		listingsQuery = listingsQuery.eq("dogs", dogs);
	}
	if (cats) {
		listingsQuery = listingsQuery.eq("cats", cats);
	}

	if (selectedCities) {
		listingsQuery = listingsQuery.in("address_city", selectedCities);
	}

	const { data: listings } = await listingsQuery;
	return (
		<div className='size-full flex flex-col gap-5 justify-start items-center py-5'>
			<ListingSearchCard cities={cities} />
			<div className='text-muted-foreground w-full text-start'>
				{listings?.length} results
			</div>
			<div className='flex flex-wrap gap-3 w-full justify-center md:border rounded-md py-5'>
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
	address_address1,
	address_address2,
	address_city,
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
	square_feet,
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

	const mapUrl = encodeURI(
		"https://www.google.com/maps/search/?api=1&query=" + full_address
	);

	return (
		<Card className='min-w-0 w-full md:w-[45%] lg:w-[30%] bg-background'>
			<CardHeader>
				<CardTitle
					title={full_address ?? ""}
					className='truncate'
				>
					<a
						href={listing_item_url + "/" + listable_uid}
						title={listing_item_url + "/" + listable_uid}
						className='hover:underline flex gap-2 truncate w-full'
					>
						{address_address1 + " " + (address_address2 ?? "")}
						<ExternalLinkIcon className='w-fit min-w-fit' />
					</a>
				</CardTitle>
				<CardDescription className='flex items-center'>
					<a
						href={mapUrl}
						title={mapUrl}
						target='_blank'
						// className={`flex items-center p-0 ${buttonVariants({
						// 	variant: "link",
						// })}`}
						className={cn(
							buttonVariants({
								variant: "link",
							}),
							"flex items-center p-0"
						)}
					>
						{address_city}
						<MapPin className='h-4' />
					</a>
					<span
						className='truncate'
						title={marketing_title ?? ""}
					>
						{marketing_title}
					</span>
				</CardDescription>
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
			<CardContent className='w-full flex justify-center items-center h-40'>
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
								className='absolute bottom-0 right-0 max-h-16 max-w-36 bg-white p-2'
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
			</CardContent>
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
				<div className='text-sm text-muted-foreground'>
					{availableNow ? "Available now since " : "Will be available "}{" "}
					{available}
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
					<Badge variant={square_feet ? "default" : "destructive"}>
						{square_feet ? square_feet : "?"}&nbsp;ft&nbsp;<sup>2</sup>
					</Badge>
					{/* <Badge>{bedrooms ?? 0} Bed</Badge>
					<Badge>{bathrooms ?? 0} Bath</Badge> */}
				</div>
			</CardFooter>
		</Card>
	);
};
