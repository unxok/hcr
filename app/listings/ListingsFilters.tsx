import { Button } from "@/components/ui/button";
import { filterObject, createQueryParamsString } from "@/lib/utils";
import { Suspense } from "react";
import { SearchCardWrapper } from "./SearchCardWrapper";
import { BadgeLink } from "@/components/ui/badge";

export const ListingsFilters = ({
  searchParams,
  pathName,
}: {
  searchParams: Record<string, any>;
  pathName: string;
}) => {
  const sp = filterObject(searchParams, [false, 0, null, undefined]);
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
    cities: preSelectedCities,
    availableFrom,
    availableTo,
  } = sp;

  const selectedCities = preSelectedCities?.filter((c: string) => !!c);

  // console.log(sp);
  return (
    <div className="flex w-full flex-wrap items-center justify-start gap-1">
      <span>Filters </span>
      <Suspense fallback={<Button className="opacity-0">edit</Button>}>
        <SearchCardWrapper />
      </Suspense>
      {!!rentMin && (
        <BadgeLink
          label={`Min rent $${rentMin?.toLocaleString()}`}
          href={pathName + createQueryParamsString(sp, { rentMin: null })}
        />
      )}
      {!!rentMax && (
        <BadgeLink
          label={`Max rent $${rentMax?.toLocaleString()}`}
          href={pathName + createQueryParamsString(sp, { rentMax: null })}
        />
      )}
      {!!depositMin && (
        <BadgeLink
          label={`Min deposit $${depositMin?.toLocaleString()}`}
          href={pathName + createQueryParamsString(sp, { depositMin: null })}
        />
      )}
      {!!depositMax && (
        <BadgeLink
          label={`Max deposit $${depositMax?.toLocaleString()}`}
          href={pathName + createQueryParamsString(sp, { depositMax: null })}
        />
      )}
      {!!sqFtMin && (
        <BadgeLink
          label={`Min square ft ${sqFtMin?.toLocaleString()}`}
          href={pathName + createQueryParamsString(sp, { sqFtMin: null })}
        />
      )}
      {!!sqFtMax && (
        <BadgeLink
          label={`Max square ft ${sqFtMax?.toLocaleString()}`}
          href={pathName + createQueryParamsString(sp, { sqFtMax: null })}
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
              createQueryParamsString(sp, {
                bedrooms:
                  bedrooms.filter((b) => b !== n).length > 0
                    ? bedrooms.filter((b) => b !== n)
                    : null,
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
              createQueryParamsString(sp, {
                bathrooms:
                  bathrooms.filter((b) => b !== n).length > 0
                    ? bathrooms.filter((b) => b !== n)
                    : null,
              })
            }
          />
        ))}
      {!!availableFrom && (
        <BadgeLink
          label={
            `Available since ` + new Date(availableFrom).toLocaleDateString()
          }
          href={pathName + createQueryParamsString(sp, { availableFrom: null })}
        />
      )}
      {!!availableTo && (
        <BadgeLink
          label={
            `Available up to ` + new Date(availableTo).toLocaleDateString()
          }
          href={pathName + createQueryParamsString(sp, { availableTo: null })}
        />
      )}
      {!!cats && (
        <BadgeLink
          label={`Cats required`}
          href={pathName + createQueryParamsString(sp, { cats: null })}
        />
      )}
      {!!dogs && (
        <BadgeLink
          label={`Dogs required`}
          href={pathName + createQueryParamsString(sp, { dogs: null })}
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
              createQueryParamsString(sp, {
                cities:
                  selectedCities.filter((b) => b !== n).length > 0
                    ? selectedCities.filter((b) => b !== n)
                    : null,
              })
            }
          />
        ))}
    </div>
  );
};
