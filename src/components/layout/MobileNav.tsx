"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  Bot,
  Network,
  Menu,
  X,
  ChevronRight,
} from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const tabs = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Knowledge", href: "/knowledge", icon: Brain },
    { label: "Ask AI", href: "/assistant", icon: Bot },
    { label: "Graph", href: "/graph", icon: Network },
  ].filter((item) => user?.role !== "NEW_EMPLOYEE" || item.href !== "/graph");
  const links = [
    {
      label: "Capture knowledge",
      href: "/capture",
      roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    },
    { label: "Review queue", href: "/reviews", roles: ["ADMIN", "MANAGER"] },
    {
      label: "Risk & coverage",
      href: "/coverage",
      roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    },
    { label: "Continuity gaps", href: "/gaps", roles: ["ADMIN", "MANAGER"] },
    {
      label: "Employees",
      href: "/employees",
      roles: ["ADMIN", "MANAGER", "NEW_EMPLOYEE"],
    },
    {
      label: "Projects",
      href: "/projects",
      roles: ["ADMIN", "MANAGER", "EMPLOYEE", "NEW_EMPLOYEE"],
    },
    { label: "Sources", href: "/sources", roles: ["ADMIN"] },
    {
      label: "Exit Mode",
      href: "/exit-mode",
      roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    },
    {
      label: "Settings",
      href: "/settings",
      roles: ["ADMIN", "MANAGER", "EMPLOYEE", "NEW_EMPLOYEE"],
    },
  ].filter((item) => item.roles.includes(user?.role || ""));
  return (
    <>
      <nav
        className="vault-mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-vault-border"
        aria-label="Mobile workspace navigation"
      >
        {tabs.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 w-full min-h-12 text-[11px] ${pathname.startsWith(href) ? "text-vault-text" : "text-vault-dim"}`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        ))}
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1 w-full min-h-12 text-[11px] text-vault-dim"
          onClick={() => setOpen(true)}
          aria-label="More workspace navigation"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="Workspace navigation"
        className="kv-mobile-menu"
      >
        <header>
          <h2>Workspace</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </Button>
        </header>
        <nav aria-label="More workspace pages">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
              <ChevronRight size={16} />
            </Link>
          ))}
        </nav>
      </Modal>
    </>
  );
}
