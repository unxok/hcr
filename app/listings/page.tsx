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
import {
  assert,
  cn,
  createQueryParamsString,
  createRange,
  toNumber,
} from "@/lib/utils";
import {
  ListingSearchCard,
  ListingSearchCardFallback,
  TFormSchema,
} from "./ListingSearchCard";
import { ReactNode, Suspense } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PageSelector } from "./PageSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeInput } from "./PageSizeInput";
import Link from "next/link";
import { Select } from "@/components/ui/select";
import { ListingsSorter } from "./ListingsSorter";
import {
  SearchParamKey,
  SearchParamObj,
  SortOption,
  defaultPageSize,
  sortOptionsArr,
} from "./constants";

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
  searchParams: SearchParamObj;
}) {
  return (
    <div className="flex size-full flex-col items-center justify-start gap-5 py-5">
      <Suspense fallback={<ListingSearchCardFallback />}>
        <SearchCardWrapper />
      </Suspense>

      <Suspense fallback={<ListingListFallback />}>
        <ListingList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const SearchCardWrapper = async () => {
  const { data: citiesData } = await supabase
    .from("distinct_cities")
    .select("*");
  const cities = (citiesData ?? [{ address_city: "" }])
    .map((obj) => obj.address_city)
    .filter((c) => c !== null) as string[];

  const { data: bedroomsData } = await supabase
    .from("distinct_bedrooms")
    .select("*");
  const bedrooms = (bedroomsData ?? [{ bedrooms: 0 }])
    .map((obj) => obj.bedrooms)
    .filter((c) => c !== null) as number[];

  const { data: bathroomsData } = await supabase
    .from("distinct_bathrooms")
    .select("*");
  const bathrooms = (bathroomsData ?? [{ bathrooms: 0 }])
    .map((obj) => obj.bathrooms)
    .filter((c) => c !== null) as number[];
  return (
    <ListingSearchCard
      cities={cities}
      bedrooms={bedrooms}
      bathrooms={bathrooms}
    />
  );
};

const getDateFromSearchParams = (
  searchParams: SearchParamObj,
  key: SearchParamKey,
) => {
  const val = searchParams["availableFrom"];
  const pre = !val ? null : Array.isArray(val) ? val[0] : val;
  return pre ? new Date(pre).toISOString() : null;
};

const ListingList = async ({
  searchParams,
}: {
  searchParams: SearchParamObj;
}) => {
  const possiblePageNumber = Math.round(toNumber(searchParams.pageNumber, 1));
  const possiblePageSize = Math.round(
    toNumber(searchParams.pageSize, defaultPageSize),
  );
  const availableFrom = getDateFromSearchParams(searchParams, "availableFrom");
  const availableTo = getDateFromSearchParams(searchParams, "availableTo");
  // I don't love this but it works and should be safe
  const preSort = sortOptionsArr.includes(searchParams["sort"] as SortOption)
    ? searchParams["sort"]
    : sortOptionsArr[0];
  const sort = assert<SortOption>(preSort);

  const sp = {
    rentMin: toNumber(searchParams.rentMin),
    rentMax: toNumber(searchParams.rentMax),
    depositMin: toNumber(searchParams.depositMin),
    depositMax: toNumber(searchParams.depositMax),
    bedrooms:
      !searchParams.bedrooms || searchParams.bedrooms === "null"
        ? null
        : (searchParams.bedrooms as string).split(",").map((s) => toNumber(s)),
    bathrooms:
      !searchParams.bathrooms || searchParams.bathrooms === "null"
        ? null
        : (searchParams.bathrooms as string).split(",").map((s) => toNumber(s)),
    dogs: searchParams.dogs === "true",
    cats: searchParams.cats === "true",
    cities:
      !searchParams.cities || searchParams.cities === "null"
        ? null
        : (searchParams.cities as string).split(","),
    sqFtMin: toNumber(searchParams.sqFtMin),
    sqFtMax: toNumber(searchParams.sqFtMax),
    pageSize: possiblePageSize > 0 ? possiblePageSize : defaultPageSize,
    pageNumber: possiblePageNumber > 1 ? possiblePageNumber : 1,
    availableFrom,
    availableTo,
    sort,
    asc: searchParams["asc"] === "true",
  };

  // console.log("sp: ", sp);

  const {
    rentMin,
    rentMax,
    depositMin,
    depositMax,
    bedrooms,
    bathrooms,
    dogs,
    cats,
    cities: selectedCities,
    sqFtMin,
    sqFtMax,
    pageSize,
    pageNumber,
    availableFrom: availableFromDate,
    availableTo: availableToDate,
    sort: sortOption,
    asc,
  } = sp;

  const [start, end] = [pageSize * (pageNumber - 1), pageSize * pageNumber - 1];

  // console.log("start: ", start, " end: ", end);

  // let listingsQuery1 = supabase
  //   .from("listings")
  //   .select("*, property_managements ( * )", { count: "exact" })
  //   .gte("market_rent", rentMin)
  //   .gte("deposit", depositMin)
  //   .is("unlisted_at", null);

  let listingsQuery = supabase
    .from("listings")
    .select("*, property_managements ( * )", { count: "exact" })
    .gte("market_rent", rentMin)
    .gte("deposit", depositMin)
    .gte("square_feet", sqFtMin)
    .range(start, end)
    .is("unlisted_at", null)
    .order(sortOption, { ascending: asc });

  // listingsQuery =
  //   (rentMax && rentMax > 0) ? listingsQuery.lte("market_rent", rentMax) : listingsQuery;
  // listingsQuery =
  //   (depositMax && depositMax > 0) ? listingsQuery.lte("market_rent", rentMax) : listingsQuery;
  // listingsQuery =
  //   bedrooms && bedrooms?.length > 0
  //     ? listingsQuery.in("bedrooms", bedrooms)
  //     : listingsQuery;
  // listingsQuery =
  //   bathrooms && bathrooms?.length > 0
  //     ? listingsQuery.in("bathrooms", bathrooms)
  //     : listingsQuery;
  // listingsQuery =
  //   (sqFtMax && sqFtMax > 0) ? listingsQuery.lte("square_feet", sqFtMax) : listingsQuery;
  // listingsQuery = dogs ? listingsQuery.eq("dogs", dogs) : listingsQuery;
  // listingsQuery = cats ? listingsQuery.eq("cats", cats) : listingsQuery;
  // listingsQuery = selectedCities
  //   ? listingsQuery.in("address_city", selectedCities)
  //   : listingsQuery;

  if (rentMax && rentMax > 0)
    listingsQuery = listingsQuery.lte("market_rent", rentMax);
  if (depositMax && depositMax > 0)
    listingsQuery = listingsQuery.lte("deposit", depositMax);
  if (bedrooms && bedrooms?.length > 0)
    listingsQuery = listingsQuery.in("bedrooms", bedrooms);
  if (bathrooms && bathrooms?.length > 0)
    listingsQuery = listingsQuery.in("bathrooms", bathrooms);
  if (sqFtMax && sqFtMax > 0)
    listingsQuery = listingsQuery.lte("square_feet", sqFtMax);
  if (dogs) listingsQuery = listingsQuery.eq("dogs", dogs);
  if (cats) listingsQuery = listingsQuery.eq("cats", cats);
  if (selectedCities)
    listingsQuery = listingsQuery.in("address_city", selectedCities);
  if (availableFromDate)
    listingsQuery.gte(
      "available_date",
      new Date(availableFromDate).toISOString(),
    );
  if (availableToDate)
    listingsQuery.lte(
      "available_date",
      new Date(availableToDate).toISOString(),
    );
  // Sort options
  if (sort === "market_rent") {
    listingsQuery.order("market_rent", { ascending: true });
  }

  ///////////////

  const { data: listings, count: preCount } = await listingsQuery;
  const count = toNumber(preCount);
  const countByPageSize = count / pageSize;
  const totalPages =
    count % pageSize === 0 ? countByPageSize : Math.ceil(countByPageSize);
  const pathName = "/listings?";
  const nextPage = pageNumber < totalPages ? pageNumber + 1 : pageNumber;
  const prevPage = pageNumber > 1 ? pageNumber - 1 : pageNumber;

  const toolbarProps = {
    totalPages,
    nextPage,
    prevPage,
    start,
    end,
    count,
    pageNumber,
    searchParams: sp,
    pathName,
  };

  const hasFilters =
    Object.keys(sp).filter((k) => !!sp[k as keyof typeof sp]).length > 2;

  return (
    <>
      <ListingsToolbar {...toolbarProps} />
      <ListingsSorter />
      {hasFilters && <ListingsFilters searchParams={sp} pathName={pathName} />}

      <div className="flex w-full animate-fade-up flex-wrap justify-around gap-4 rounded-md">
        {(listings as ListingRow[])?.map((l) => (
          <Listing key={l.listable_uid} {...l} />
        ))}
      </div>
      <ListingsToolbar {...toolbarProps} />
    </>
  );
};

const BadgeLink = ({ href, label }: { href: string; label: ReactNode }) => (
  <Link href={href}>
    <Badge className="hover:bg-primary/80">{label}</Badge>
  </Link>
);

const ListingsFilters = ({
  searchParams,
  pathName,
}: {
  searchParams: Record<string, any>;
  pathName: string;
}) => {
  const {
    rentMin,
    rentMax,
    depositMin,
    depositMax,
    sqFtMin,
    sqFtMax,
    bedrooms,
    bathrooms,
    cats,
    dogs,
    cities: selectedCities,
  } = searchParams;
  return (
    <div className="flex w-full flex-wrap items-center justify-start gap-1">
      <span>Filters </span>
      {!!rentMin && (
        <BadgeLink
          label={`Min rent $${rentMin?.toLocaleString()}`}
          href={
            pathName + createQueryParamsString(searchParams, { rentMin: null })
          }
        />
      )}
      {!!rentMax && (
        <BadgeLink
          label={`Max rent $${rentMax?.toLocaleString()}`}
          href={
            pathName + createQueryParamsString(searchParams, { rentMax: null })
          }
        />
      )}
      {!!depositMin && (
        <BadgeLink
          label={`Min deposit $${depositMin?.toLocaleString()}`}
          href={
            pathName +
            createQueryParamsString(searchParams, { depositMin: null })
          }
        />
      )}
      {!!depositMax && (
        <BadgeLink
          label={`Max deposit $${depositMax?.toLocaleString()}`}
          href={
            pathName +
            createQueryParamsString(searchParams, { depositMax: null })
          }
        />
      )}
      {!!sqFtMin && (
        <BadgeLink
          label={`Min square ft ${sqFtMin?.toLocaleString()}`}
          href={
            pathName + createQueryParamsString(searchParams, { sqFtMin: null })
          }
        />
      )}
      {!!sqFtMax && (
        <BadgeLink
          label={`Max square ft ${sqFtMax?.toLocaleString()}`}
          href={
            pathName + createQueryParamsString(searchParams, { sqFtMax: null })
          }
        />
      )}
      {!!bedrooms &&
        Array.isArray(bedrooms) &&
        bedrooms.map((n) => (
          <BadgeLink
            key={n + "-bed-filter-chip"}
            label={n + " bed"}
            href={
              pathName +
              createQueryParamsString(searchParams, {
                bedrooms: bedrooms.filter((b) => b !== n),
              })
            }
          />
        ))}
      {!!bathrooms &&
        Array.isArray(bathrooms) &&
        bathrooms.map((n) => (
          <BadgeLink
            key={n + "-bath-filter-chip"}
            label={n + " bath"}
            href={
              pathName +
              createQueryParamsString(searchParams, {
                bathrooms: bathrooms.filter((b) => b !== n),
              })
            }
          />
        ))}
      {!!cats && (
        <BadgeLink
          label={`Cats required`}
          href={
            pathName + createQueryParamsString(searchParams, { cats: null })
          }
        />
      )}
      {!!dogs && (
        <BadgeLink
          label={`Dogs required`}
          href={
            pathName + createQueryParamsString(searchParams, { dogs: null })
          }
        />
      )}
      {!!selectedCities &&
        Array.isArray(selectedCities) &&
        selectedCities.map((n) => (
          <BadgeLink
            key={n + "-city-filter-chip"}
            label={n}
            href={
              pathName +
              createQueryParamsString(searchParams, {
                cities: selectedCities.filter((b) => b !== n),
              })
            }
          />
        ))}
    </div>
  );
};

const ListingsToolbar = ({
  totalPages,
  nextPage,
  prevPage,
  start,
  end,
  count,
  pageNumber,
  searchParams,
  pathName,
}: {
  totalPages: number;
  nextPage: number;
  prevPage: number;
  start: number;
  end: number;
  count: number;
  pageNumber: number;
  searchParams: Record<string, any>;
  pathName: string;
}) => (
  <div className="flex w-full items-center justify-between gap-2">
    <div className="w-fit animate-fade-right text-muted-foreground">
      Showing {count < start + 1 ? count : start + 1} -{" "}
      {end + 1 < count ? end + 1 : count} results of {count}
    </div>
    <PageSizeInput searchParams={searchParams} />
    <Pagination className="animate-fade-left">
      <PaginationContent className="">
        <PaginationItem>
          <PaginationFirst
            href={
              pathName +
              createQueryParamsString(searchParams, {
                pageNumber: 1,
              })
            }
            label={false}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious
            href={
              pathName +
              createQueryParamsString(searchParams, {
                pageNumber: prevPage,
              })
            }
          />
        </PaginationItem>
        <PaginationItem>
          <PageSelector
            pathName={pathName}
            searchParams={searchParams}
            pageNumber={pageNumber}
            totalPages={totalPages}
          />
        </PaginationItem>
        <PaginationItem className="pl-2">of {totalPages} pages</PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={
              pathName +
              createQueryParamsString(searchParams, {
                pageNumber: nextPage,
              })
            }
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLast
            href={
              pathName +
              createQueryParamsString(searchParams, {
                pageNumber: totalPages,
              })
            }
            label={false}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
);

const ListingListFallback = () => (
  <>
    <div className="flex w-full items-center justify-between gap-2">
      <Skeleton>Showing 1 - 5- results of 100</Skeleton>
      <Pagination>
        <PaginationContent>
          <Skeleton>
            <PaginationItem>
              <PaginationFirst href={""} label={false} />
            </PaginationItem>
          </Skeleton>
          <Skeleton>
            <PaginationItem>
              <PaginationPrevious href={""} />
            </PaginationItem>
          </Skeleton>
          <Skeleton>
            <PaginationItem>222</PaginationItem>
          </Skeleton>
          <Skeleton>
            <PaginationItem className="pl-2">of 10 pages</PaginationItem>
          </Skeleton>
          <Skeleton>
            <PaginationItem>
              <PaginationNext href={""} />
            </PaginationItem>
          </Skeleton>
          <Skeleton>
            <PaginationItem>
              <PaginationLast href={""} label={false} />
            </PaginationItem>
          </Skeleton>
        </PaginationContent>
      </Pagination>
    </div>
    <div className="flex w-full flex-wrap justify-around gap-4 rounded-md py-5">
      {createRange(0, 5).map((v) => (
        <ListingFallback key={v + "-skeleton-listing-item"} />
      ))}
    </div>
  </>
);

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

  // md:max-w-[49%] lg:max-w-[32%]

  return (
    <Card className="w-full min-w-0 bg-background md:max-w-[49%] lg:max-w-[32%]">
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

const ListingFallback = () => (
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
