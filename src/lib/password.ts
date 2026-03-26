import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10; // OWASP notes bcrypt work factor >= 10 for legacy bcrypt usage [1](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}