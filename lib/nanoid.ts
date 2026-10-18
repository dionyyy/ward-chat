import { randomBytes } from "crypto";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * Generate a random ID string of the given length.
 * Uses crypto.randomBytes for secure randomness.
 */
export function nanoid(length = 21): string {
  const bytes = randomBytes(length);
  let id = "";
  for (let i = 0; i < length; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return id;
}
