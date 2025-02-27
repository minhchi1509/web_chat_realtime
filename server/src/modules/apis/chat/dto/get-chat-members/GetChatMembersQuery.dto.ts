import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { PaginationQueryDTO } from 'src/common/dto/PaginationQuery.dto';

export class GetChatMembersQueryDTO extends PaginationQueryDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  searchKey: string = '';
}
