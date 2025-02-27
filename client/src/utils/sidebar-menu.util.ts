import { MessageCircle, ShieldCheck } from 'lucide-react';

import { ProfileIcon } from 'src/assets/icons';
import { TGroupMenu } from 'src/types/sidebar-menu.type';

export const getGroupMenuList = (pathname: string): TGroupMenu[] => {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/messages',
          label: 'Messages',
          active: pathname.includes('/messages'),
          icon: MessageCircle,
          submenus: []
        }
      ]
    },
    {
      groupLabel: 'Settings',
      menus: [
        {
          href: '/setting/profile',
          label: 'Profile',
          active: pathname.includes('/setting/profile'),
          icon: ProfileIcon,
          submenus: []
        },
        {
          href: '/setting/security',
          label: 'Password and authentication',
          active: pathname.includes('/setting/security'),
          icon: ShieldCheck,
          submenus: []
        }
      ]
    }
  ];
};
