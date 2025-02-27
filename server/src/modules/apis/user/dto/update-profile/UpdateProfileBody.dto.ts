import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import {
  HasMimeType,
  IsFile,
  MaxFileSize,
  MemoryStoredFile
} from 'nestjs-form-data';

import { MAX_AVATAR_FILE_SIZE } from 'src/common/constants/file.constant';

export class UpdateProfileBodyDTO {
  @IsOptional()
  @ValidateIf((o) => o.avatar)
  @ApiProperty({ type: 'string', format: 'binary' })
  @HasMimeType(['image/*'], { message: 'Avatar must be an image' })
  @MaxFileSize(MAX_AVATAR_FILE_SIZE, {
    message: 'File size must be lower than 5MB'
  })
  @IsFile({ message: 'Avatar must be a file' })
  avatar?: MemoryStoredFile;

  @IsOptional()
  @ValidateIf((o) => o.fullName)
  @MinLength(1)
  @IsString()
  fullName?: string;
}
