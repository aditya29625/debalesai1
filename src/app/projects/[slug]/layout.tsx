"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useConversations, useCreateConversation } from "@/hooks/use-conversations";
import { useProductInstance } from "@/hooks/use-projects";
import { useEffect, useState } from "react";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = params.slug as string;

  const { data: meData, isLoading: authLoading } = useCurrentUser();
  const { data: conversations, isLoading: convsLoading } = useConversations(slug);
  const { data: productInstance } = useProductInstance(slug);
  const createConversation = useCreateConversation(slug);
  const logoutMutation = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !meData?.user) {
      router.push("/");
    }
  }, [authLoading, meData, router]);

  const handleNewChat = async () => {
    const conv = await createConversation.mutateAsync(undefined);
    router.push(`/projects/${slug}/chat/${conv._id}`);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/");
  };

  const isAdminPage = pathname.includes("/admin");
  const activeConvId = pathname.match(/\/chat\/(.+)/)?.[1];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-1"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`sidebar flex flex-col transition-all duration-300 ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}`}
        data-testid="chat-sidebar"
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(148, 163, 184, 0.08)" }}>
          <button onClick={() => router.push("/projects")} className="btn-ghost p-2 rounded-lg" title="Back to projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-surface-100 truncate">
              {productInstance?.displayName || "AI Assistant"}
            </p>
            <p className="text-xs text-surface-500 truncate">{slug}</p>
          </div>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            disabled={createConversation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            data-testid="new-chat-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {convsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-surface-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => router.push(`/projects/${slug}/chat/${conv._id}`)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 truncate"
                  style={{
                    background: activeConvId === conv._id ? "rgba(99, 102, 241, 0.15)" : "transparent",
                    color: activeConvId === conv._id ? "#a5b4fc" : "var(--color-surface-400)",
                    borderLeft: activeConvId === conv._id ? "2px solid #6366f1" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (activeConvId !== conv._id) {
                      e.currentTarget.style.background = "rgba(148, 163, 184, 0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeConvId !== conv._id) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                  data-testid={`conversation-${conv._id}`}
                >
                  {conv.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer — Nav Links */}
        <div className="p-3 space-y-1 border-t" style={{ borderColor: "rgba(148, 163, 184, 0.08)" }}>
          <button
            onClick={() => router.push(`/projects/${slug}`)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !isAdminPage && !activeConvId ? "text-primary-300 bg-primary-500/10" : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50"
            }`}
          >
            💬 Chat Home
          </button>
          <button
            onClick={() => router.push(`/projects/${slug}/admin`)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              isAdminPage ? "text-primary-300 bg-primary-500/10" : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50"
            }`}
            data-testid="admin-dashboard-link"
          >
            ⚙️ Admin Dashboard
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2 px-3 py-2 mt-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {meData?.user?.name?.charAt(0) || "?"}
            </div>
            <span className="text-xs text-surface-400 flex-1 truncate">{meData?.user?.name}</span>
            <button onClick={handleLogout} className="text-surface-500 hover:text-surface-300 transition-colors" title="Sign Out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3 z-10 p-1.5 rounded-lg bg-surface-800/80 hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-all"
        style={{ left: sidebarOpen ? "282px" : "8px" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sidebarOpen ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
        </svg>
      </button>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden" data-testid="main-content">
        {children}
      </main>
    </div>
  );
}
