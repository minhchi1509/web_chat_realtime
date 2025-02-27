'use client';
import axios from 'axios';
import React, { FC, useEffect, useState } from 'react';

import VideoPlayer from 'src/components/ui/shared/VideoPlayer';
import { showErrorToast } from 'src/utils/toast.util';

interface IStreamMessageVideoProps {
  mediaId: string;
  className?: string;
}

const StreamMessageVideo: FC<IStreamMessageVideoProps> = ({
  mediaId,
  className
}) => {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v1/file/stream/message/${mediaId}`,
          { responseType: 'blob' }
        );
        const videoBlobUrl = URL.createObjectURL(response.data);
        setVideoUrl(videoBlobUrl);
      } catch (error) {
        showErrorToast('Error when fetching video');
        console.log('Error when fetching video', error);
      }
    };

    fetchVideoUrl();
  }, [mediaId]);
  return (
    <VideoPlayer
      option={{
        url: videoUrl,
        fullscreen: true,
        fullscreenWeb: true
      }}
      className={className}
    />
  );
};

export default StreamMessageVideo;
