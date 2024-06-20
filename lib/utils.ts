import { type ClassValue, clsx } from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

/**
 * Merges tailwind class strings where subsequent args overwrite classes from prior args
 * @param inputs Tailwind class strings or expressions that may return a Tailwind class string
 * @returns A single Tailwind class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Asserts the passed value as the provided type.
 *
 * Warning: This bypassing actual type checking to assert the type, so always be sure it is of this type before calling `assert()`
 * @param p The value to assert the type for
 * @returns The same value as `p` but with the provided type `T`
 */
export const assert = <T>(p: unknown) => {
  return p as T;
};

/**
 * Converts a value of unknown type to a non-NaN number
 * @param val The value to convert
 * @param defaultNumber What to convert to if `val` can't be converted
 * @param considerInvalid A value to consider to be invalid
 * @returns A number
 * ---
 * ```js
 *
 * toNumber('52') // 52
 * toNumber('hello') // 0
 * toNumber('world', -1) // -1
 * toNumber('24', -1, 24) // -1
 * ```
 */
export const toNumber = (
  val: unknown,
  defaultNumber?: number,
  considerInvalid?: number,
  min?: number,
  max?: number,
) => {
  const num = Number(val);
  const numMin = Number(min);
  const numMax = Number(max);
  const belowMin = numMin > 0 ? num < numMin : false;
  const belowMax = numMax > 0 ? num < numMax : false;
  const considerInvalidIsValid =
    considerInvalid !== undefined && considerInvalid !== null;
  const isInvalid =
    (considerInvalidIsValid && val === considerInvalid) ||
    (considerInvalidIsValid && num === considerInvalid) ||
    belowMin ||
    belowMax;
  if (isInvalid) {
    return defaultNumber ?? 0;
  }
  if (Number.isNaN(num)) {
    return defaultNumber ?? 0;
  }
  return num;
};

/**
 * Takes a string with one or more words and capitalizes the first letter of each word
 * @param str The string to change
 * @param wordDelimeter The delimeter if `str` contains multiple words
 * @returns A string with the first letter of every word capitalized
 * ---
 * ```js
 *
 * toFirstUpperCase('teLePHonE') // 'Telephone'
 * toFirstUpperCase('HElLo wORlD', ' ') // 'Hello World'
 * ```
 */
export const toFirstUpperCase: (
  str: string,
  wordDelimeter?: string,
) => string = (str, wordDelimeter) => {
  const lower = str.toLowerCase();
  if (wordDelimeter !== undefined && wordDelimeter !== null) {
    const words = lower.split(wordDelimeter);
    const resultArr = words.map((w) => toFirstUpperCase(w));
    return resultArr.join(wordDelimeter);
  }
  const chars = lower.split("");
  chars[0] = chars[0].toUpperCase();
  return chars.join("");
};

/**
 * Use to generate a search params string for use in URLs
 * @param searchParams Search Params object from Next
 * @param obj The object with keys and values to set within the new search params string
 * @returns Updated search params parsed to a valid string
 */
export const createQueryParamsString = (
  searchParams: ReadonlyURLSearchParams | Record<string, any>,
  obj: Record<string, any>,
) => {
  const arg =
    searchParams instanceof ReadonlyURLSearchParams
      ? searchParams.toString()
      : searchParams;
  const params = new URLSearchParams(arg);
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null) {
      params.delete(key);
      return;
    }
    params.set(key, obj[key]);
  });
  return params.toString();
};

/**
 * Creates an array of numbers from the provided range.
 * @param start The number to start the array (inclusive)
 * @param stop The number to stop the array at (exclusive)
 * @param step The size of steps to take between iterations
 * @returns An array of numbers
 */
export const createRange = (start: number, stop: number, step?: number) => {
  const a = [start];
  let b = start;
  const s = step ?? 1;
  while (b < stop) {
    a.push((b += s));
  }
  return a;
};

/**
 * Delete keys from an object that have a value present in `badValues`.
 *
 * If `replaceValue` is provided, that will replace the `badValues` keys instead of deleting.
 * @param object The object to modify
 * @param badValues Values where if present, the corresponding key will be deleted
 * @param replaceValue If provided, will replace `badValues` keys instead of letting them be deleted.
 * @returns The modified object with no `badValues` preset for any key
 * ---
 * ```js
 *
 * const obj = {good: 'hello', bad: 'world', foo: null, bar: true};
 * filterObject(obj, 'world', null);
 * // {good: 'hello', bar: true}
 * ```
 */
export const filterObject = (
  object: Record<string, any>,
  badValues: any[],
  replaceValue?: any,
) => {
  const obj = { ...object };
  Object.keys(obj).forEach((k) => {
    badValues.forEach((v) => {
      if (obj[k] === v) {
        if (replaceValue !== undefined) {
          return (obj[k] = replaceValue);
        }
        delete obj[k];
      }
    });
  });
  return obj;
};

export const getDateFromSearchParams = <T>(searchParams: T, key: keyof T) => {
  const val = searchParams[key] ?? "";
  const pre = !val ? null : Array.isArray(val) ? val[0] : val;
  return pre ? new Date(pre).toISOString() : null;
};
