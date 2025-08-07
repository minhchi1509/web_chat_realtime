import axios, { AxiosError } from 'axios';
import { redirect } from 'next/navigation';

import { env } from 'src/configs/env.config';
import { TErrorData } from 'src/types/error-response.type';
import { cloneRequest, formatErrorResponse } from 'src/utils/common.util';

const axiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true // đảm bảo gửi cookie cùng request
});

// Biến kiểm soát trạng thái làm mới token
let isRefreshing = false;
let refreshSubscribers: ((isRefreshSucess: boolean) => void)[] = [];
const isServer = typeof window === 'undefined';

// Gọi lại các request đang chờ sau khi refresh token thành công
const onRefreshed = (isRefreshSucess: boolean) => {
  refreshSubscribers.forEach((callback) => callback(isRefreshSucess));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<TErrorData>) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(formatErrorResponse(error));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((isRefreshSucess: boolean) => {
            if (isRefreshSucess) {
              resolve(axiosInstance(cloneRequest(originalRequest)));
            } else {
              reject(formatErrorResponse(error));
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
          {},
          {
            withCredentials: true // gửi cookie khi gọi refresh
          }
        );

        onRefreshed(true);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        onRefreshed(false);

        // Đăng xuất nếu refresh token cũng hết hạn
        if (isServer) {
          redirect('/login');
        } else {
          window.location.href = '/login';
        }
        return Promise.reject(
          formatErrorResponse(refreshError as AxiosError<TErrorData>)
        );
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatErrorResponse(error));
  }
);

export default axiosInstance;
