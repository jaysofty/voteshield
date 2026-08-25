"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Search,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
    {
    label: "Voter cards",
    href: "/voters",
    icon: CreditCard,
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: ShieldAlert,
  },
  {
    label: "Investigate",
    href: "/investigate",
    icon: Search,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:flex">
      <div className="flex h-full w-full flex-col">
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
            </div>

            <span className="font-semibold tracking-tight">
              Vote<span className="text-primary">Shield</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Monitoring
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* System status */}
        <div className="border-t p-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>

              <span className="text-xs font-medium">
                System operational
              </span>
            </div>

            <p className="mt-1 text-[11px] text-muted-foreground">
              CognoDB connected
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}