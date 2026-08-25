"use client";

import Link from "next/link";
import {
  Bell,
  Menu,
  ShieldCheck,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
  },
  {
    label: "Alerts",
    href: "/alerts",
  },
  {
    label: "Investigate",
    href: "/investigate",
  },
];

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Mobile navigation */}
      <div className="flex items-center gap-3">
        <Sheet>
  <SheetTrigger
    render={
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
      />
    }
  >
    <Menu className="size-5" />
    <span className="sr-only">Open menu</span>
  </SheetTrigger>

          <SheetContent
            side="left"
            className="w-64 p-0"
          >
            {/* Mobile brand */}
            <div className="flex h-16 items-center border-b px-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
              >
                <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" />
                </div>

                <span className="font-semibold tracking-tight">
                  Vote<span className="text-primary">
                    Shield
                  </span>
                </span>
              </Link>
            </div>

            {/* Mobile navigation */}
            <nav className="space-y-1 p-4">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Monitoring
              </p>

              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Page context */}
        <div className="hidden sm:block">
          <p className="text-sm font-medium">
            Election Integrity Monitor
          </p>

          <p className="text-xs text-muted-foreground">
            VoteShield
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <Button
      
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Link href="/alerts">
            <Bell className="size-4" />

            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />

            <span className="sr-only">
              View alerts
            </span>
          </Link>
        </Button>

        {/* User */}
        <div className="ml-2 flex items-center gap-3 border-l pl-3">
          <Avatar className="size-8">
            <AvatarFallback>
              AJ
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:block">
            <p className="text-sm font-medium">
              Election Monitor
            </p>

            <p className="text-xs text-muted-foreground">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}