'use server';
import axios from 'axios';
import { getServerSession } from 'next-auth';

import { authOptions } from 'src/app/api/auth/[...nextauth]/route';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

const logRequestDetail = false;

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getServerSession(authOptions);
    const accessToken = session?.user.mainProfile.accessToken || '';

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (logRequestDetail) {
      const METHOD = config.method;
      const REQUEST_HEADERS = config.headers;
      const REQUEST_BODY = config.data;
      const REQUEST_URL = `${config.baseURL}${config.url}`;
      console.log(
        JSON.stringify(
          { REQUEST_URL, METHOD, REQUEST_HEADERS, REQUEST_BODY },
          null,
          2
        )
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
