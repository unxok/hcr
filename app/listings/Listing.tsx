import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { ExternalLinkIcon, MapPin, Bed, Bath } from "lucide-react";
import { ListingRow } from "./constants";

export const Listing = ({
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

  // md:max-w-[49%] lg:max-w-[32%]

  return (
    <Card className="w-full min-w-0 rounded-none border-0 border-b-[1px] bg-background md:max-w-[49%] md:rounded-md md:border lg:max-w-[32%]">
      <CardHeader>
        <CardTitle title={full_address ?? ""} className="truncate">
          <a
            href={listing_item_url + "/" + listable_uid}
            title={listing_item_url + "/" + listable_uid}
            className="flex w-full gap-2 truncate hover:underline"
            target="_blank"
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
                loading="lazy"
              />
              <img
                src={logo_url}
                alt={display_name}
                className="absolute bottom-0 right-0 max-h-16 max-w-36 bg-white p-2"
                loading="lazy"
              />
            </CarouselItem>
            {photoUrls.map((url) => (
              <CarouselItem
                key={url}
                className="flex w-full items-center justify-center"
              >
                <img
                  src={url}
                  alt="Listing photo"
                  className="h-40 w-auto"
                  loading="lazy"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-center gap-2 py-2">
        <div className="flex items-center gap-4 text-2xl font-bold tracking-wide">
          <span className="text-primary">${market_rent?.toLocaleString()}</span>
          <div className="flex items-center justify-center gap-1 text-base">
            {bedrooms ?? 0}
            <Bed />
            &nbsp;&nbsp;
            {bathrooms ?? 0} <Bath />
          </div>
        </div>
        <div className="flex flex-wrap items-start justify-start gap-1">
          {/* <Badge>Rent: ${market_rent?.toLocaleString()}</Badge> */}
          <Badge variant={"secondary"}>
            Deposit: ${deposit?.toLocaleString()}
          </Badge>
          <Badge variant={dogs ? "default" : "destructive"}>
            Dogs&nbsp;{dogs ? <CheckCircledIcon /> : <CrossCircledIcon />}
          </Badge>
          <Badge variant={cats ? "default" : "destructive"}>
            Cats&nbsp;{cats ? <CheckCircledIcon /> : <CrossCircledIcon />}
          </Badge>
          <Badge variant={square_feet ? "secondary" : "destructive"}>
            {square_feet ? square_feet : "?"}&nbsp;ft&nbsp;<sup>2</sup>
          </Badge>
          {/* <Badge>{bedrooms ?? 0} Bed</Badge>
                      <Badge>{bathrooms ?? 0} Bath</Badge> */}
        </div>
        <div className="text-sm text-muted-foreground">
          {availableNow ? "Available now since " : "Will be available "}{" "}
          {available}
        </div>
      </CardFooter>
    </Card>
  );
};

export const ListingFallback = () => (
  <Card className="w-full min-w-0 bg-background md:max-w-[49%] lg:max-w-[32%]">
    <CardHeader>
      <CardTitle className="truncate">
        <Skeleton className="flex w-full gap-2 truncate hover:underline">
          2256 Boone Dr
          <ExternalLinkIcon className="w-fit min-w-fit" />
        </Skeleton>
      </CardTitle>

      <CardDescription className="flex items-center">
        {/* <Skeleton
            // className={`flex items-center p-0 ${buttonVariants({
            // 	variant: "link",
            // })}`}
            className={cn(
              buttonVariants({
                variant: "link",
              }),
              "flex items-center p-0 text-transparent",
            )}
          >
            Arcata
            <MapPin className="h-4" />
          </Skeleton> */}
        <Skeleton className="truncate">
          Cute little townhome by the bay
        </Skeleton>
      </CardDescription>

      <Skeleton>
        <Badge className="w-fit">Humboldt County Rentals</Badge>
      </Skeleton>
    </CardHeader>
    <CardContent className="flex h-40 w-full items-center justify-center">
      <Skeleton>
        <img alt="example photo" className="h-40 w-full" />
      </Skeleton>
    </CardContent>
    <CardFooter className="flex flex-col items-start justify-center gap-2 py-2">
      <div className="flex items-center gap-4 text-2xl font-bold tracking-wide">
        <Skeleton>$2,200</Skeleton>
        {/* <Skeleton className="flex items-center justify-center gap-1 text-base">
            4
            <Bed />
            &nbsp;&nbsp; 2
          </Skeleton> */}
      </div>
      <Skeleton className="text-sm">Available now since 06/03/2024</Skeleton>
      <div className="flex flex-wrap items-start justify-start gap-1">
        {/* <Badge>Rent: ${market_rent?.toLocaleString()}</Badge> */}
        <Skeleton>
          <Badge>Deposit: $2000</Badge>
        </Skeleton>
        <Skeleton>
          <Badge>Dogs x</Badge>
        </Skeleton>
        {/* <Skeleton>
            <Badge>Cats x</Badge>
          </Skeleton>
          <Skeleton>
            <Badge>1000 ft2</Badge>
          </Skeleton> */}
        {/* <Badge>{bedrooms ?? 0} Bed</Badge>
        <Badge>{bathrooms ?? 0} Bath</Badge> */}
      </div>
    </CardFooter>
  </Card>
);
