import { LucideIcon } from 'lucide-react';

export type TSubmenu = {
  href: string;
  label: string;
  active: boolean;
};

export type TMenu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon | React.FC;
  submenus: TSubmenu[];
};

export type TGroupMenu = {
  groupLabel: string;
  menus: TMenu[];
};
