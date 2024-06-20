import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
} from "@/components/ui/pagination";
import { createQueryParamsString } from "@/lib/utils";
import { PageSelector } from "./PageSelector";
import { PageSizeInput } from "./PageSizeInput";

export const ListingsToolbar = ({
  totalPages,
  nextPage,
  prevPage,
  start,
  end,
  count,
  pageNumber,
  searchParams,
  pathName,
}: {
  totalPages: number;
  nextPage: number;
  prevPage: number;
  start: number;
  end: number;
  count: number;
  pageNumber: number;
  searchParams: Record<string, any>;
  pathName: string;
}) => (
  <div className="flex w-full flex-wrap items-center justify-between gap-2">
    <div className="w-fit animate-fade-right text-muted-foreground">
      Showing {count < start + 1 ? count : start + 1} -{" "}
      {end + 1 < count ? end + 1 : count} results of {count}
    </div>
    <PageSizeInput searchParams={searchParams} />
    <Pagination className="animate-fade-left">
      <PaginationContent className="flex flex-wrap">
        <PaginationItem>
          <PaginationFirst
            href={
              pathName +
              createQueryParamsString(searchParams, {
                pageNumber: 1,
              })
            }
            label={false}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious
            href={
              pathName +
              createQueryParamsString(searchParams, {
                pageNumber: prevPage,
              })
            }
          />
        </PaginationItem>
        <PaginationItem>
          <PageSelector
            pathName={pathName}
            searchParams={searchParams}
            pageNumber={pageNumber}
            totalPages={totalPages}
          />
        </PaginationItem>
        <PaginationItem className="pl-2">of {totalPages} pages</PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={
              pathName +
              createQueryParamsString(searchParams, {
                pageNumber: nextPage,
              })
            }
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLast
            href={
              pathName +
              createQueryParamsString(searchParams, {
                pageNumber: totalPages,
              })
            }
            label={false}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
);
