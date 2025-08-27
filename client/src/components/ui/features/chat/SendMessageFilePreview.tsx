import { FileText, Play, XIcon } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
import { ScrollArea, ScrollBar } from 'src/components/ui/shadcn-ui/scroll-area';
import { TUploadFile } from 'src/types/common.type';

interface ISendMessageFilePreviewProps {
  messageFiles: TUploadFile[];
  onRemoveFile: (fileId: string) => void;
}

const SendMessageFilePreview: FC<ISendMessageFilePreviewProps> = ({
  messageFiles,
  onRemoveFile
}) => {
  return (
    <ScrollArea className="pb-2">
      <div className="flex gap-4">
        {messageFiles.map((file, index) => {
          const isVideoFile = file.originalFileObject.type.includes('video/');
          const isImageFile = file.originalFileObject.type.includes('image/');
          return (
            <div key={index} className="relative shrink-0 mt-2">
              {(isVideoFile || isImageFile) && (
                <Image
                  src={file.previewUrl}
                  alt="preview-file"
                  width={48}
                  height={48}
                  className="aspect-square rounded-lg object-cover"
                />
              )}
              {isVideoFile && (
                <div className="absolute inset-0 m-auto size-fit rounded-full bg-black bg-opacity-50 p-1">
                  <Play className="text-white" size={12} fill="white" />
                </div>
              )}
              {!isVideoFile && !isImageFile && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-[#C9CCD1] dark:bg-black p-3">
                  <FileText size={20} />
                  <span className="text-xs">
                    {file.originalFileObject.name}
                  </span>
                </div>
              )}
              <div
                className="absolute -right-2 -top-2 size-fit rounded-full bg-white dark:bg-zinc-700 p-1 duration-200 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => onRemoveFile(file.id)}
              >
                <XIcon size={12} />
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default SendMessageFilePreview;
