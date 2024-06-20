import { Database } from "@/lib/supabase.types";

export const defaultPageSize = 10;

export const searchParamsKeys = [
  "rentMin",
  "rentMax",
  "depositMin",
  "depositMax",
  "bedrooms",
  "bathrooms",
  "dogs",
  "cats",
  "cities",
  "sqFtMin",
  "sqFtMax",
  "pageNumber",
  "availableFrom",
  "availableTo",
  "pageSize",
  "pageNumber",
  "sort",
  "asc",
  "showFilters",
] as const;

export type SearchParamKey = (typeof searchParamsKeys)[number];

export type SearchParamObj<T = void> = Record<
  SearchParamKey,
  string | string[] | undefined | T
>;

export type ListingsColumn =
  keyof Database["public"]["Tables"]["listings"]["Row"];

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"] & {
  property_managements: Database["public"]["Tables"]["property_managements"]["Row"];
};

/***************** WEIRDNESS AHEAD ******************/

// Gonna have to manually make sure the two arrays are the same value
// First is where you should edit as needed because you get intellisense
// Second is needed because you have to type `as const` (without the `: ListingColumn[]`) in order to get true literal type inferrence

/**
 * Make sure always matches `sortOptionsArr` value
 */
const sortOptionsArr_NOT_TYPE_SAFE: ListingsColumn[] = [
  "market_rent",
  "bedrooms",
  "bathrooms",
];

/**
 * Make sure always matches `sortOptionsArr_NOT_TYPE_SAFE` value
 */
export const sortOptionsArr = ["market_rent", "bedrooms", "bathrooms"] as const;

export type SortOption = (typeof sortOptionsArr)[number];

/***************** WEIRDNESS ABOVE ******************/
