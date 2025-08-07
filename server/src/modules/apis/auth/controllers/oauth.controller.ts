import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';

import {
  ApiExceptionResponse,
  RequestHeaders
} from 'src/common/decorators/common.decorator';
import { PublicRoute } from 'src/common/decorators/metadata.decorator';
import { GoogleOAuthGuard } from 'src/common/guards/google-oauth.guard';
import { IRequest } from 'src/common/types/common.type';
import { InitOAuthPasswordBodyDTO } from 'src/modules/apis/auth/dto/init-oauth-password/InitOAuthPasswordBody.dto';
import { InitOAuthPasswordHeadersDTO } from 'src/modules/apis/auth/dto/init-oauth-password/InitOAuthPasswordHeaders.dto';
import { InitOAuthPasswordResponseDTO } from 'src/modules/apis/auth/dto/init-oauth-password/InitOAuthPasswordResponse.dto';
import { OAuthService } from 'src/modules/apis/auth/services/oauth.service';

@ApiTags('OAuth')
@Controller('oauth')
@PublicRoute()
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(
    @Req() req: IRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const oAuthProfile = req.oAuthProfile;
    await this.oauthService.googleLoginRedirect(oAuthProfile, res);
  }

  @Post('init-password')
  @ApiExceptionResponse()
  async initPassword(
    @RequestHeaders()
    headers: InitOAuthPasswordHeadersDTO,
    @Body() body: InitOAuthPasswordBodyDTO,
    @Res({ passthrough: true }) res: Response
  ): Promise<InitOAuthPasswordResponseDTO> {
    const response = await this.oauthService.initPassword(
      headers.token,
      body,
      res
    );
    return plainToInstance(InitOAuthPasswordResponseDTO, response);
  }
}
