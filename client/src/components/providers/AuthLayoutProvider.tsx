'use client';
import { usePathname } from 'next/navigation';
import { createContext, PropsWithChildren, useState } from 'react';

import ContentLayout from 'src/components/ui/layouts/content/ContentLayout';
import HeaderLayout from 'src/components/ui/layouts/header/HeaderLayout';
import Sidebar from 'src/components/ui/layouts/sidebar/Sidebar';
import {
  EXCLUDE_FOOTER_PATHS,
  EXCLUDE_HEADER_PATHS,
  EXCLUDE_SIDEBAR_PATHS
} from 'src/constants/variables';
import { cn, isRouteMatch } from 'src/utils/common.util';

interface IAuthLayoutContext {
  openSidebar: boolean;
  toggleSidebar: () => void;
  isDisplaySidebar: boolean;
  isDisplayFooter: boolean;
  isDisplayHeader: boolean;
}

export const AuthLayoutContext = createContext<IAuthLayoutContext | null>(null);

const AuthLayoutProvider = ({ children }: PropsWithChildren) => {
  const [openSidebar, setOpenSidebar] = useState(true);
  const pathName = usePathname();

  const toggleSidebar = () => {
    setOpenSidebar(!openSidebar);
  };

  const isDisplaySidebar = !isRouteMatch(pathName, EXCLUDE_SIDEBAR_PATHS);
  const isDisplayFooter = !isRouteMatch(pathName, EXCLUDE_FOOTER_PATHS);
  const isDisplayHeader = !isRouteMatch(pathName, EXCLUDE_HEADER_PATHS);

  return (
    <AuthLayoutContext.Provider
      value={{
        openSidebar,
        toggleSidebar,
        isDisplayHeader,
        isDisplayFooter,
        isDisplaySidebar
      }}
    >
      {isDisplaySidebar && <Sidebar />}
      <div
        className={
          isDisplaySidebar
            ? cn(
                !openSidebar ? 'lg:ml-[90px]' : 'lg:ml-72',
                'transition-[margin-left] ease-in-out duration-300'
              )
            : ''
        }
      >
        {isDisplayHeader && <HeaderLayout />}
        <ContentLayout>{children}</ContentLayout>
        {/* {isDisplayFooter && <FooterLayout />} */}
      </div>
    </AuthLayoutContext.Provider>
  );
};

export default AuthLayoutProvider;
