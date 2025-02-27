import ModeToggle from 'src/components/ui/layouts/header/ModeToggle';
import UserHeader from 'src/components/ui/layouts/header/UserHeader';
import SheetMenu from 'src/components/ui/layouts/sidebar/SheetMenu';

const HeaderLayout = () => {
  return (
    <header className="sticky top-0 z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 flex h-14 items-center sm:mx-8">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ModeToggle />
          <UserHeader />
        </div>
      </div>
    </header>
  );
};

export default HeaderLayout;
