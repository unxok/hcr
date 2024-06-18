"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createQueryParamsString, createRange } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const PageSelector = ({
  pathName,
  searchParams,
  pageNumber,
  totalPages,
}: {
  pathName: string;
  searchParams: Record<string, any>;
  pageNumber: number;
  totalPages: number;
}) => {
  const router = useRouter();
  return (
    <Select
      onValueChange={(v) =>
        router.push(
          pathName +
            createQueryParamsString(searchParams, {
              pageNumber: v,
            }),
        )
      }
    >
      <SelectTrigger arrow={false} className="w-12 justify-center">
        {pageNumber}
      </SelectTrigger>
      <SelectContent>
        {createRange(1, totalPages + 1).map((v) => (
          <SelectItem key={v + "-pagination-item"} value={v.toString()}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
