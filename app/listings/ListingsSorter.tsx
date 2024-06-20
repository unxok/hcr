"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ZodLiteral, z } from "zod";
import { assert, createQueryParamsString } from "@/lib/utils";
import { SearchParamKey, SortOption, sortOptionsArr } from "./constants";

export const sortOptionsWithDisplay: {
  display: string;
  value: SortOption;
  asc: boolean;
}[] = [
  { display: "Rent - highest first", value: "market_rent", asc: false },
  { display: "Rent - lowest first", value: "market_rent", asc: true },
  { display: "Bedrooms - highest first", value: "bedrooms", asc: false },
] as const;

export const ListingsSorter = () => {
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const spSort: SearchParamKey = "sort";
  const spAsc: SearchParamKey = "asc";
  const spSortValue = searchParams.get(spSort) ?? "";
  const ascValue = searchParams.get(spAsc) === "true";
  const sortValue = sortOptionsArr.includes(spSortValue as SortOption)
    ? spSortValue
    : sortOptionsArr[0];

  const onValueChange = (v: string) => {
    const [selectedSort, selectedAsc] = v.split(";") as [string, string];
    const { value, asc } = sortOptionsArr.includes(selectedSort as SortOption)
      ? { value: selectedSort, asc: selectedAsc === "true" }
      : sortOptionsWithDisplay[0];
    router.push(
      pathName +
        "?" +
        createQueryParamsString(searchParams, { sort: value, asc: asc }),
    );
  };

  return (
    <div className="flex w-full items-center gap-2">
      <div>Sort by</div>
      <Select
        value={sortValue + ";" + ascValue}
        onValueChange={(v) => onValueChange(v)}
      >
        <SelectTrigger className="w-60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptionsWithDisplay.map(({ display, value, asc }) => (
            <SelectItem
              key={value + asc + "sort-filter-chip"}
              value={value + ";" + asc}
            >
              {display}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
