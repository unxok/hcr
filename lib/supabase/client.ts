import { createBrowserClient as sbCreateBrowserClient } from "@supabase/ssr";
import { Database } from "../supabase.types";

export const createBrowserClient = () =>
  sbCreateBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
