import { timeAgo } from "@/lib/client/time";

test("timeAgo returns a string", () => {
  const now = new Date().toISOString();
  const result = timeAgo(now);
  expect(typeof result).toBe("string");
});