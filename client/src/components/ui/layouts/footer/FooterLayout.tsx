import { AppLogo } from 'src/assets/icons';

const FooterLayout = () => {
  return (
    <footer className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 flex items-center gap-7 py-4 md:mx-8">
        <AppLogo className="size-20" />
        <div>
          <p className="text-left text-xs leading-loose text-muted-foreground md:text-sm">
            Copyright © 2024 Rosette. All Rights Reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            🧑‍💼 Owner: Rose William <br /> 🏫 Address: New York, United States{' '}
            <br /> 📧 Contact Email: minhchicopyright@hotmail.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterLayout;
