import { supabase } from "@/lib/supabase";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Database } from "@/lib/supabase.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

export default async function Page() {
	const { data: listings } = await supabase.from("Listings").select("*");
	return (
		<div className='bg-background dark rounded-md border inset-0 fixed overflow-y-scroll flex flex-col gap-3 justify-start items-center'>
			{listings?.map((l) => (
				<Listing
					key={l.listable_uid}
					{...l}
				/>
			))}
		</div>
	);
}

const Listing = ({
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
}: Database["public"]["Tables"]["Listings"]["Row"]) => {
	const available =
		typeof available_date === "string"
			? new Date(available_date).toLocaleDateString()
			: "unknown";
	const availableNow = new Date() > new Date(available_date ?? "");

	const photoUrls = (photos as { url?: string }[])
		.map((p) => p.url)
		.filter((p) => p);

	return (
		<Card className='w-5/6'>
			<CardHeader>
				<CardTitle>{full_address}</CardTitle>
				<CardDescription>{marketing_title}</CardDescription>
				<div className='flex flex-wrap gap-1 items-center'>
					<Badge>Rent: ${market_rent?.toLocaleString()}</Badge>
					<Badge>Deposit: ${deposit?.toLocaleString()}</Badge>
					<Badge variant={dogs ? "default" : "destructive"}>
						Dogs: {dogs ? "yes" : "no"}
					</Badge>
					<Badge variant={cats ? "default" : "destructive"}>
						Cats: {cats ? "yes" : "no"}
					</Badge>
					<Badge>{bedrooms} Bd</Badge>
					<Badge>{bathrooms} Bth</Badge>
				</div>
			</CardHeader>
			<div className='w-full flex justify-center items-center bg-background'>
				<Carousel
					className='w-2/3'
					opts={{
						loop: true,
					}}
				>
					<CarouselContent>
						<CarouselItem>
							<img
								src={default_photo_thumbnail_url ?? ""}
								alt='Listing photo'
								className='w-auto h-40'
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

			<CardFooter className='flex flex-col justify-center items-start'>
				<div className='text-sm text-muted-foreground pt-3'>
					{availableNow ? "Available now since " : "Will be available "}{" "}
					{available}
				</div>
				<div className='flex w-full justify-end'>
					<Button>Listing →</Button>
				</div>
			</CardFooter>
		</Card>
	);
};
