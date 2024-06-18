"use client";

import { getTheme, setTheme } from "@/app/actions/setTheme";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// TODO make consts and types for theme

export const ThemeToggle = () => {
  const [themeState, setThemeState] = useState<"system" | "dark" | "light">();

  const updateTheme = (theme: "system" | "dark" | "light") => {
    setTheme(theme);
    setThemeState(theme);
  };

  useEffect(() => {
    (async () => {
      const theme = await getTheme();
      updateTheme(theme as string as "system" | "dark" | "light");
    })();
  }, []);

  useEffect(() => {
    const root = document.querySelector(":root");
    if (!root) return;
    const systemIsDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isSystem = themeState === "system";
    // const choseSystemDark = isSystem && systemIsDark;
    // const choseSystemLight = isSystem && !systemIsDark;
    if (themeState === "dark" || (isSystem && systemIsDark)) {
      root.classList.add("dark");
      return;
    }
    if (themeState === "light" || (isSystem && !systemIsDark)) {
      root.classList.remove("dark");
      return;
    }
    root.classList.add("dark");
  }, [themeState]);
  return (
    <Select
      onValueChange={(v) =>
        updateTheme(v as string as "system" | "dark" | "light")
      }
    >
      <SelectTrigger className="w-fit">
        {/* Why is this causing the scrollbar to disappear when clicked?? */}
        <SelectValue defaultValue={themeState} placeholder={"theme"}>
          {themeState}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {["system", "dark", "light"].map((t) => (
          <SelectItem key={t} value={t}>
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
