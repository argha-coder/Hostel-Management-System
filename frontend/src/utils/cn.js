import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  const result = twMerge(clsx(inputs));
  if (typeof window !== 'undefined') window.cn = cn;
  return result;
}
