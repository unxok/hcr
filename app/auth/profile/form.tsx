"use client";

import { updateProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  HTMLInputTypeAttribute,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { ZodSchema, z } from "zod";

const schema = z.object({
  username: z.string().min(1, { message: "Username cannot be empty" }),
});

const Control = ({
  //   isValid,
  label,
  name,
  //   onChange,
  placeholder,
  schema,
  type,
  value,
}: {
  //   isValid: boolean;
  label: string;
  name: string;
  //   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  schema: ZodSchema;
  type?: HTMLInputTypeAttribute;
  value: any;
}) => {
  //   const ref = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>();
  return (
    <div className="flex w-fit flex-col gap-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        name={name}
        id={name}
        type={type ?? "text"}
        placeholder={placeholder}
        defaultValue={value}
        onChange={(e) => {
          console.log(e.target.value);
          const parsed = schema.safeParse(e.target.value);
          if (parsed.error) {
            const arr = parsed.error.flatten().formErrors;
            return setErrors(arr);
          }
          setErrors(undefined);
        }}
      />
      <ul
        aria-label={`Validation messages for ` + name}
        className="flex flex-col gap-1"
      >
        {errors?.map((e) => (
          <li className="flex items-center gap-2 text-sm">
            <CircleX className="w-5 text-destructive" />
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Form = ({
  defaultValues,
}: {
  defaultValues: Record<string, any>;
}) => {
  const { username } = defaultValues;
  const [state, action] = useFormState(updateProfile, { message: "" });

  return (
    <form action={action} className="border p-5">
      <Control
        label="Username"
        name="username"
        schema={schema.shape["username"]}
        value={username}
        placeholder="enter a username"
        type="text"
      />
      {state.message}
      <div className="flex w-full items-center justify-end gap-2">
        <Button variant={"ghost"}>cancel</Button>
        <Button variant={"secondary"}>update</Button>
      </div>
    </form>
  );
};
