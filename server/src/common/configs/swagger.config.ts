import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Web Chat APIs')
  .setDescription('The Web Chat API description')
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'Bearer',
    description: 'Enter your access token here'
  })
  .build();

export const swaggerOptions: SwaggerCustomOptions = {
  customSiteTitle: 'Web Chat API',
  customCss: '.swagger-ui section.models { display: none}',
  customfavIcon: '/public/static/app-logo.svg'
};
