import { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import { SearchParamObj } from "./constants";
import { ListingList, ListingListFallback } from "./ListingList";

export const metadata: Metadata = {
  title: "HCR | Listings!",
  description: "Listings from Humboldt County, all in one place!",
};

// revalidatePath("/listings");

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParamObj;
}) {
  // const [isFiltersShown, setFiltersShown] = useState(false);

  // TODO add a chart here?
  return (
    <div className="flex size-full flex-col items-center justify-start gap-5 py-5">
      {/* <Suspense fallback={<ListingSearchCardFallback />}>
        <SearchCardWrapper />
      </Suspense> */}

      <Suspense fallback={<ListingListFallback />}>
        <ListingList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
