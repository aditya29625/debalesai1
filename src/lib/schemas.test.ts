import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, sendMessageSchema, toggleIntegrationSchema } from "./schemas";

test("loginSchema", async (t) => {
  await t.test("valid payload", () => {
    const result = loginSchema.safeParse({ userId: "12345" });
    assert.equal(result.success, true);
  });

  await t.test("invalid payload", () => {
    const result = loginSchema.safeParse({ userId: "" });
    assert.equal(result.success, false);
  });
});

test("sendMessageSchema", async (t) => {
  await t.test("valid payload", () => {
    const result = sendMessageSchema.safeParse({
      content: "Hello world!",
      conversationId: "conv123",
    });
    assert.equal(result.success, true);
  });

  await t.test("invalid missing content", () => {
    const result = sendMessageSchema.safeParse({
      content: "",
      conversationId: "conv123",
    });
    assert.equal(result.success, false);
  });
});

test("toggleIntegrationSchema", async (t) => {
  await t.test("valid boolean", () => {
    const result = toggleIntegrationSchema.safeParse({
      integrationName: "Shopify",
      enabled: true,
    });
    assert.equal(result.success, true);
  });
});
