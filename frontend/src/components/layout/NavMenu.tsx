"use client";

import { Menubar } from 'primereact/menubar';
import type { MenuItem } from 'primereact/menuitem';
import NavMenuItem, { NavMenuItemProps } from './NavMenuItem';

type NavMenuProps = {
  items: NavMenuItemProps[];
};

export default function NavMenu({ items }: NavMenuProps) {
  const model: MenuItem[] = items.map((item) => ({
    key: item.href,
    label: item.label,
    template: () => <NavMenuItem {...item} />
  }));

  return (
    <div className="header__nav" aria-label="Primary navigation" suppressHydrationWarning>
      <Menubar model={model} className="header__nav-menubar" />
    </div>
  );
}
