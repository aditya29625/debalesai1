"use client";

import { useParams, useRouter } from "next/navigation";
import { useProductInstance, useIntegrations, useToggleIntegration } from "@/hooks/use-projects";
import { useCreateConversation } from "@/hooks/use-conversations";
import { useCurrentUser } from "@/hooks/use-auth";

export default function ProjectHomePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: meData } = useCurrentUser();
  const { data: productInstance, isLoading: piLoading } = useProductInstance(slug);
  const { data: integrations } = useIntegrations(slug);
  const toggleIntegration = useToggleIntegration(slug);
  const createConversation = useCreateConversation(slug);

  const handleNewChat = async () => {
    const conv = await createConversation.mutateAsync(undefined);
    router.push(`/projects/${slug}/chat/${conv._id}`);
  };

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        background:
          "radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.04) 0%, transparent 60%), var(--color-surface-950)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Welcome */}
        <div className="text-center mb-12 animate-fade-in">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 12px 40px rgba(99, 102, 241, 0.3)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-surface-100">
            {piLoading ? "Loading..." : productInstance?.displayName || "AI Sales Assistant"}
          </h1>
          <p className="text-surface-400 max-w-md mx-auto">
            Your AI-powered sales companion. Ask about products, customers, orders, and get intelligent insights.
          </p>
        </div>

        {/* Quick Start */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleNewChat}
            disabled={createConversation.isPending}
            className="btn-primary text-base px-8 py-3 flex items-center gap-3"
            data-testid="start-chat-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Start a New Conversation
          </button>
        </div>

        {/* Integration Status */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold mb-4 text-surface-100">
            Integrations
          </h2>
          <p className="text-sm text-surface-400 mb-5">
            Active integrations enhance AI responses with real-time data context.
            {meData?.user ? "" : ""}
          </p>

          {integrations && integrations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: "rgba(15, 23, 42, 0.5)",
                    border: `1px solid ${integration.enabled ? "rgba(16, 185, 129, 0.2)" : "rgba(148, 163, 184, 0.08)"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                      style={{
                        background: integration.type === "shopify"
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(59, 130, 246, 0.15)",
                      }}
                    >
                      {integration.type === "shopify" ? "🛍️" : "👥"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-200">{integration.name}</p>
                      <p className="text-xs text-surface-500 capitalize">{integration.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleIntegration.mutate({
                        integrationName: integration.name,
                        enabled: !integration.enabled,
                      })
                    }
                    disabled={toggleIntegration.isPending}
                    className="relative w-11 h-6 rounded-full transition-colors duration-200"
                    style={{
                      background: integration.enabled
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "rgba(71, 85, 105, 0.5)",
                    }}
                    data-testid={`toggle-${integration.name}`}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
                      style={{
                        left: integration.enabled ? "22px" : "2px",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-sm">No integrations configured</p>
          )}
        </div>
      </div>
    </div>
  );
}
