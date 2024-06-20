import { createServerClient } from "@/lib/supabase";
import { ListingSearchCard } from "./ListingSearchCard";

export const SearchCardWrapper = async () => {
  const supabase = createServerClient();
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
