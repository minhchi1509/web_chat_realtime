'use client';
import { useRouter } from 'next-nprogress-bar';

const HomePage = () => {
  const { push } = useRouter();

  return (
    <>
      <button
        onClick={() => {
          push('/message');
        }}
      >
        Go to message page
      </button>
    </>
  );
};

export default HomePage;
