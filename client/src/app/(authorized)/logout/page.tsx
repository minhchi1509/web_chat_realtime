'use client';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

const LogoutPage = () => {
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return <div></div>;
};

export default LogoutPage;
