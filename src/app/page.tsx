import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Network,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
            </div>

            <span className="text-lg">
              Vote<span className="text-primary">Shield</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </a>

            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Detection
            </a>

            <a
              href="#why"
              className="transition-colors hover:text-foreground"
            >
              Why graphs
            </a>
          </nav>

          <Button size="sm">
            <Link href="/dashboard">
              Open dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 size-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -right-40 top-40 size-[350px] rounded-full bg-red-500/10 blur-[100px]" />
          <div className="absolute -left-40 top-72 size-[350px] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          {/* Copy */}
          <div className="max-w-2xl">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            >
              <Activity className="size-3.5 text-primary" />
              Graph-powered election integrity
            </Badge>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Detect suspicious voting activity{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                through relationships.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              VoteShield connects voters, voter cards, voting attempts,
              polling units and devices to identify patterns that may
              indicate unauthorized card usage.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
             
                size="lg"
                className="h-12 gap-2 px-7 text-sm font-semibold shadow-lg"
              >
                <Link href="/dashboard">
                  Explore dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button
            
                size="lg"
                variant="outline"
                className="h-12 px-7"
              >
                <Link href="/alerts">
                  View alerts
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-red-500" />
                Duplicate card detection
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-blue-500" />
                Device relationships
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Graph investigation
              </span>
            </div>
          </div>

          {/* Graph visualization */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative aspect-square">
              {/* Connections */}
              <div className="absolute left-[28%] top-[27%] h-px w-[44%] rotate-[25deg] bg-primary/30" />
              <div className="absolute left-[25%] top-[48%] h-px w-[52%] rotate-[-12deg] bg-primary/30" />
              <div className="absolute left-[48%] top-[30%] h-[42%] w-px rotate-[20deg] bg-primary/30" />
              <div className="absolute left-[31%] top-[55%] h-px w-[40%] rotate-[35deg] bg-primary/30" />

              {/* Center */}
              <div className="absolute left-1/2 top-1/2 z-20 flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary/30 bg-background shadow-2xl shadow-primary/10">
                <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="size-9 text-primary" />
                </div>
              </div>

              {/* Voter */}
              <div className="absolute left-[10%] top-[18%] flex size-20 items-center justify-center rounded-2xl border bg-card shadow-xl">
                <Search className="size-7 text-primary" />
              </div>

              {/* Card */}
              <div className="absolute right-[8%] top-[20%] flex size-20 items-center justify-center rounded-2xl border bg-card shadow-xl">
                <ShieldCheck className="size-7 text-indigo-500" />
              </div>

              {/* Device */}
              <div className="absolute bottom-[17%] left-[12%] flex size-20 items-center justify-center rounded-2xl border bg-card shadow-xl">
                <Network className="size-7 text-emerald-500" />
              </div>

              {/* Alert */}
              <div className="absolute bottom-[15%] right-[10%] flex size-20 items-center justify-center rounded-2xl border bg-card shadow-xl">
                <ShieldAlert className="size-7 text-red-500" />
              </div>

              <div className="absolute left-0 top-[40%] rounded-full border bg-background/90 px-3 py-1.5 text-[11px] font-semibold shadow-lg backdrop-blur">
                Voter
              </div>

              <div className="absolute right-0 top-[43%] rounded-full border bg-background/90 px-3 py-1.5 text-[11px] font-semibold shadow-lg backdrop-blur">
                Voter Card
              </div>

              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 rounded-full border bg-background/90 px-3 py-1.5 text-[11px] font-semibold shadow-lg backdrop-blur">
                Voting Attempt
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why graph */}
      <section
        id="why"
        className="border-y bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">
              Why VoteShield?
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Suspicious activity is about connections.
            </h2>

            <p className="mt-4 text-muted-foreground">
              A graph lets investigators follow relationships between
              voters, cards, devices, polling units and voting attempts
              instead of searching disconnected records.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}