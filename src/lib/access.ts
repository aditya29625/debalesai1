/**
 * Access layer — pure authorization rules.
 * No DB calls; receives pre-fetched data and returns boolean decisions.
 */

import { Role } from "./models";

/** Can this user access the given project? */
export function canAccessProject(memberRole: Role | null): boolean {
  return memberRole !== null;
}

/** Can this user access the admin dashboard for a project? */
export function canAccessAdminDashboard(memberRole: Role | null): boolean {
  return memberRole === "admin";
}

/** Can this user manage integrations? */
export function canManageIntegrations(memberRole: Role | null): boolean {
  return memberRole === "admin";
}

/** Can this user create conversations? */
export function canCreateConversation(memberRole: Role | null): boolean {
  return memberRole !== null;
}

/** Can this user send messages in a conversation they own or belong to? */
export function canSendMessage(
  memberRole: Role | null,
  conversationOwnerId: string,
  currentUserId: string
): boolean {
  if (memberRole === null) return false;
  if (memberRole === "admin") return true;
  return conversationOwnerId === currentUserId;
}
