"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  namedValidationMessages,
  validationMessages,
} from "../auth/signup/constants";

const EmailSchema = z.string().email();

export async function logout() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function login(formData: FormData) {
  const supabase = createServerClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log(error);
    redirect("/auth/login?error=true");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = createServerClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const { email, password } = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  let messageArr = [];
  const emailParsed = EmailSchema.safeParse(email);
  if (emailParsed.error) {
    messageArr.push("Invalid email");
  }
  if (password.length < 8) {
    messageArr.push("Password must be 8 characters or more");
  }

  let hasUpper = false;
  let hasSymbol = false;
  const letters = [];
  const numbers = [];
  password.split("").forEach((char) => {
    const num = Number(char);
    if (!Number.isNaN(num)) {
      numbers.push(num);
      return;
    }
    if (/\W/.test(char)) {
      hasSymbol = true;
      return;
    }
    if (char === char.toUpperCase()) {
      hasUpper = true;
    }
    letters.push(char);
  });

  if (numbers.length < 1) {
    messageArr.push(namedValidationMessages.ONE_NUMBER);
  }
  if (letters.length < 1) {
    messageArr.push(namedValidationMessages.ONE_LETTER);
  }
  if (!hasUpper) {
    messageArr.push(namedValidationMessages.ONE_UPPER);
  }
  if (!hasSymbol) {
    messageArr.push(namedValidationMessages.ONE_SYMBOL);
  }
  const message =
    messageArr.length === 0 ? null : encodeURIComponent(messageArr.join(";"));

  if (message) {
    redirect("/auth/signup" + "?messages=" + message);
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect("/auth/signup" + "?error=true");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
