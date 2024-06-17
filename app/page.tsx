import { BedroomAveragesChart } from "@/components/Charts/BedroomAveragesChart";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { Vortex } from "@/components/ui/vortex";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Clock, UsersRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function Page() {
  const { data: pms } = await supabase.from("property_managements").select("*");
  return (
    <div className="dark flex w-full flex-col items-center justify-center gap-8 p-5">
      <div className="h-96 w-full overflow-hidden">
        <Vortex
          particleCount={100}
          baseSpeed={0.1}
          className="flex h-full w-full flex-col items-center justify-center gap-3"
          containerClassName="fade-in"
          backgroundColor="transparent"
          baseHue={40}
        >
          <h2 className="animate-fade-right text-5xl font-bold tracking-wide animate-delay-300">
            One site, all the rentals*
          </h2>
          <p className="animate-fade-left animate-delay-500">
            *from Humboldt County that is. Sorry everyone else!
          </p>
          <Link
            href={"/listings"}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "animate-fade-up bg-secondary/30 backdrop-blur-sm animate-delay-700",
            )}
          >
            view listings
          </Link>
        </Vortex>
      </div>
      <Suspense>
        <BedroomAverages />
      </Suspense>
      <div className="h-90 relative flex w-full items-center justify-center antialiased">
        <InfiniteMovingCards
          className=""
          speed="slow"
          direction="right"
          pauseOnHover
          items={[
            {
              name: "Me",
              quote:
                "I used to check all the different property managements' websites multiple times a day. Now it's all in one convenient place!",
            },
            {
              name: "A local probably",
              quote: "Finding the perfect rental was so easy thanks to HCR!",
            },
            {
              name: "A dark mode enjoyer",
              quote:
                "It should be illegal for a website to not have dark mode. Thanks HCR for being competent!",
            },
            {
              name: "My husband",
              quote: "Looks too pretty for just a rental listings site...",
            },
          ]}
        />
      </div>
      <div className="flex w-full items-center justify-center gap-2">
        <div className="w-full md:w-1/2">
          <h2 className="text-4xl font-bold">
            Listings updated every 10 minutes
          </h2>
          <p className="text-muted-foreground">
            Stay up to date with all the best rentals with ease. No more wasting
            countless minutes loading up each and every property management
            website.
          </p>
        </div>
        <div className="hidden w-1/2 items-center justify-center md:flex">
          <Clock size={200} className="hover:animate-spin" />
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-2">
        <div className="hidden w-1/2 items-center justify-center md:flex">
          <UsersRound size={200} className="hover:animate-shake" />
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-4xl font-bold">For the community</h2>
          <p className="text-muted-foreground">
            This site is not officially sponsored or affiliated with property
            managements, and I plan to keep it that way.
          </p>
          <br />
          <p className="text-muted-foreground">
            Signing up for an account will always be <u>free forever</u>. With
            an account you'll be able to do things like:
          </p>
          <ul className="list-disc pl-8">
            <li>Save your favorite listings</li>
            <li>Leave comments on listings and property managements</li>
            <li>Get email notifications for saved search filters</li>
            <li>...more?</li>
          </ul>
        </div>
      </div>
      <div className="w-full">
        <h2 className="text-4xl font-bold">Supported property managements</h2>
        <p className="text-muted-foreground">
          Below are the property managements that HCR is currently gathering
          rental data from and those that have been decided to not be supported
          (usually for technical reasons).
        </p>
        <br />
        <p className="text-muted-foreground">
          HCR is <u>not officially affiliated</u> with any property managements.
        </p>
        <br />
        <h3 className="text-xl font-bold">Supported</h3>
        <div className="flex flex-wrap gap-2 p-3">
          {pms?.map(
            ({
              id,
              display_name,
              accent_color,
              accent_color_foreground,
              listings_url,
            }) => (
              <a
                key={id + "property-management-badge-home"}
                href={listings_url}
              >
                <Badge
                  style={{
                    color: accent_color_foreground,
                    backgroundColor: accent_color,
                  }}
                >
                  {display_name}
                </Badge>
              </a>
            ),
          )}
        </div>
        <h3 className="text-xl font-bold">Not supported</h3>
        <div className="flex flex-wrap gap-2 p-3">
          <Badge className="bg-secondary text-secondary-foreground">
            Private landlords
          </Badge>
          <Badge className="bg-secondary text-secondary-foreground">
            Craigslist ads
          </Badge>
        </div>
        <p>
          <span className="text-muted-foreground">
            Don't see the one you're thinking of?
          </span>{" "}
          <a
            href="/request"
            className={buttonVariants({ variant: "secondary" })}
          >
            Submit a request
          </a>
        </p>
      </div>
    </div>
  );
}

const BedroomAverages = async () => {
  const { data } = await supabase
    .from("current_stats_by_bedrooms")
    .select("bedrooms, avg_market_rent, median_market_rent")
    .gte("bedrooms", 0);
  return (
    <BedroomAveragesChart
      data={data?.map((d) => ({ ...d, bedrooms: d.bedrooms + " bd" })) ?? null}
    />
  );
};
