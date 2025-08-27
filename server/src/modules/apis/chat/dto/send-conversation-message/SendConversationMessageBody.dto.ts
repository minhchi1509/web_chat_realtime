import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MinLength
} from 'class-validator';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';

import { MAX_MESSAGE_FILE_SIZE } from 'src/common/constants/file.constant';
import { Trim } from 'src/common/decorators/sanitizer/trim.sanitizer';

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
  @Trim()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsUUID('4')
  parentMessageId?: string;
}
