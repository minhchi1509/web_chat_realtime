'use client';

import { useSession } from 'next-auth/react';

const useSessionUser = () => {
  const { data: session } = useSession();
  if (!session) {
    throw new Error('Session is not found');
  }
  return session.user.mainProfile;
};

export default useSessionUser;
