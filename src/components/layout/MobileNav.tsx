'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Brain, Bot, Network, Menu } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Knowledge', href: '/knowledge', icon: Brain },
    { label: 'Ask AI', href: '/assistant', icon: Bot, highlight: true },
    { label: 'Graph', href: '/graph', icon: Network },
    { label: 'More', href: '/exit-mode', icon: Menu },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-vault-surface/90 backdrop-blur-md border-t border-vault-border z-40 flex items-center justify-around px-2 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-medium transition-colors ${
              isActive
                ? tab.highlight
                  ? 'text-indigo-400'
                  : 'text-vault-text'
                : 'text-vault-dim hover:text-vault-muted'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? (tab.highlight ? 'text-indigo-400' : 'text-vault-text') : 'text-vault-dim'}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
