'use client';

import { ChangeEventHandler, useRef, useState } from 'react';

import PlayholderContent from 'src/components/ui/layouts/content/PlayholderContent';
import { cn } from 'src/utils/common.util';

const ProductsPage = () => {
  const [list, setList] = useState(Array.from({ length: 10 }, (_, i) => i));
  const scrollRef = useRef<HTMLDivElement>(null); // Ref để theo dõi thanh cuộn
  const previousScrollPosition = useRef(0); // Ref lưu trữ vị trí trước khi cập nhật

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const chunkSize = 5 * 1024 * 1024; // 5MB per chunk
      let offset = 0;
      while (offset < file.size) {
        const chunk = file.slice(offset, offset + chunkSize);
        offset += chunkSize;
        const formData = new FormData();
        console.log('chunk.size', chunk.size);

        formData.append('file', chunk);
      }
    }
  };

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <PlayholderContent>
        <div className="group relative z-0 mb-8 w-full">
          <input
            type="text"
            name="user_name"
            id="user_name"
            className="peer block w-full border-0 border-b-2 border-primary/40 bg-transparent px-0 py-2.5 focus:border-primary focus:outline-none focus:ring-0"
            placeholder=" "
            required
          />
          <label
            htmlFor="user_name"
            className={cn(
              'absolute top-3 -z-10 origin-[0] text-primary/40 duration-300',
              'peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-primary',
              'peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75'
            )}
          >
            Your Name
          </label>
        </div>
        <input type="file" onChange={handleFileChange} />
        {/* <iframe
          width={800}
          height={600}
          src="https://drive.google.com/file/d/1mK11VUssI4sz_-UWWzKq-fIYvLQYlvYh/preview"
          allowFullScreen
        /> */}
        {/* <NeonGradientCard className="h-[228px] w-[384px]" borderSize={5}>
          <div className="p-2">Siuuuu</div>
        </NeonGradientCard> */}
        {/* <MagicCard className="h-[228px] w-[384px]" /> */}
        {/* <div className="group flex h-fit w-full max-w-3xl gap-3 bg-red-300 p-3">
          <div className="h-80 flex-1 shrink-0 bg-teal-400 duration-300 group-hover:opacity-20 group-hover:hover:scale-110 group-hover:hover:opacity-100"></div>
          <div className="h-80 flex-1 shrink-0 bg-teal-400 duration-300 group-hover:opacity-20 group-hover:hover:scale-110 group-hover:hover:opacity-100"></div>
          <div className="h-80 flex-1 shrink-0 bg-teal-400 duration-300 group-hover:opacity-20 group-hover:hover:scale-110 group-hover:hover:opacity-100"></div>
          <div className="h-80 flex-1 shrink-0 bg-teal-400 duration-300 group-hover:opacity-20 group-hover:hover:scale-110 group-hover:hover:opacity-100"></div>
        </div> */}
        <div className="relative flex h-[650px] w-full max-w-3xl flex-col overflow-auto bg-red-700">
          <div className="sticky top-0 z-10 h-16 bg-teal-400"></div>
          <div className="flex flex-1">
            <div className="w-[120px] bg-yellow-400"></div>
            <div className="flex-1 bg-purple-700">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i}>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Veniam ipsa maxime officia? Dolor enim in, beatae qui, eius
                  tenetur veritatis architecto eaque culpa voluptates quod ab
                  necessitatibus ipsam voluptas quibusdam!
                </div>
              ))}
            </div>
          </div>
        </div>
      </PlayholderContent>
    </div>
  );
};

export default ProductsPage;
