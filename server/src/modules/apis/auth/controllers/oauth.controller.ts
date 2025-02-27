import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { ApiExceptionResponse } from 'src/common/decorators/common.decorator';
import { PublicRoute } from 'src/common/decorators/metadata.decorator';
import { LoginExceptionResponseDTO } from 'src/modules/apis/auth/dto/login/LoginExceptionResponse.dto';
import { LoginResponseDTO } from 'src/modules/apis/auth/dto/login/LoginResponse.dto';
import { OAuthLoginBodyDTO } from 'src/modules/apis/auth/dto/oauth-login/OAuthLoginBody.dto';
import { OAuthService } from 'src/modules/apis/auth/services/oauth.service';

@ApiTags('OAuth')
@Controller('oauth')
@PublicRoute()
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  @ApiExceptionResponse({ type: LoginExceptionResponseDTO })
  @Post('google/login')
  async googleLogin(
    @Body() body: OAuthLoginBodyDTO
  ): Promise<LoginResponseDTO> {
    const response = await this.oauthService.googleLogin(body);
    return plainToInstance(LoginResponseDTO, response);
  }
}
