"use client";

import { useParams } from "next/navigation";
import { useDashboardConfig } from "@/hooks/use-dashboard";

/* ─── Widget Renderers ─── */

function StatCardWidget({ title, config }: { title: string; config: Record<string, unknown> }) {
  const value = (config.value as string) || "—";
  const change = config.change as string | undefined;
  const changeType = config.changeType as "positive" | "negative" | "neutral" | undefined;
  const icon = (config.icon as string) || "📊";

  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-surface-400 font-medium">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-surface-50">{value}</div>
      {change && (
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background:
                changeType === "positive" ? "rgba(16,185,129,0.15)" :
                changeType === "negative" ? "rgba(239,68,68,0.15)" :
                "rgba(148,163,184,0.1)",
              color:
                changeType === "positive" ? "#34d399" :
                changeType === "negative" ? "#f87171" :
                "#94a3b8",
            }}
          >
            {change}
          </span>
          <span className="text-xs text-surface-500">vs last period</span>
        </div>
      )}
    </div>
  );
}

function ChartWidget({ title, config }: { title: string; config: Record<string, unknown> }) {
  const chartData = (config.data as number[]) || [40, 65, 45, 80, 55, 90, 70];
  const labels = (config.labels as string[]) || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const color = (config.color as string) || "#6366f1";
  const maxVal = Math.max(...chartData, 1);

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-surface-400 mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-32">
        {chartData.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${(val / maxVal) * 100}%`,
                minHeight: "4px",
                background: `linear-gradient(180deg, ${color}, ${color}88)`,
                animationDelay: `${i * 100}ms`,
              }}
            />
            <span className="text-xs text-surface-500">{labels[i] || ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableWidget({ title, config }: { title: string; config: Record<string, unknown> }) {
  const headers = (config.headers as string[]) || [];
  const rows = (config.rows as string[][]) || [];

  return (
    <div className="glass-card p-5 overflow-hidden">
      <h3 className="text-sm font-medium text-surface-400 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="text-left text-xs text-surface-500 font-medium pb-3 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "rgba(148,163,184,0.06)" }}>
                {row.map((cell, j) => (
                  <td key={j} className="py-2.5 pr-4 text-surface-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TextBlockWidget({ title, config }: { title: string; config: Record<string, unknown> }) {
  const content = (config.content as string) || "";
  const variant = (config.variant as string) || "info";

  return (
    <div
      className="glass-card p-5"
      style={{
        borderLeft:
          variant === "warning" ? "3px solid #f59e0b" :
          variant === "success" ? "3px solid #10b981" :
          variant === "danger" ? "3px solid #ef4444" :
          "3px solid #6366f1",
      }}
    >
      <h3 className="text-sm font-medium text-surface-300 mb-2">{title}</h3>
      <p className="text-sm text-surface-400 leading-relaxed">{content}</p>
    </div>
  );
}

function ListWidget({ title, config }: { title: string; config: Record<string, unknown> }) {
  const items = (config.items as { label: string; value: string; icon?: string }[]) || [];

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-surface-400 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span className="text-sm text-surface-300">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-surface-100">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressWidget({ title, config }: { title: string; config: Record<string, unknown> }) {
  const items = (config.items as { label: string; value: number; max: number; color?: string }[]) || [];

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-surface-400 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-surface-300">{item.label}</span>
              <span className="text-xs text-surface-500">
                {item.value}/{item.max}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(30,41,59,0.8)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                  background: `linear-gradient(90deg, ${item.color || "#6366f1"}, ${item.color || "#8b5cf6"})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Widget Factory ─── */
function renderWidget(widget: { id: string; type: string; title: string; span?: number; config: Record<string, unknown> }) {
  const spanClass =
    widget.span === 2
      ? "col-span-2"
      : widget.span === 3
      ? "col-span-3"
      : widget.span === 4
      ? "col-span-4"
      : "col-span-1";

  const Component = (() => {
    switch (widget.type) {
      case "stat-card": return StatCardWidget;
      case "chart": return ChartWidget;
      case "table": return TableWidget;
      case "text-block": return TextBlockWidget;
      case "list": return ListWidget;
      case "progress": return ProgressWidget;
      default: return null;
    }
  })();

  if (!Component) {
    return (
      <div key={widget.id} className={`glass-card p-5 ${spanClass}`}>
        <p className="text-surface-500 text-sm">Unknown widget: {widget.type}</p>
      </div>
    );
  }

  return (
    <div key={widget.id} className={spanClass}>
      <Component title={widget.title} config={widget.config} />
    </div>
  );
}

/* ─── Admin Dashboard Page ─── */
export default function AdminDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: dashConfig, isLoading, error } = useDashboardConfig(slug);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-8 w-64 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-surface-100 mb-2">Access Denied</h2>
          <p className="text-surface-400 text-sm">
            {error.message === "Admin access required"
              ? "You need admin privileges to view this dashboard."
              : "Failed to load dashboard configuration."}
          </p>
        </div>
      </div>
    );
  }

  if (!dashConfig) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <p className="text-surface-400">No dashboard configuration found</p>
        </div>
      </div>
    );
  }

  // Sort sections by order
  const sections = [...dashConfig.sections].sort((a, b) => a.order - b.order);

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        background:
          "radial-gradient(ellipse at 70% 10%, rgba(99, 102, 241, 0.04) 0%, transparent 50%), var(--color-surface-950)",
      }}
      data-testid="admin-dashboard"
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              ⚙️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-50">{dashConfig.pageTitle}</h1>
              <p className="text-xs text-surface-500">
                Config-driven • Last updated {new Date(dashConfig.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, sIdx) => (
          <div
            key={section.id}
            className="mb-8 animate-fade-in"
            style={{ animationDelay: `${sIdx * 100}ms` }}
            data-testid={`dashboard-section-${section.id}`}
          >
            <h2 className="text-lg font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <span
                className="w-1 h-5 rounded-full"
                style={{ background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }}
              />
              {section.title}
            </h2>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${section.columns || 3}, minmax(0, 1fr))`,
              }}
            >
              {section.widgets.map((widget) => renderWidget(widget))}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-surface-400">No sections configured for this dashboard</p>
            <p className="text-surface-500 text-sm mt-1">
              Edit the DashboardConfig document in MongoDB to add sections and widgets
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
