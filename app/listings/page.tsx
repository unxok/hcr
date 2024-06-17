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
import { Bath, Bed, LoaderCircle, MapPin } from "lucide-react";
import { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { cn, toNumber } from "@/lib/utils";
import { ListingSearchCard, TFormSchema } from "./ListingSearchCard";
import { Suspense } from "react";

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
  const { data: citiesData } = await supabase
    .from("distinct_cities")
    .select("*");
  const cities = (citiesData ?? [{ address_city: "" }])
    .map((obj) => obj.address_city)
    .filter((c) => c !== null) as string[];
  return (
    <div className="flex size-full flex-col items-center justify-start gap-5 py-5">
      <ListingSearchCard cities={cities} />

      <Suspense
        fallback={
          <>
            Hang tight, this shouldn't take long
            <LoaderCircle className="animate-spin" size={50} />
          </>
        }
      >
        <ListingList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const ListingList = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
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
    <>
      <div className="w-full animate-fade-right text-start text-muted-foreground">
        {listings?.length} results
      </div>
      <div className="flex w-full animate-fade-up flex-wrap justify-center gap-3 rounded-md py-5 md:border">
        {(listings as ListingRow[])?.map((l) => (
          <Listing key={l.listable_uid} {...l} />
        ))}
      </div>
    </>
  );
};

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
    "https://www.google.com/maps/search/?api=1&query=" + full_address,
  );

  return (
    <Card className="w-full min-w-0 bg-background md:w-[45%] lg:w-[30%]">
      <CardHeader>
        <CardTitle title={full_address ?? ""} className="truncate">
          <a
            href={listing_item_url + "/" + listable_uid}
            title={listing_item_url + "/" + listable_uid}
            className="flex w-full gap-2 truncate hover:underline"
          >
            {address_address1 + " " + (address_address2 ?? "")}
            <ExternalLinkIcon className="w-fit min-w-fit" />
          </a>
        </CardTitle>
        <CardDescription className="flex items-center">
          <a
            href={mapUrl}
            title={mapUrl}
            target="_blank"
            // className={`flex items-center p-0 ${buttonVariants({
            // 	variant: "link",
            // })}`}
            className={cn(
              buttonVariants({
                variant: "link",
              }),
              "flex items-center p-0",
            )}
          >
            {address_city}
            <MapPin className="h-4" />
          </a>
          <span className="truncate" title={marketing_title ?? ""}>
            {marketing_title}
          </span>
        </CardDescription>
        <Badge
          className="w-fit"
          style={{
            backgroundColor: accent_color,
            color: accent_color_foreground,
          }}
        >
          {display_name}
        </Badge>
      </CardHeader>
      <CardContent className="flex h-40 w-full items-center justify-center">
        <Carousel
          className="w-2/3"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            <CarouselItem className="flex w-full items-center justify-center">
              <img
                src={default_photo_thumbnail_url ?? ""}
                alt="Listing photo"
                className="h-40 w-auto"
              />
              <img
                src={logo_url}
                alt={display_name}
                className="absolute bottom-0 right-0 max-h-16 max-w-36 bg-white p-2"
              />
            </CarouselItem>
            {photoUrls.map((url) => (
              <CarouselItem
                key={url}
                className="flex w-full items-center justify-center"
              >
                <img src={url} alt="Listing photo" className="h-40 w-auto" />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-center gap-2 py-2">
        <div className="flex items-center gap-4 text-2xl font-bold tracking-wide">
          <span>${market_rent?.toLocaleString()}</span>
          <div className="flex items-center justify-center gap-1 text-base">
            {bedrooms ?? 0}
            <Bed />
            &nbsp;&nbsp;
            {bathrooms ?? 0} <Bath />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {availableNow ? "Available now since " : "Will be available "}{" "}
          {available}
        </div>
        <div className="flex flex-wrap items-start justify-start gap-1">
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
