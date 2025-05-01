import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Validates a Nigerian phone number
 * @param number Phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export function validatePhoneNumber(number: string): boolean {
  // Nigerian phone numbers typically start with 070, 080, 081, 090, 091
  // and are 11 digits long
  const regex = /^(070|080|081|090|091|071|090)\d{8}$/
  return regex.test(number)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
