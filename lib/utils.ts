import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const assert = <T>(p: unknown) => {
	return p as T;
};

export const toNumber = (
	val: unknown,
	defaultNumber?: number,
	considerInvalid?: number
) => {
	const num = Number(val);
	// if (num === considerInvalid) {
	// 	return defaultNumber ?? 0;
	// }
	if (Number.isNaN(num)) {
		return defaultNumber ?? 0;
	}
	return num;
};
