"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox, CheckboxBadge } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { MultiSlider } from "@/components/ui/slider";
import { assert, cn, createQueryParamsString, toNumber } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ZodSchema, z } from "zod";
import { SearchParamKey, searchParamsKeys } from "./constants";
import { AnimatePresence, motion } from "framer-motion";
import * as Portal from "@radix-ui/react-portal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const dynamic = "force-dynamic";

type FormSchemaObjectKeys = Exclude<
  (typeof searchParamsKeys)[number],
  "pageSize" | "sort" | "asc"
>;
const FormSchemaObject: Record<FormSchemaObjectKeys, ZodSchema> = {
  rentMin: z.number().min(0).nullable(),
  rentMax: z.number().min(0).nullable(),
  depositMin: z.number().min(0).nullable(),
  depositMax: z.number().min(0).nullable(),
  bedrooms: z.array(z.number().min(0)).nullable(),
  bathrooms: z.array(z.number().min(0)).nullable(),
  dogs: z.boolean(),
  cats: z.boolean(),
  cities: z.array(z.string()).nullable(),
  sqFtMin: z.number().min(0).nullable(),
  sqFtMax: z.number().min(0).nullable(),
  pageNumber: z.number().min(0),
  availableFrom: z.string().nullable(),
  availableTo: z.string().nullable(),
  showFilters: z.boolean(),
};

const FormSchema = z.object(FormSchemaObject);

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
  availableFrom: null,
  availableTo: null,
  showFilters: false,
};

/**
 * # TODO
 * There's a bug that happens when a filter chip is clicked from `<ListingsFilters />`
 * 1. Clicking the chip navigates to the same page but with modified search params
 * 2. For some reason, the form state is persisted across navigation
 *  - This is evident by the `useEffect` call in this component
 * 3. This causes the form state to be out of sync with the search params despite this being 'initial page load'
 * 4. Since the `useEffect` shows this desync, I need to extract the inital code that runs to initialize the form state from search params as a function that I call on mount and whenever search params change
 */
export const ListingSearchCard = ({
  cities,
  bedrooms,
  bathrooms,
}: {
  cities: string[];
  bedrooms: number[];
  bathrooms: number[];
}) => {
  const pathName = usePathname();
  const sp = useSearchParams();
  const SHOW_FILTERS: SearchParamKey = "showFilters";
  const [isFiltersShown, setFiltersShown] = useState(false);
  // const isFiltersShown = !!sp.get(SHOW_FILTERS);
  // const href =
  //   pathName +
  //   "?" +
  //   createQueryParamsString(sp, { [SHOW_FILTERS]: !isFiltersShown || null });

  // const createQueryStringCallback = useCallback(
  //   (obj: Record<string, any>) => createQueryParamsString(sp, obj),
  //   [sp],
  // );
  const spCities = (sp.get("cities") ?? "").split(",").filter((s) => !!s);
  const spBedrooms = (sp.get("bedrooms") ?? "")
    .split(",")
    .map((s) => Number(s || NaN))
    .filter((n) => !Number.isNaN(n));
  const spBathrooms = (sp.get("bathrooms") ?? "")
    .split(",")
    .map((s) => Number(s || NaN))
    .filter((n) => !Number.isNaN(n));

  const spForm: TFormSchema = {
    rentMin: toNumber(sp.get("rentMin")) || null,
    rentMax: toNumber(sp.get("rentMax")) || null,
    depositMin: toNumber(sp.get("depositMin")) || null,
    depositMax: toNumber(sp.get("depositMax")) || null,
    bedrooms: spBedrooms.length > 0 ? spBedrooms : null,
    bathrooms: spBathrooms.length > 0 ? spBathrooms : null,
    dogs: sp.get("dogs") === "true",
    cats: sp.get("cats") === "true",
    cities: spCities.length > 0 ? spCities : null,
    sqFtMin: toNumber(sp.get("sqFtMin")) || null,
    sqFtMax: toNumber(sp.get("sqFtMax")) || null,
    pageNumber: 0,
    availableFrom: sp.get("availableFrom") || null,
    availableTo: sp.get("availableTo") || null,
    showFilters: false,
  };
  const pS = Number(sp.get("pageSize"));
  const pageSize = Number.isNaN(pS) ? null : pS;
  const parsed = FormSchema.safeParse({ ...defaultFormSchema, ...spForm });
  const defaultForm = parsed.success ? parsed.data : defaultFormSchema;
  const [form, setForm] = useState<TFormSchema>(defaultForm);

  // useEffect(() => {
  //   console.log("form: ", form);
  //   console.log("sp: ", Array.from(sp));
  // }, [sp, form]);

  const updateForm = <T extends keyof typeof form>(
    key: T,
    value: (typeof form)[T],
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === 0 ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const filterForm = (f: TFormSchema) => {
    const copy = { ...f };
    // console.log("initial:", copy);
    Object.keys(copy).forEach((k) => {
      const key = assert<keyof typeof copy>(k);
      const value = copy[key];
      if (
        // value === null ||
        value === undefined ||
        value === 0 ||
        value === false ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete copy[key];
      }
    });
    // console.log("changed: ", copy);
    return copy;
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
    <>
      <Dialog open={isFiltersShown} onOpenChange={setFiltersShown}>
        <DialogTrigger
          className={buttonVariants({ variant: "outline" })}
          onClick={() => setFiltersShown((b) => !b)}
        >
          edit
        </DialogTrigger>
        {/* <div className="flex w-full justify-start">
          <Link href={href}>
          <CollapsibleTrigger
          className={buttonVariants({ variant: "outline" })}
          >
          edit filters
          </CollapsibleTrigger>
          </Link>
          </div> */}
        <DialogContent className="h-[90vh] w-[80vw] max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>Search filters</DialogTitle>
            <DialogDescription>
              Use the options below to narrow down your dream home!
              <br />
              Any unset filters will not be used. Such as zero-to-zero or
              none-selected.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full pr-2">
            <div className="px-2">
              <MonthlyRent {...commonProps} />
              <SecurityDeposit {...commonProps} />
              <SquareFeet {...commonProps} />
              <Bedrooms {...commonProps} bedrooms={bedrooms} />
              <Bathrooms {...commonProps} bathrooms={bathrooms} />
              {/* TODO dates don't work probably, issue is likely in <ListingsList /> */}
              <Available {...commonProps} />
              <Pets {...commonProps} />
              <Cities {...commonProps} cities={cities} />
            </div>
          </ScrollArea>
          <DialogFooter className="flex gap-2">
            <Link
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-xl",
              )}
              href={
                pathName + "?" + createQueryParamsString(sp, filterForm(form))
              }
              onClick={() => {
                setFiltersShown(false);
                // setForm(defaultForm);
              }}
            >
              apply
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "ghost" }), "rounded-xl")}
              href={
                pathName +
                "?" +
                createQueryParamsString({}, pageSize ? { pageSize } : {})
              }
              onClick={() => {
                setFiltersShown(false);
                setForm(defaultFormSchema);
              }}
            >
              reset
            </Link>
            {/* <Button variant={"outline"} onClick={() => setFiltersShown(false)}>
              cancel
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
      minValue={form.rentMin ?? 0}
      maxValue={form.rentMax ?? 0}
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
      minValue={form.depositMin ?? 0}
      maxValue={form.depositMax ?? 0}
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
      minValue={form.sqFtMin ?? 0}
      maxValue={form.sqFtMax ?? 0}
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

const Available = ({ form, setForm }: CommonProps) => {
  const today = new Date();
  // const todayPlus2Wk = new Date();
  // todayPlus2Wk.setDate(todayPlus2Wk.getDate() + 14);
  const fromValue = form?.availableFrom;
  const toValue = form?.availableTo;
  const fromDate = fromValue ? new Date(fromValue) : today;
  const toDate = toValue ? new Date(toValue) : today;

  return (
    <div>
      <Label htmlFor="available-date-picker" className="text-lg">
        Available date
      </Label>
      {/* <div className="text-sm text-muted-foreground">
      ...
    </div> */}
      <div className="flex items-center">
        {/* <Label htmlFor="from-date" className="sr-only">
          From date
        </Label>
        <Input
          name="from-date"
          type="date"
          max="9999-12-31"
          value={dateString}
          onChange={(e) => {
            console.log(e.target.value);
            return;
            // if (!e.target.validity) return;
            updateForm("availableFrom", e.target.value);
          }}
          className="w-32"
        />
        <span className="px-2">to</span>
        <Label htmlFor="to-date" className="sr-only">
          To date
        </Label>
        <Input
          name="to-date"
          type="date"
          max="9999-12-31"
          value={new Date(form?.availableTo ?? "").toLocaleDateString("en-CA")}
          onChange={(e) => {
            console.log(e.target.value);
            return;
            // if (!e.target.validity) return;
            updateForm(
              "availableTo",
              // new Date(e.target.value).toLocaleDateString("en-CA"),
              e.target.value,
            );
          }}
          className="w-32"
        /> */}
        <Popover modal>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex items-center justify-center p-2",
            )}
          >
            Select dates
            <CalendarIcon className="h-3/4" />
          </PopoverTrigger>
          <PopoverContent
            side="right"
            avoidCollisions
            className="flex flex-col items-center justify-center"
            // container={container}
          >
            <Calendar
              id="available-date-picker"
              mode="range"
              selected={{ from: fromDate, to: toDate }}
              onSelect={({ from, to } = { from: undefined, to: undefined }) =>
                setForm((prev) => ({
                  ...prev,
                  availableFrom: from
                    ? from.toLocaleDateString()
                    : prev.availableFrom,
                  availableTo: to ? to.toLocaleDateString() : prev.availableTo,
                }))
              }
            />
            <div className="flex items-center justify-center gap-2">
              <PopoverClose
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    availableFrom: null,
                    availableTo: null,
                  }))
                }
                className={buttonVariants({ variant: "ghost" })}
              >
                reset
              </PopoverClose>
              <PopoverClose className={buttonVariants({ variant: "default" })}>
                close
              </PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
        {fromValue && toValue && (
          <span className="text-muted-foreground">
            &nbsp;&nbsp;From {fromValue} to {toValue}
          </span>
        )}
      </div>
    </div>
  );
};

const Bedrooms = ({
  bedrooms,
  ...props
}: CommonProps & { bedrooms: number[] }) => (
  <div>
    <Label className="text-lg">Bedrooms</Label>
    <div className="text-sm text-muted-foreground">
      These are the bedroom counts for all current listings
    </div>
    <BadgesToggles
      {...props}
      choiceArr={bedrooms}
      formKey="bedrooms"
      selectAllLabel="select-all-bedrooms"
    />
  </div>
);

const Bathrooms = ({
  bathrooms,
  ...props
}: CommonProps & { bathrooms: number[] }) => (
  <div>
    <Label className="text-lg">Bathrooms</Label>
    <div className="text-sm text-muted-foreground">
      These are the bathrooms counts for all current listings
    </div>
    <BadgesToggles
      {...props}
      choiceArr={bathrooms}
      formKey="bathrooms"
      selectAllLabel="select-all-bathrooms"
    />
  </div>
);

const Cities = ({ cities, ...props }: CommonProps & { cities: string[] }) => (
  <div>
    <Label className="text-lg">Cities</Label>
    <div className="text-sm text-muted-foreground">
      These are all the cities property managements are using for the current
      listings (they may not all be actual cities).
    </div>
    <BadgesToggles
      {...props}
      choiceArr={cities}
      formKey="cities"
      selectAllLabel="select-all-cities"
    />
  </div>
);

const BadgesToggles = <K extends keyof TFormSchema>({
  form,
  setForm,
  formKey,
  choiceArr,
  selectAllLabel,
}: CommonProps & {
  formKey: K;
  choiceArr: (string | number)[];
  selectAllLabel: string;
}) => {
  const arr = form[formKey] as string[];

  return (
    <div className="flex w-full flex-wrap gap-1.5 py-2">
      <div className="flex items-center gap-1">
        <Label className="sr-only" htmlFor={selectAllLabel}>
          Select all
        </Label>
        <CheckboxBadge
          name={selectAllLabel}
          id={selectAllLabel}
          className="px-5 py-1"
          checked={arr?.length === choiceArr.length}
          onCheckedChange={(b) => {
            const newArr = b ? [...choiceArr] : [];
            setForm((prev) => ({ ...prev, [formKey]: newArr }));
          }}
        >
          Select all
        </CheckboxBadge>
      </div>
      {choiceArr.map((c) => (
        <div key={c} className="flex items-center">
          <Label className="sr-only" htmlFor={c.toString()}>
            {c}
          </Label>
          <CheckboxBadge
            className="px-5 py-1"
            name={c.toString()}
            id={c.toString()}
            checked={(form[formKey] as typeof choiceArr)?.includes(c)}
            onCheckedChange={(b) => {
              setForm((prev) => {
                const arr =
                  (prev?.[formKey] as typeof choiceArr)?.filter(
                    (v) => v !== c,
                  ) ?? [];
                if (!!b) {
                  return {
                    ...prev,
                    [formKey]: [...arr, c],
                  };
                }
                if (arr.length === 0) {
                  return {
                    ...prev,
                    [formKey]: null,
                  };
                }
                return {
                  ...prev,
                  [formKey]: arr,
                };
              });
            }}
          >
            {c}
          </CheckboxBadge>
        </div>
      ))}
    </div>
  );
};

const Pets = ({ form, updateForm }: CommonProps) => (
  <div>
    <Label className="text-lg">Pets</Label>
    <div className="text-sm text-muted-foreground">
      Check to require, optional otherwise. Other pets may be specified per
      listing!
    </div>
    <div className="flex gap-1.5 py-2">
      <CheckboxBadge
        name="cats"
        id="cats"
        className="px-5 py-1"
        checked={form.cats}
        onCheckedChange={(b) => updateForm("cats", !!b)}
      >
        Cats
      </CheckboxBadge>
      <Label htmlFor="cats" className="sr-only">
        Cats
      </Label>
      <CheckboxBadge
        name="dogs"
        id="dogs"
        className="px-5 py-1"
        checked={form.dogs}
        onCheckedChange={(b) => updateForm("dogs", !!b)}
      >
        {"Dogs"}
      </CheckboxBadge>
      <Label htmlFor="dogs" className="sr-only">
        Dogs
      </Label>
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
