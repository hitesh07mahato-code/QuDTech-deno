import { Link } from "@tanstack/react-router";
import { Atom, Menu } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/technology", label: "Technology" },
  { to: "/demo", label: "Live demo" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="quantum-gradient flex size-9 items-center justify-center rounded-xl shadow-glow">
            <Atom className="size-5 text-primary-foreground" strokeWidth={2.2} />
          </span>
          <span className="font-display text-[0.95rem] font-semibold tracking-tight">
            QuD<span className="text-primary">Tech</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/demo"
            className="quantum-gradient hidden rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Run a screening
          </Link>
          <button
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border md:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="quantum-gradient flex size-8 items-center justify-center rounded-lg">
                <Atom className="size-4 text-primary-foreground" />
              </span>
              <span className="font-display text-sm font-semibold">QuDTech</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A hybrid quantum machine learning platform for early disease detection. Built for
              Smart India Hackathon 2026 — Problem Statement SIH26139, MedTech / BioTech /
              HealthTech. Research demonstration only — not a medical device.
            </p>
          </div>
          <div className="flex gap-14">
            <div>
              <p className="eyebrow">Platform</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/technology" className="hover:text-foreground">
                    Technology
                  </Link>
                </li>
                <li>
                  <Link to="/demo" className="hover:text-foreground">
                    Live demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow">Cohorts</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Type 2 diabetes</li>
                <li>Cardiovascular</li>
                <li>Breast cancer</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Team QuDTech · Smart India Hackathon 2026 · SIH26139.
          Simulated inference — all outputs are illustrative.
        </p>
      </div>
    </footer>
  );
}
