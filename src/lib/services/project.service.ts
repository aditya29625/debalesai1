import { connectDB } from "../db";
import { Project, ProjectMember, ProductInstance, type IProject } from "../models";

export async function getProjectsForUser(userId: string) {
  await connectDB();
  const memberships = await ProjectMember.find({ userId }).lean();
  const projectIds = memberships.map((m) => m.projectId);
  const projects = await Project.find({ _id: { $in: projectIds } }).lean();

  return projects.map((p: IProject) => {
    const membership = memberships.find(
      (m) => m.projectId.toString() === p._id.toString()
    );
    return {
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      role: membership?.role || "member",
    };
  });
}

export async function getProjectBySlug(slug: string) {
  await connectDB();
  const project = await Project.findOne({ slug }).lean<IProject>();
  if (!project) return null;
  return {
    _id: project._id.toString(),
    name: project.name,
    slug: project.slug,
    description: project.description,
  };
}

export async function getProductInstance(projectSlug: string) {
  await connectDB();
  const project = await Project.findOne({ slug: projectSlug }).lean<IProject>();
  if (!project) return null;

  const instance = await ProductInstance.findOne({ projectId: project._id }).lean();
  if (!instance) return null;

  return {
    _id: instance._id.toString(),
    projectId: instance.projectId.toString(),
    productType: instance.productType,
    nameSpace: instance.nameSpace,
    displayName: instance.displayName,
    integrations: instance.integrations,
  };
}

export async function toggleIntegration(
  projectSlug: string,
  integrationName: string,
  enabled: boolean
) {
  await connectDB();
  const project = await Project.findOne({ slug: projectSlug }).lean<IProject>();
  if (!project) throw new Error("Project not found");

  const instance = await ProductInstance.findOne({ projectId: project._id });
  if (!instance) throw new Error("Product instance not found");

  const integration = instance.integrations.find((i: { name: string; enabled: boolean; type: string }) => i.name === integrationName);
  if (!integration) throw new Error("Integration not found");

  integration.enabled = enabled;
  await instance.save();

  return instance.integrations;
}
