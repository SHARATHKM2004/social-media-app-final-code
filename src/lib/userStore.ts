import { promises as fs } from "fs";
import path from "path";

export type User = {
  username: string;
  email: string;
  password: string; // learning only
  createdAt: string;

  pronoun?: string;
  bio?: string;
  avatarDataUrl?: string; // base64 data url (jpg)
};

const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]") as User[];
  } catch {
    return [];
  }
}

export async function writeUsers(users: User[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByUsername(username: string) {
  const users = await readUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export async function findUserByEmail(email: string) {
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function addUser(newUser: User) {
  const users = await readUsers();
  users.push(newUser);
  await writeUsers(users);
}

export async function updateUser(username: string, patch: Partial<User>) {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...patch };
  await writeUsers(users);
  return users[idx];
}

export async function deleteUser(username: string) {
  const users = await readUsers();
  const filtered = users.filter((u) => u.username.toLowerCase() !== username.toLowerCase());
  await writeUsers(filtered);
  return true;
}