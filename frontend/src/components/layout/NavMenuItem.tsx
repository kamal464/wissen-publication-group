"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavMenuItemProps = {
  label: string;
  href: string;
  variant?: 'cta' | 'outline';
};

export default function NavMenuItem({ label, href, variant }: NavMenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
  const variantClass = variant ? ` header__nav-link--${variant}` : '';

  return (
    <Link
      href={href}
      className={`header__nav-link${isActive ? ' header__nav-link--active' : ''}${variantClass}`}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>{label}</span>
    </Link>
  );
}
