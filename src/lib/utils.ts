import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToAscii(inputString: string) {
  const asciiString = removeNonAscii(inputString);
  return asciiString;
}

function removeNonAscii(str: string) {
  return str.replace(/[^\x00-\x7F]/g, "");
}
