// import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
// import { setAuthUser, getRefreshToken, isAccessTokenExpired } from "./auth";
// import Cookie from "js-cookie";

// const useAxios: AxiosInstance = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/v1/",
//   timeout: 10000000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Flag to prevent multiple refresh token requests
// let isRefreshing = false;
// let failedQueue: { resolve: (value: string | null) => void; reject: (reason?: unknown) => void }[] = [];

// const processQueue = (error: unknown, token: string | null = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// useAxios.interceptors.request.use(
//   async (config: InternalAxiosRequestConfig) => {
//     const accessToken = Cookie.get("access_token");

//     if (accessToken) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }

//     if (accessToken && isAccessTokenExpired(accessToken)) {
//       if (!isRefreshing) {
//         isRefreshing = true;
//         const refreshToken = Cookie.get("refresh_token");

//         if (!refreshToken) {
//           return Promise.reject(new Error("No refresh token available"));
//         }

//         try {
//           const response = await getRefreshToken(refreshToken);
//           setAuthUser(response.data.access, response.data.refresh);
//           config.headers = config.headers || {};
//           config.headers.Authorization = `Bearer ${response.data.access}`;
//           processQueue(null, response.data.access);
//         } catch (error) {
//           processQueue(error, null);
//           Cookie.remove("access_token");
//           Cookie.remove("refresh_token");
//           return Promise.reject(error);
//         } finally {
//           isRefreshing = false;
//         }
//       } else {
//         // Add request to queue if refresh token request is in progress
//         return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
//           failedQueue.push({
//             resolve: (token) => {
//               if (token) {
//                 config.headers = config.headers || {};
//                 config.headers.Authorization = `Bearer ${token}`;
//                 resolve(config);
//               } else {
//                 reject(new Error("Failed to refresh token"));
//               }
//             },
//             reject,
//           });
//         });
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// useAxios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       console.error("Unauthorized access - you may need to log in:", error);
//     }
//     return Promise.reject(error);
//   }
// );

// export default useAxios; 