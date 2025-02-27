'use client';
import { useRouter } from 'next-nprogress-bar';

import useSessionUser from 'src/hooks/useSessionUser';
import { useSocketStore } from 'src/hooks/zustand/useSocketStore';

const HomePage = () => {
  const user = useSessionUser();
  const chatSocket = useSocketStore().getSocket('/chat');
  const { push } = useRouter();

  const handleGetSession = async () => {
    console.log(user);
  };

  return (
    <>
      <button
        onClick={() => {
          push('/message');
        }}
      >
        Go to message page
      </button>

      <button onClick={handleGetSession}>Get session</button>

      <p>{user.fullName}</p>
      {/* <PdfViewer path="/operating_system.pdf" /> */}
    </>
  );
};

export default HomePage;
