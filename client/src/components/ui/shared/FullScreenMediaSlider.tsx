import { ChevronLeft, ChevronRight, XIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { A11y, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperCore } from 'swiper/types';

import 'swiper/css';
import { Button } from 'src/components/ui/shadcn-ui/button';
import VideoPlayer from 'src/components/ui/shared/VideoPlayer';
import { cn } from 'src/utils/common.util';

export interface IMediaItem {
  id: string;
  type: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'FILE';
  url: string;
}

interface FullScreenMediaSliderProps {
  onOpenChange: (open: boolean) => void;
  mediaList: IMediaItem[];
  initialIndex?: number;
}

const FullScreenMediaSlider: React.FC<FullScreenMediaSliderProps> = ({
  mediaList,
  onOpenChange,
  initialIndex = 0
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isEnd, setIsEnd] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const swiperRef = useRef<SwiperCore>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        swiperRef.current?.slideNext();
      } else if (e.key === 'ArrowLeft') {
        swiperRef.current?.slidePrev();
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className={cn(
          'absolute left-4 z-50 rounded-full bg-[hsl(240,3.7%,15.9%)] p-2 text-white shadow-lg',
          isBeginning && 'hidden'
        )}
      >
        <ChevronLeft size={28} />
      </button>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        initialSlide={activeIndex}
        spaceBetween={50}
        slidesPerView={1}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
          setIsEnd(swiper.isEnd);
          setIsBeginning(swiper.isBeginning);
        }}
        onInit={(swiper) => {
          setIsEnd(swiper.isEnd);
          setIsBeginning(swiper.isBeginning);
        }}
        className="size-full"
      >
        {mediaList.map((media, index) => (
          <SwiperSlide key={index}>
            {media.type === 'PHOTO' ? (
              <Image
                fill
                src={media.url}
                alt={`Slide ${index}`}
                className="mx-auto max-h-[calc(100vh-50px)] max-w-full object-contain"
              />
            ) : (
              <VideoPlayer
                option={{
                  url: media.url,
                  fullscreen: true,
                  fullscreenWeb: true
                }}
                // eslint-disable-next-line tailwindcss/no-custom-classname
                className="swiper-no-swiping mx-auto aspect-video max-h-[calc(100vh-50px)] max-w-full"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <p className="text-base font-medium text-[hsl(240,5%,64.9%)]">
          {activeIndex + 1}/{mediaList.length}
        </p>
      </div>
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className={cn(
          'absolute right-4 z-10 rounded-full bg-[hsl(240,3.7%,15.9%)] p-2 text-white shadow-lg',
          isEnd && 'hidden'
        )}
      >
        <ChevronRight size={28} />
      </button>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-4 top-4 z-50 rounded-full bg-[hsl(240,3.7%,15.9%)] hover:bg-[hsl(240,3.7%,15.9%)]"
        onClick={() => onOpenChange(false)}
      >
        <XIcon size={24} color="white" />
      </Button>
    </div>
  );
};

export default FullScreenMediaSlider;
