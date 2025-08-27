import { AxiosError } from 'axios';
import clsx, { ClassValue } from 'clsx';
import dayjs from 'dayjs';
import { redirect } from 'next/navigation';
import { pathToRegexp } from 'path-to-regexp';
import { twMerge } from 'tailwind-merge';

import { EHttpStatusCode } from 'src/constants/enum';
import {
  TSafeServerActionFn,
  TServerActionFnReturn
} from 'src/types/common.type';
import { TErrorData, TErrorResponse } from 'src/types/error-response.type';

export const delay = (seconds: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, seconds * 1000);
  });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const withSafeServerAction = <A extends any[], D>(
  fn: (...args: A) => Promise<D>
): TSafeServerActionFn<A, D> => {
  return async (...args: A) => {
    try {
      return { data: await fn(...args) };
    } catch (err) {
      const error = err as AxiosError<TErrorData>;
      const errorStatusCode = error.response!.status;
      const errorData = error.response!.data;
      const errorMessage = errorData?.message || 'Unknown error';
      if (errorStatusCode === EHttpStatusCode.UNAUTHORIZED) {
        redirect('/logout');
      }
      return {
        error: {
          message: errorMessage,
          data: errorData
        }
      };
    }
  };
};

export const executeServerAction = async <D>(
  fn: () => TServerActionFnReturn<D>
) => {
  const result = await fn();
  if (result.error) {
    throw result.error;
  }
  return result.data;
};

export const formatErrorResponse = (
  error: AxiosError<TErrorData>
): TErrorResponse => {
  const errorResponse = error.response!;
  const errorResponseData = errorResponse.data;
  const errorMessage = errorResponseData.message;
  return {
    message: errorMessage,
    data: errorResponseData
  };
};

export const cloneRequest = (config: any) => {
  const clonedConfig = {
    ...config,
    headers: { ...config.headers },
    data: config.data
  };

  // Nếu là FormData, clone bằng cách tạo bản sao mới
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const newFormData = new FormData();
    config.data.forEach((value: any, key: any) => {
      newFormData.append(key, value);
    });
    clonedConfig.data = newFormData;
  }

  return clonedConfig;
};

export const isRouteMatch = (route: string, urlPatterns: string[]) => {
  return urlPatterns.some((pattern) => {
    const { regexp } = pathToRegexp(pattern);
    return regexp.test(route);
  });
};

export const formatTimeAgo = (pastTime: string) => {
  const now = dayjs(); // Thời điểm hiện tại
  const past = dayjs(pastTime); // Thời điểm trong quá khứ

  // Tính khoảng cách thời gian
  const diffInSeconds = now.diff(past, 'second');
  const diffInMinutes = now.diff(past, 'minute');
  const diffInHours = now.diff(past, 'hour');
  const diffInDays = now.diff(past, 'day');
  const diffInWeeks = now.diff(past, 'week');
  const diffInMonths = now.diff(past, 'month');
  const diffInYears = now.diff(past, 'year');

  // Trả về kết quả tương ứng
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  } else {
    return `${diffInYears}y`;
  }
};

export const getDayName = (date: string): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const index = dayjs(date).day();
  return days[index];
};

export const formatMessageTimeLine = (time: string) => {
  if (dayjs().isSame(dayjs(time), 'day')) {
    return `${dayjs(time).format('HH:mm')}, today`;
  }

  if (dayjs().isSame(dayjs(time), 'week')) {
    return `${getDayName(time)} ${dayjs(time).format('HH:mm')}`;
  }

  return dayjs(time).format('HH:mm, DD/MM/YYYY');
};

export const getVideoPoster = async (
  videoFile: File,
  timeInSeconds: number
) => {
  if (!videoFile.type.includes('video')) {
    return '';
  }
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const videoObjectURL = URL.createObjectURL(videoFile);

  await new Promise((resolve) => {
    video.addEventListener('loadedmetadata', () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      video.currentTime = timeInSeconds;
    });

    video.addEventListener('seeked', () => resolve(''));
    video.src = videoObjectURL;
  });

  const ctx = canvas.getContext('2d');
  ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  const videoPosterURL = canvas.toDataURL('image/png');

  URL.revokeObjectURL(videoObjectURL);
  return videoPosterURL;
};

export const downloadFileFromUrl = async (
  url: string,
  savedFileName: string
) => {
  const blob = await (await fetch(url)).blob();
  const objectURL = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectURL;
  link.download = savedFileName;
  link.click();
  URL.revokeObjectURL(objectURL);
};

export const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const scrollToBottom = (element: HTMLElement) => {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: 'smooth'
  });
};
