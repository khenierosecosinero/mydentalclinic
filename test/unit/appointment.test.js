function createAppointment(data) {
  if (!data.name) {
    return { error: "Name required" };
  }
  return { status: "Pending" };
}

test("create appointment success", () => {
  const result = createAppointment({ name: "John" });
  expect(result.status).toBe("Pending");
});

test("create appointment fail", () => {
  const result = createAppointment({});
  expect(result.error).toBe("Name required");
});