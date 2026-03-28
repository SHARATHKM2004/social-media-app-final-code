import clientPromise from "./mongodb";

export type User = {
  username: string;
  email: string;
  password: string;
  createdAt: string;

  pronoun?: string;
  bio?: string;
  avatarDataUrl?: string;
};

const DB_NAME = "socialApp";
const COLLECTION = "users";

// 🔍 Get all users
export async function readUsers(): Promise<User[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const users = await db.collection(COLLECTION).find().toArray();
  return users as unknown as User[];
}

// 🔍 Find by username
export async function findUserByUsername(username: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  return db.collection(COLLECTION).findOne({
    username: { $regex: new RegExp(`^${username}$`, "i") },
  });
}

// 🔍 Find by email
export async function findUserByEmail(email: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  return db.collection(COLLECTION).findOne({
    email: { $regex: new RegExp(`^${email}$`, "i") },
  });
}

// ➕ Add user (REGISTER)
export async function addUser(newUser: User) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  await db.collection(COLLECTION).insertOne(newUser);
}

// ✏️ Update user
export async function updateUser(username: string, patch: Partial<User>) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { username: { $regex: new RegExp(`^${username}$`, "i") } },
    { $set: patch },
    { returnDocument: "after" }
  );

return result?.value || null;
}

// ❌ Delete user
export async function deleteUser(username: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  await db.collection(COLLECTION).deleteOne({
    username: { $regex: new RegExp(`^${username}$`, "i") },
  });

  return true;
}