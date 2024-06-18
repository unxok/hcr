import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <span
      className={cn(
        "w-fit animate-pulse rounded-md bg-muted text-transparent [&_*]:!text-transparent [&_*]:!opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
