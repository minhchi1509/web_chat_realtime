import { ContextType, HttpException, HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { MessageMediaType } from '@prisma/client';
import axios from 'axios';
import { ClassConstructor, plainToClassFromExist } from 'class-transformer';
import metascraper from 'metascraper';
import MetascraperDescription from 'metascraper-description';
import MetascraperImage from 'metascraper-image';
import MetascraperTitle from 'metascraper-title';
import MetascraperUrl from 'metascraper-url';
import { parse } from 'twemoji-parser';

import { PaginationResponseDTO } from 'src/common/dto/PaginationResponse.dto';
import { LinkMetadata } from 'src/modules/apis/chat/dto/get-conversation-messages/GetConversationMessageResponse.dto';

export const plainToInstancePaginationResponse = <T>(
  classType: ClassConstructor<T>,
  responseData: unknown
) => {
  return plainToClassFromExist(
    new PaginationResponseDTO<T>(classType),
    responseData
  );
};

export const getMediaType = (mimeType: string): MessageMediaType => {
  if (mimeType.startsWith('image/')) {
    return 'PHOTO';
  } else if (mimeType.startsWith('video/')) {
    return 'VIDEO';
  } else if (mimeType.startsWith('audio/')) {
    return 'AUDIO';
  }
  return 'FILE';
};

export const throwErrorByContextType = (
  contextType: ContextType,
  response: string | object,
  httpOptions?: {
    statusCode?: HttpStatus;
  }
) => {
  if (contextType === 'http') {
    throw new HttpException(
      response,
      httpOptions?.statusCode ?? HttpStatus.BAD_REQUEST
    );
  } else if (contextType === 'ws') {
    throw new WsException(response);
  }
  throw new Error('Unknown context type');
};

export const getEmojiDisplayUrl = async (emojiCode: string) => {
  try {
    const _res = await axios.get(
      `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emojiCode}.png`
    );
    return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emojiCode}.png`;
  } catch (_error) {
    return null;
  }
};

export const extractUrl = (text?: string | null): string | null => {
  if (!text) return null;

  // URL regex pattern
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  const matches = text.match(urlRegex);

  return matches && matches.length > 0 ? matches[0] : null;
};

export const scrapeLinkMetadata = async (
  url: string
): Promise<LinkMetadata> => {
  let linkMetadata: LinkMetadata = {
    url,
    title: null,
    description: null,
    imageUrl: null
  };
  try {
    const scraper = metascraper([
      MetascraperDescription(),
      MetascraperImage(),
      MetascraperTitle(),
      MetascraperUrl()
    ]);

    // Fetch the HTML content from the URL with a timeout
    // Fetch HTML với axios
    const response = await axios.get(url, {
      timeout: 5000,
      responseType: 'text', // quan trọng: nhận về raw HTML
      maxRedirects: 5,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36'
      }
    });

    const html = response.data;
    const finalUrl = response.request?.res?.responseUrl || url;

    // Extract metadata
    const metadata = await scraper({ html, url: finalUrl });

    linkMetadata = {
      url: metadata.url || url,
      title: metadata.title || null,
      description: metadata.description || null,
      imageUrl: metadata.image || null
    };
  } catch (_error) {
    return linkMetadata;
  }
  return linkMetadata;
};

export const containsOnlyEmojiOrWhitespace = (str: string) => {
  // Xoá khoảng trắng, xuống dòng, tab,...
  const trimmed = str.trim();
  if (!trimmed) return true; // nếu toàn khoảng trắng => true

  // Parse emoji
  const parsed = parse(trimmed, { assetType: 'png' });
  const emojiOnly = parsed.map((e) => e.text).join('');

  // So sánh: nếu toàn bộ chuỗi (bỏ whitespace) == chuỗi emoji parse được => true
  return emojiOnly === trimmed.replace(/\s+/g, '');
};
