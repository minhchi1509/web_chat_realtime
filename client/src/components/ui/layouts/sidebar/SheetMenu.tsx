import { MenuIcon, PanelsTopLeft } from 'lucide-react';
import Link from 'next/link';

import Menu from 'src/components/ui/layouts/sidebar/Menu';
import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from 'src/components/ui/shadcn-ui/sheet';

const SheetMenu = () => {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-0 sm:w-72" side="left">
        <SheetHeader>
          <Button
            className="flex items-center justify-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <PanelsTopLeft className="mr-1 size-6" />
              <h1 className="text-lg font-bold">Brand</h1>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isSidebarOpen />
      </SheetContent>
    </Sheet>
  );
};

export default SheetMenu;
