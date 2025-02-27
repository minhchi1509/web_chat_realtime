import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional } from 'class-validator';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';

import { MAX_MESSAGE_FILE_SIZE } from 'src/common/constants/file.constant';

export class SendConversationMessageDTO {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true
  })
  @IsOptional()
  @MaxFileSize(MAX_MESSAGE_FILE_SIZE, {
    message: 'File size must be lower than or equal to 25MB',
    each: true
  })
  @IsFile({ message: 'File message must be a file', each: true })
  @ArrayMaxSize(5, { message: 'You can only upload 5 files at once' })
  @IsArray({ message: 'messageFiles message must be an array of files' })
  messageFiles?: MemoryStoredFile[];

  @IsOptional()
  content?: string;
}
