"use client";

import { useProjects } from "@/hooks/use-projects";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProjectsPage() {
  const router = useRouter();
  const { data: meData, isLoading: authLoading } = useCurrentUser();
  const { data: projects, isLoading } = useProjects();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!authLoading && !meData?.user) {
      router.push("/");
    }
  }, [authLoading, meData, router]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 50%), var(--color-surface-950)",
      }}
    >
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(148, 163, 184, 0.08)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-semibold text-lg glow-text">Debales AI</span>
        </div>
        <div className="flex items-center gap-4">
          {meData?.user && (
            <span className="text-sm text-surface-400">
              Logged in as <span className="text-surface-200 font-medium">{meData.user.name}</span>
            </span>
          )}
          <button onClick={handleLogout} className="btn-ghost text-sm">
            Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
          <p className="text-surface-400">Select a project to open the AI assistant workspace</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-surface-300 text-lg mb-2">No projects found</p>
            <p className="text-surface-500 text-sm">
              Run the seed script to create demo projects
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project, i) => (
              <button
                key={project._id}
                onClick={() => router.push(`/projects/${project.slug}`)}
                className="glass-card glass-card-hover p-6 text-left animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
                data-testid={`project-card-${project.slug}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: `linear-gradient(135deg, ${i % 2 === 0 ? "#6366f1, #8b5cf6" : "#f59e0b, #ef4444"})`,
                    }}
                  >
                    {i % 2 === 0 ? "🤖" : "📊"}
                  </div>
                  <span className={`badge ${project.role === "admin" ? "badge-admin" : "badge-member"}`}>
                    {project.role}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-surface-100 mb-1">{project.name}</h3>
                <p className="text-sm text-surface-400 mb-4 line-clamp-2">{project.description || "No description"}</p>
                <div className="flex items-center text-xs text-surface-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-success mr-2" />
                  Active
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
