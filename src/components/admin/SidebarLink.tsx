'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
}

export default function SidebarLink({ href, label, icon }: SidebarLinkProps) {
  const pathname = usePathname();
  // Dashboard: coincidencia exacta. El resto: coincidencia por prefijo.
  const activo = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        activo
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}
