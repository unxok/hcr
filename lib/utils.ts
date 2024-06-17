import { type ClassValue, clsx } from "clsx";
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
	considerInvalid?: number
) => {
	const num = Number(val);
	const isInvalid = val === considerInvalid || num === considerInvalid;
	const considerInvalidIsValid =
		considerInvalid !== undefined && considerInvalid !== null;
	if (isInvalid && considerInvalidIsValid) {
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
	wordDelimeter?: string
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
