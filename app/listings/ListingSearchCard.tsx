"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSlider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChangeEvent, useCallback, useState } from "react";
import { z } from "zod";

const FormSchema = z.object({
  rentMin: z.number().min(0),
  rentMax: z.number().min(0),
  depositMin: z.number().min(0),
  depositMax: z.number().min(0),
  bedsMin: z.number().min(0),
  bedsMax: z.number().min(0),
  bathsMin: z.number().min(0),
  bathsMax: z.number().min(0),
  dogs: z.boolean(),
  cats: z.boolean(),
  cities: z.array(z.string()).nullable(),
  sqFtMin: z.number().min(0),
  sqFtMax: z.number().min(0),
});

export type TFormSchema = z.infer<typeof FormSchema>;

const defaultFormSchema: TFormSchema = {
  rentMin: 0,
  rentMax: 0,
  depositMin: 0,
  depositMax: 0,
  bedsMin: 0,
  bedsMax: 0,
  bathsMin: 0,
  bathsMax: 0,
  dogs: false,
  cats: false,
  cities: null,
  sqFtMin: 0,
  sqFtMax: 0,
};

export const ListingSearchCard = ({ cities }: { cities: string[] }) => {
  "use client";

  const pathName = usePathname();
  const sp = useSearchParams();

  const createQueryString = useCallback(
    (obj: Record<string, any>) => {
      const params = new URLSearchParams(sp.toString());
      Object.keys(obj).forEach((key) => params.set(key, obj[key]));
      return params.toString();
    },
    [sp],
  );
  const spForm: TFormSchema = {
    rentMin: Number(sp.get("rentMin")),
    rentMax: Number(sp.get("rentMax")),
    depositMin: Number(sp.get("depositMin")),
    depositMax: Number(sp.get("depositMax")),
    bedsMin: Number(sp.get("bedsMin")),
    bedsMax: Number(sp.get("bedsMax")),
    bathsMin: Number(sp.get("bathsMin")),
    bathsMax: Number(sp.get("bathsMax")),
    dogs: sp.get("dogs") === "true",
    cats: sp.get("cats") === "true",
    cities: sp.getAll("cities"),
    sqFtMin: Number(sp.get("sqFtMin")),
    sqFtMax: Number(sp.get("sqFtMax")),
  };
  const parsed = FormSchema.safeParse({ ...defaultFormSchema, ...spForm });
  const defaultForm = parsed.success ? parsed.data : defaultFormSchema;

  const [isFiltersShown, setFiltersShown] = useState(false);
  const [form, setForm] = useState<TFormSchema>(defaultForm);

  const updateForm = <T extends keyof typeof form>(
    key: T,
    value: (typeof form)[T],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNumberForm = <T extends keyof typeof form>(
    key: T,
    value: string,
    defaultValue: number,
  ) => {
    const val = Number(value);
    const num = Number.isNaN(val) ? defaultValue : val;
    updateForm(key, num as (typeof form)[T]);
  };

  return (
    <Card className="w-full animate-fade-right bg-background">
      <CardHeader>
        <CardTitle>All listings</CardTitle>
        <CardDescription>
          last updated <span>2024-06-15 08:30 AM</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={isFiltersShown} onOpenChange={setFiltersShown}>
          <CollapsibleTrigger
            className={buttonVariants({ variant: "outline" })}
          >
            {isFiltersShown ? "Hide" : "Show"} search filters
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2 py-3">
            <div>
              <Label htmlFor="beds" className="text-lg">
                Monthly rent
              </Label>
              <RangeInputSet
                minValue={form.rentMin}
                maxValue={form.rentMax}
                min={0}
                max={10000}
                minLabel="rent-min"
                maxLabel="rent-max"
                minOnchange={(e) =>
                  updateNumberForm("rentMin", e.currentTarget.value, 0)
                }
                maxOnchange={(e) =>
                  updateNumberForm("rentMax", e.currentTarget.value, 1600)
                }
                sliderOnChange={(arr) => {
                  updateForm("rentMin", arr[0]);
                  updateForm("rentMax", arr[1]);
                }}
              />
            </div>
            <div>
              <Label htmlFor="deposit" className="text-lg">
                Security deposit
              </Label>
              <RangeInputSet
                minValue={form.depositMin}
                maxValue={form.depositMax}
                min={0}
                max={20000}
                minLabel="deposit-min"
                maxLabel="deposit-max"
                minOnchange={(e) =>
                  updateNumberForm("depositMin", e.currentTarget.value, 0)
                }
                maxOnchange={(e) =>
                  updateNumberForm("depositMax", e.currentTarget.value, 3200)
                }
                sliderOnChange={(arr) => {
                  updateForm("depositMin", arr[0]);
                  updateForm("depositMax", arr[1]);
                }}
              />
            </div>
            <div>
              <Label htmlFor="beds" className="text-lg">
                Bedrooms
              </Label>
              <RangeInputSet
                minValue={form.bedsMin}
                maxValue={form.bedsMax}
                min={0}
                max={50}
                minLabel="beds-min"
                maxLabel="beds-max"
                minOnchange={(e) =>
                  updateNumberForm("bedsMin", e.currentTarget.value, 0)
                }
                maxOnchange={(e) =>
                  updateNumberForm("bedsMax", e.currentTarget.value, 4)
                }
                sliderOnChange={(arr) => {
                  updateForm("bedsMin", arr[0]);
                  updateForm("bedsMax", arr[1]);
                }}
              />
            </div>
            <div>
              <Label htmlFor="beds" className="text-lg">
                Bathrooms
              </Label>
              <RangeInputSet
                minValue={form.bathsMin}
                maxValue={form.bathsMax}
                min={0}
                max={50}
                minLabel="baths-min"
                maxLabel="baths-max"
                minOnchange={(e) =>
                  updateNumberForm("bathsMin", e.currentTarget.value, 0)
                }
                maxOnchange={(e) =>
                  updateNumberForm("bathsMax", e.currentTarget.value, 4)
                }
                sliderOnChange={(arr) => {
                  updateForm("bathsMin", arr[0]);
                  updateForm("bathsMax", arr[1]);
                }}
              />
            </div>
            <div>
              <Label htmlFor="squareFeet" className="text-lg">
                Square feet
              </Label>
              <div className="pb-1 text-sm text-muted-foreground">
                Caution: this field is often not included with listings
              </div>
              <RangeInputSet
                minValue={form.sqFtMin}
                maxValue={form.sqFtMax}
                min={0}
                max={50000}
                minLabel="squareFeet-min"
                maxLabel="squareFeet-max"
                minOnchange={(e) =>
                  updateNumberForm("sqFtMin", e.currentTarget.value, 0)
                }
                maxOnchange={(e) =>
                  updateNumberForm("sqFtMax", e.currentTarget.value, 2000)
                }
                sliderOnChange={(arr) => {
                  updateForm("sqFtMin", arr[0]);
                  updateForm("sqFtMax", arr[1]);
                }}
              />
            </div>
            <div>
              <Label htmlFor="pets" className="text-lg">
                Pets
              </Label>
              <div className="text-sm text-muted-foreground">
                Check to require, optional otherwise. Other pets may be
                specified per listing!
              </div>
              <div className="flex gap-4 py-2">
                <div className="flex w-fit items-center justify-center gap-1">
                  <Checkbox
                    name="dogs"
                    id="dogs"
                    checked={form.dogs}
                    onCheckedChange={(b) => updateForm("dogs", !!b)}
                  />
                  <Label htmlFor="dogs">Dogs</Label>
                </div>
                <div className="flex w-fit items-center justify-center gap-1">
                  <Checkbox
                    name="cats"
                    id="cats"
                    checked={form.cats}
                    onCheckedChange={(b) => updateForm("cats", !!b)}
                  />
                  <Label htmlFor="cats">Cats</Label>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="pets" className="text-lg">
                Pets
              </Label>
              <div className="text-sm text-muted-foreground">
                These are all the 'cities' property managements are using for
                the current listings
              </div>
              <div className="flex w-full flex-wrap gap-4 py-2">
                {cities.map((c) => (
                  <div key={c} className="flex items-center gap-1">
                    <Checkbox
                      name={c}
                      id={c}
                      checked={form.cities?.includes(c)}
                      onCheckedChange={(b) => {
                        setForm((prev) => {
                          const arr =
                            prev?.cities?.filter((city) => city !== c) ?? [];
                          if (!!b) {
                            return {
                              ...prev,
                              cities: [...arr, c],
                            };
                          }
                          if (arr.length === 0) {
                            return {
                              ...prev,
                              cities: null,
                            };
                          }
                          return {
                            ...prev,
                            cities: arr,
                          };
                        });
                      }}
                    />
                    <Label htmlFor={c}>{c}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link
          className={cn(buttonVariants({ variant: "default" }), "rounded-xl")}
          href={pathName + "?" + createQueryString(form)}
        >
          apply
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "ghost" }), "rounded-xl")}
          href={pathName}
          onClick={() => setForm(defaultFormSchema)}
        >
          reset
        </Link>
      </CardFooter>
    </Card>
  );
};

const RangeInputSet = ({
  minValue,
  maxValue,
  min,
  max,
  minLabel,
  maxLabel,
  minOnchange,
  maxOnchange,
  sliderOnChange,
}: {
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  minOnchange: (e: ChangeEvent<HTMLInputElement>) => void;
  maxOnchange: (e: ChangeEvent<HTMLInputElement>) => void;
  sliderOnChange: (arr: number[]) => void;
}) => (
  <div className="flex items-center justify-start gap-2 py-2">
    <Input
      type="number"
      className="w-20"
      name={minLabel}
      id={minLabel}
      value={minValue}
      onChange={minOnchange}
    />
    to
    <Input
      type="number"
      className="w-20"
      name={maxLabel}
      id={maxLabel}
      value={maxValue}
      onChange={maxOnchange}
    />
    {/* <span className='text-sm text-muted-foreground'>{min}</span> */}
    <MultiSlider
      name="rent"
      id="rent"
      value={[minValue, maxValue]}
      min={min}
      max={max}
      onValueChange={sliderOnChange}
      thumbLabels={true}
      className="hidden sm:flex"
    />
    <span className="hidden text-sm text-muted-foreground sm:inline">
      {max.toLocaleString()}
    </span>
  </div>
);
