"use client";

import { toNumber } from "@/lib/utils";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  BarChart,
  LabelList,
  Label,
} from "recharts";

export const BedroomAveragesChart = ({
  data,
}: {
  data:
    | {
        bedrooms: number | string | null;
        avg_market_rent: number | null;
        median_market_rent: number | null;
      }[]
    | null;
}) => {
  if (!data) return;
  const maxAvg = Math.max(...data.map((d) => toNumber(d?.avg_market_rent)));
  const maxMedian = Math.max(
    ...data.map((d) => toNumber(d?.median_market_rent)),
  );
  const className = "border-border";
  const maxRent =
    Math.round((Math.max(maxAvg, maxMedian) + 2000) / 1000) * 1000;
  return (
    <ResponsiveContainer width={"100%"} height={250}>
      <BarChart data={data ?? undefined}>
        {/* <CartesianGrid /> */}
        <XAxis dataKey={"bedrooms"} />
        <YAxis domain={[0, maxRent]}>
          {/* <Label
            value="monthly rent in dollars"
            position={"insideBottomLeft"}
            angle={270}
          /> */}
        </YAxis>
        <Tooltip
          wrapperClassName="md:hidden"
          labelClassName="text-foreground"
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderRadius: "calc(var(--radius) - 2px)",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Legend />
        <Bar dataKey={"median_market_rent"} fill="hsl(var(--primary))">
          <LabelList
            dataKey={"median_market_rent"}
            position={"top"}
            className="hidden md:block"
          />
        </Bar>
        <Bar dataKey={"avg_market_rent"} fill="hsl(var(--muted-foreground))">
          <LabelList
            dataKey={"avg_market_rent"}
            position={"top"}
            className="hidden md:block"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
