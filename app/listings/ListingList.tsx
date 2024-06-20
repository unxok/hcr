import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  toNumber,
  getDateFromSearchParams,
  createRange,
  assert,
} from "@/lib/utils";
import { Listing, ListingFallback } from "./Listing";
import { ListingsFilters } from "./ListingsFilters";
import { ListingsSorter } from "./ListingsSorter";
import { ListingsToolbar } from "./ListingsToolbar";
import {
  SearchParamObj,
  defaultPageSize,
  sortOptionsArr,
  SortOption,
  ListingRow,
} from "./constants";
import { createServerClient } from "@/lib/supabase";

export const ListingList = async ({
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
  const supabase = createServerClient();
  let listingsQuery = supabase
    .from("listings")
    .select("*, property_managements ( * )", { count: "exact" })
    .gte("market_rent", rentMin)
    .gte("deposit", depositMin)
    .gte("square_feet", sqFtMin)
    .range(start, end)
    .is("unlisted_at", null)
    .order(sortOption, { ascending: asc });

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

  return (
    <>
      <ListingsSorter />
      <ListingsFilters searchParams={sp} pathName={pathName} />
      <ListingsToolbar {...toolbarProps} />

      <div className="flex w-full animate-fade-up flex-wrap justify-around gap-4 rounded-md">
        {(listings as ListingRow[])?.map((l) => (
          <Listing key={l.listable_uid} {...l} />
        ))}
      </div>
      <ListingsToolbar {...toolbarProps} />
    </>
  );
};

export const ListingListFallback = () => (
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
