"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; live?: boolean };

export default function NavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <ul>
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className={`${path === i.href || path.startsWith(i.href + "/") ? "on" : ""} ${i.live ? "live" : ""}`}>
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
