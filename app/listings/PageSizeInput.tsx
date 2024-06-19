"use client";

import { Input } from "@/components/ui/input";
import { defaultPageSize } from "@/lib/constants";
import { createQueryParamsString, toNumber } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export const PageSizeInput = ({
  searchParams,
}: {
  searchParams: Record<string, any>;
}) => {
  const key = "pageSize";
  const pathName = usePathname();
  const router = useRouter();

  return (
    <div className="flex animate-fade-right items-center animate-delay-200">
      <form
        action={(f: FormData) => {
          const pageSize = toNumber(f.get(key), defaultPageSize);
          router.push(
            pathName +
              "?" +
              createQueryParamsString(searchParams, { [key]: pageSize }),
          );
        }}
        className="flex items-center"
      >
        <Input
          name={key}
          type="number"
          step={1}
          min={1}
          max={100}
          className="w-16"
          defaultValue={toNumber(searchParams[key], defaultPageSize)}
        ></Input>
      </form>
      &nbsp;&nbsp;
      <span>results per page</span>
    </div>
  );
};
