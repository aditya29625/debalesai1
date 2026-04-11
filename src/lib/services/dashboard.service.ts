import { connectDB } from "../db";
import { DashboardConfig, Project, type IDashboardConfig, type IProject } from "../models";

export async function getDashboardConfig(projectSlug: string) {
  await connectDB();
  const project = await Project.findOne({ slug: projectSlug }).lean<IProject>();
  if (!project) return null;

  const config = await DashboardConfig.findOne({ projectId: project._id }).lean<IDashboardConfig>();
  if (!config) return null;

  return {
    _id: config._id.toString(),
    projectId: config.projectId.toString(),
    pageTitle: config.pageTitle,
    sections: config.sections,
    updatedAt: config.updatedAt,
  };
}

export async function updateDashboardConfig(
  projectSlug: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: { pageTitle?: string; sections?: any[] }
) {
  await connectDB();
  const project = await Project.findOne({ slug: projectSlug }).lean<IProject>();
  if (!project) throw new Error("Project not found");

  const config = await DashboardConfig.findOneAndUpdate(
    { projectId: project._id },
    { $set: update },
    { new: true }
  ).lean<IDashboardConfig>();

  if (!config) throw new Error("Dashboard config not found");

  return {
    _id: config._id.toString(),
    projectId: config.projectId.toString(),
    pageTitle: config.pageTitle,
    sections: config.sections,
    updatedAt: config.updatedAt,
  };
}
