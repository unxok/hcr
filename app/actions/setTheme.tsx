"use server";

import { cookies } from "next/headers";

// const themeCookieName = "hcr-theme";

export const setTheme = async (theme: "system" | "light" | "dark") => {
  cookies().set("hcr-theme", theme);
};
export const getTheme = async () => {
  const { value } = cookies().get("hcr-theme") ?? {};
  if (!value) return "system";
  if (["system", "light", "dark"].includes(value)) return value;
  return "system";
};
