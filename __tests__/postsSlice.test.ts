import reducer from "@/store/postsSlice";

test("postsSlice: returns initial state", () => {
  const state = reducer(undefined, { type: "@@INIT" } as any);
  expect(state).toBeDefined();
});

test("postsSlice: unknown action does not crash", () => {
  const initial = reducer(undefined, { type: "@@INIT" } as any);
  const next = reducer(initial, { type: "UNKNOWN_ACTION" } as any);
  expect(next).toEqual(initial);
});