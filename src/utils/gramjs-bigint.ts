import { randomBytes } from "crypto";
import bigInt, { type BigInteger } from "big-integer";

/** Convert native bigint or number to BigInteger for GramJS TL long fields */
export function toLong(value: bigint | number): BigInteger {
  return bigInt(String(value));
}

/** Generate cryptographically random BigInteger for randomId / poll ID fields */
export function randomLong(): BigInteger {
  return toLong(randomBytes(8).readBigUInt64BE());
}
