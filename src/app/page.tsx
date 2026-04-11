"use client";

import { useUsers, useLogin, useCurrentUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { data: meData } = useCurrentUser();
  const { data: users, isLoading } = useUsers();
  const loginMutation = useLogin();

  useEffect(() => {
    if (meData?.user) {
      router.push("/projects");
    }
  }, [meData, router]);

  const handleLogin = async (userId: string) => {
    await loginMutation.mutateAsync(userId);
    router.push("/projects");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 50%), var(--color-surface-950)",
      }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="glow-text">Debales AI</span>
          </h1>
          <p className="text-surface-400 text-sm">
            Multi-tenant AI Sales Assistant Platform
          </p>
        </div>

        {/* User Select Card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-1 text-surface-100">
            Sign in as
          </h2>
          <p className="text-sm text-surface-400 mb-5">
            Select a demo user to continue
          </p>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 w-full" />
              ))}
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-surface-400 mb-2">No users found</p>
              <p className="text-surface-500 text-sm">
                Run the seed script first: <code className="px-2 py-1 rounded bg-surface-800 text-primary-300 text-xs">npm run seed</code>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleLogin(user._id)}
                  disabled={loginMutation.isPending}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left group"
                  style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(148, 163, 184, 0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(30, 41, 59, 0.4)";
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.08)";
                  }}
                  data-testid={`login-user-${user._id}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-100 group-hover:text-white transition-colors">
                      {user.name}
                    </p>
                    <p className="text-sm text-surface-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-surface-500 group-hover:text-primary-400 transition-all group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-surface-600 mt-6">
          Demo authentication — no password required
        </p>
      </div>
    </div>
  );
}
