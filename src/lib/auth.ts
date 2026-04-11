import { cookies } from "next/headers";
import { connectDB } from "./db";
import { User, ProjectMember, type IUser, type Role } from "./models";

const COOKIE_NAME = "debales_user_id";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

export interface ProjectAuth {
  user: AuthUser;
  role: Role;
}

/** Get current user from cookie (server-side) */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE_NAME)?.value;
  if (!userId) return null;

  await connectDB();
  const user = await User.findById(userId).lean<IUser>();
  if (!user) return null;

  return { _id: user._id.toString(), name: user.name, email: user.email };
}

/** Get the user's role in a specific project */
export async function getUserProjectRole(
  userId: string,
  projectSlug: string
): Promise<Role | null> {
  await connectDB();
  const { Project } = await import("./models");
  const project = await Project.findOne({ slug: projectSlug }).lean();
  if (!project) return null;

  const member = await ProjectMember.findOne({
    userId,
    projectId: project._id,
  }).lean();
  if (!member) return null;

  return (member as unknown as { role: Role }).role;
}

/** Combined: get user + their role for a project. Returns null if unauthorized. */
export async function getProjectAuth(projectSlug: string): Promise<ProjectAuth | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const role = await getUserProjectRole(user._id, projectSlug);
  if (!role) return null;

  return { user, role };
}
