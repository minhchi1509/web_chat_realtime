import { useContext } from 'react';

import { AuthLayoutContext } from 'src/components/providers/AuthLayoutProvider';

const useAuthLayout = () => {
  const value = useContext(AuthLayoutContext);
  if (!value) {
    throw new Error('useAuthLayout must be used within a AppLayoutProvider');
  }
  return { ...value };
};

export default useAuthLayout;
