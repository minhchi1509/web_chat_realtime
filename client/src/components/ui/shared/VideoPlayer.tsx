'use client';

import Artplayer from 'artplayer';
import { FC, useEffect, useRef } from 'react';

interface IPlayerProps {
  option: Omit<Artplayer['option'], 'container'>;
  className?: string;
}

const VideoPlayer: FC<IPlayerProps> = ({ option, className }) => {
  const artRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const art = new Artplayer({
      ...option,
      container: artRef.current as HTMLDivElement
    });

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [option]);

  return <div ref={artRef} className={className}></div>;
};

export default VideoPlayer;
