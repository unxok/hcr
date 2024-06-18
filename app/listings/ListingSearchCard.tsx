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
import { Skeleton } from "@/components/ui/skeleton";
import { MultiSlider } from "@/components/ui/slider";
import { cn, createQueryParamsString, toNumber } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { z } from "zod";

const FormSchema = z.object({
  rentMin: z.number().min(0),
  rentMax: z.number().min(0),
  depositMin: z.number().min(0),
  depositMax: z.number().min(0),
  bedrooms: z.array(z.number().min(0)).nullable(),
  bathrooms: z.array(z.number().min(0)).nullable(),
  dogs: z.boolean(),
  cats: z.boolean(),
  cities: z.array(z.string()).nullable(),
  sqFtMin: z.number().min(0),
  sqFtMax: z.number().min(0),
  pageNumber: z.number().min(0),
});

export type TFormSchema = z.infer<typeof FormSchema>;

const defaultFormSchema: TFormSchema = {
  rentMin: 0,
  rentMax: 0,
  depositMin: 0,
  depositMax: 0,
  bedrooms: null,
  bathrooms: null,
  dogs: false,
  cats: false,
  cities: null,
  sqFtMin: 0,
  sqFtMax: 0,
  pageNumber: 0,
};

export const ListingSearchCard = ({
  cities,
  bedrooms,
  bathrooms,
}: {
  cities: string[];
  bedrooms: number[];
  bathrooms: number[];
}) => {
  "use client";

  const pathName = usePathname();
  const sp = useSearchParams();

  const createQueryStringCallback = useCallback(
    (obj: Record<string, any>) => createQueryParamsString(sp, obj),
    [sp],
  );
  const spCities = sp.getAll("cities");
  const spBedrooms = sp.getAll("bedrooms").map((s) => toNumber(s));
  const spBathrooms = sp.getAll("bathrooms").map((s) => toNumber(s));
  const spForm: TFormSchema = {
    rentMin: Number(sp.get("rentMin")),
    rentMax: Number(sp.get("rentMax")),
    depositMin: Number(sp.get("depositMin")),
    depositMax: Number(sp.get("depositMax")),
    bedrooms: spBedrooms.length > 0 ? spBedrooms : bedrooms,
    bathrooms: spBathrooms.length > 0 ? spBathrooms : bathrooms,
    dogs: sp.get("dogs") === "true",
    cats: sp.get("cats") === "true",
    cities: spCities.length > 0 ? spCities : cities,
    sqFtMin: Number(sp.get("sqFtMin")),
    sqFtMax: Number(sp.get("sqFtMax")),
    pageNumber: 0,
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
    value: any,
    defaultValue: number,
  ) => {
    const num = toNumber(value, defaultValue);
    updateForm(key, num as (typeof form)[T]);
  };

  const commonProps: CommonProps = {
    form,
    setForm,
    updateForm,
    updateNumberForm,
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
            <MonthlyRent {...commonProps} />
            <SecurityDeposit {...commonProps} />
            <SquareFeet {...commonProps} />
            <Bedrooms {...commonProps} bedrooms={bedrooms} />
            <Bathrooms {...commonProps} bathrooms={bathrooms} />
            <Pets {...commonProps} />
            <Cities {...commonProps} cities={cities} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link
          className={cn(buttonVariants({ variant: "default" }), "rounded-xl")}
          href={pathName + "?" + createQueryStringCallback(form)}
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

type CommonProps = {
  form: TFormSchema;
  setForm: Dispatch<SetStateAction<TFormSchema>>;
  updateForm: <T extends keyof TFormSchema>(
    key: T,
    value: TFormSchema[T],
  ) => void;
  updateNumberForm: <T extends keyof TFormSchema>(
    key: T,
    value: any,
    defaultValue: number,
  ) => void;
};

const MonthlyRent = ({ form, updateNumberForm, updateForm }: CommonProps) => (
  <div>
    <Label htmlFor="rent" className="text-lg">
      Monthly rent
    </Label>
    <RangeInputSet
      minValue={form.rentMin}
      maxValue={form.rentMax}
      min={0}
      max={10000}
      minLabel="rent-min"
      maxLabel="rent-max"
      label="rent"
      minOnchange={(e) => updateNumberForm("rentMin", e.currentTarget.value, 0)}
      maxOnchange={(e) =>
        updateNumberForm("rentMax", e.currentTarget.value, 1600)
      }
      sliderOnChange={(arr) => {
        updateForm("rentMin", arr[0]);
        updateForm("rentMax", arr[1]);
      }}
    />
  </div>
);
const SecurityDeposit = ({
  form,
  updateForm,
  updateNumberForm,
}: CommonProps) => (
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
      label="deposit"
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
);
const SquareFeet = ({ form, updateForm, updateNumberForm }: CommonProps) => (
  <div>
    <Label htmlFor="square-feet" className="text-lg">
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
      minLabel="square-feet-min"
      maxLabel="square-feet-max"
      label="square-feet"
      minOnchange={(e) => updateNumberForm("sqFtMin", e.currentTarget.value, 0)}
      maxOnchange={(e) =>
        updateNumberForm("sqFtMax", e.currentTarget.value, 2000)
      }
      sliderOnChange={(arr) => {
        updateForm("sqFtMin", arr[0]);
        updateForm("sqFtMax", arr[1]);
      }}
    />
  </div>
);

const Bedrooms = ({
  form,
  setForm,
  bedrooms,
}: CommonProps & { bedrooms: number[] }) => (
  <div>
    <Label className="text-lg">Bedrooms</Label>
    <div className="text-sm text-muted-foreground">
      These are the bedroom counts for all current listings
    </div>
    <div className="flex w-full flex-wrap gap-4 py-2">
      <div className="flex items-center gap-1">
        <Label htmlFor={"select-all-cities"}>Select all</Label>
        <Checkbox
          name={"select-all-bedrooms"}
          id={"select-all-bedrooms"}
          checked={form.bedrooms?.length === bedrooms.length}
          onCheckedChange={(b) => {
            const newBedrooms = b ? [...bedrooms] : [];
            setForm((prev) => ({ ...prev, bedrooms: newBedrooms }));
          }}
        />
      </div>
      {bedrooms.map((c) => (
        <div key={c} className="flex items-center gap-1">
          <Label htmlFor={c.toString()}>{c}</Label>
          <Checkbox
            name={c.toString()}
            id={c.toString()}
            checked={form.bedrooms?.includes(c)}
            onCheckedChange={(b) => {
              setForm((prev) => {
                const arr = prev?.bedrooms?.filter((bed) => bed !== c) ?? [];
                if (!!b) {
                  return {
                    ...prev,
                    bedrooms: [...arr, c],
                  };
                }
                if (arr.length === 0) {
                  return {
                    ...prev,
                    bedrooms: null,
                  };
                }
                return {
                  ...prev,
                  bedrooms: arr,
                };
              });
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

const Bathrooms = ({
  form,
  setForm,
  bathrooms,
}: CommonProps & { bathrooms: number[] }) => (
  <div>
    <Label className="text-lg">Bathrooms</Label>
    <div className="text-sm text-muted-foreground">
      These are the bathrooms counts for all current listings
    </div>
    <div className="flex w-full flex-wrap gap-4 py-2">
      <div className="flex items-center gap-1">
        <Label htmlFor={"select-all-cities"}>Select all</Label>
        <Checkbox
          name={"select-all-bedrooms"}
          id={"select-all-bedrooms"}
          checked={form.bathrooms?.length === bathrooms.length}
          onCheckedChange={(b) => {
            const newBathrooms = b ? [...bathrooms] : [];
            setForm((prev) => ({ ...prev, bathrooms: newBathrooms }));
          }}
        />
      </div>
      {bathrooms.map((c) => (
        <div key={c} className="flex items-center gap-1">
          <Label htmlFor={c.toString()}>{c}</Label>
          <Checkbox
            name={c.toString()}
            id={c.toString()}
            checked={form.bathrooms?.includes(c)}
            onCheckedChange={(b) => {
              setForm((prev) => {
                const arr = prev?.bathrooms?.filter((bath) => bath !== c) ?? [];
                if (!!b) {
                  return {
                    ...prev,
                    bathrooms: [...arr, c],
                  };
                }
                if (arr.length === 0) {
                  return {
                    ...prev,
                    bathrooms: null,
                  };
                }
                return {
                  ...prev,
                  bathrooms: arr,
                };
              });
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

const Pets = ({ form, updateForm }: CommonProps) => (
  <div>
    <Label className="text-lg">Pets</Label>
    <div className="text-sm text-muted-foreground">
      Check to require, optional otherwise. Other pets may be specified per
      listing!
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
);

const Cities = ({
  form,
  setForm,
  cities,
}: CommonProps & { cities: string[] }) => (
  <div>
    <Label className="text-lg">Cities</Label>
    <div className="text-sm text-muted-foreground">
      These are all the 'cities' property managements are using for the current
      listings
    </div>
    <div className="flex w-full flex-wrap gap-4 py-2">
      <div className="flex items-center gap-1">
        <Label htmlFor={"select-all-cities"}>Select all</Label>
        <Checkbox
          name={"select-all-cities"}
          id={"select-all-cities"}
          checked={form.cities?.length === cities.length}
          onCheckedChange={(b) => {
            const newCities = b ? [...cities] : [];
            setForm((prev) => ({ ...prev, cities: newCities }));
          }}
        />
      </div>
      {cities.map((c) => (
        <div key={c} className="flex items-center gap-1">
          <Label htmlFor={c}>{c}</Label>
          <Checkbox
            name={c}
            id={c}
            checked={form.cities?.includes(c)}
            onCheckedChange={(b) => {
              setForm((prev) => {
                const arr = prev?.cities?.filter((city) => city !== c) ?? [];
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
        </div>
      ))}
    </div>
  </div>
);

export const ListingSearchCardFallback = () => (
  <Card className="w-full bg-background">
    <CardHeader>
      <CardTitle>
        <Skeleton>All listings</Skeleton>
      </CardTitle>
      <CardDescription>
        <Skeleton>
          last updated <span>2024-06-15 08:30 AM</span>
        </Skeleton>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Skeleton>
        <Button>Show search filters</Button>
      </Skeleton>
    </CardContent>
    <CardFooter className="flex gap-2">
      <Skeleton>
        <Link className={cn(buttonVariants({ variant: "default" }))} href={""}>
          apply
        </Link>
      </Skeleton>
      <Skeleton>
        <Link className={cn(buttonVariants({ variant: "ghost" }))} href={""}>
          reset
        </Link>
      </Skeleton>
    </CardFooter>
  </Card>
);

const RangeInputSet = ({
  minValue,
  maxValue,
  min,
  max,
  minLabel,
  maxLabel,
  label,
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
  label: string;
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
      name={label}
      id={label}
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
