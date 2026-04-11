import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessProject,
  canAccessAdminDashboard,
  canManageIntegrations,
  canCreateConversation,
  canSendMessage,
} from "./access";

test("canAccessProject", async (t) => {
  await t.test("returns true for any role", () => {
    assert.equal(canAccessProject("admin"), true);
    assert.equal(canAccessProject("member"), true);
  });
  
  await t.test("returns false for null role", () => {
    assert.equal(canAccessProject(null), false);
  });
});

test("canAccessAdminDashboard", async (t) => {
  await t.test("returns true only for admin", () => {
    assert.equal(canAccessAdminDashboard("admin"), true);
    assert.equal(canAccessAdminDashboard("member"), false);
    assert.equal(canAccessAdminDashboard(null), false);
  });
});

test("canManageIntegrations", async (t) => {
  await t.test("returns true only for admin", () => {
    assert.equal(canManageIntegrations("admin"), true);
    assert.equal(canManageIntegrations("member"), false);
    assert.equal(canManageIntegrations(null), false);
  });
});

test("canCreateConversation", async (t) => {
  await t.test("returns true for any role", () => {
    assert.equal(canCreateConversation("admin"), true);
    assert.equal(canCreateConversation("member"), true);
  });
  
  await t.test("returns false for null role", () => {
    assert.equal(canCreateConversation(null), false);
  });
});

test("canSendMessage", async (t) => {
  await t.test("admin can send messages regardless of owner", () => {
    assert.equal(canSendMessage("admin", "user1", "user2"), true);
    assert.equal(canSendMessage("admin", "user1", "user1"), true);
  });

  await t.test("member can only send messages if they are the owner", () => {
    assert.equal(canSendMessage("member", "user1", "user1"), true);
    assert.equal(canSendMessage("member", "user1", "user2"), false);
  });

  await t.test("null role cannot send messages", () => {
    assert.equal(canSendMessage(null, "user1", "user1"), false);
  });
});
