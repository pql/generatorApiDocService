import Axios, { AxiosResponse } from "axios";
import qs from "qs";
import CustomRequestInterceptor from "@/api/interceptors/CustomRequestInterceptor";

export const baseURL = import.meta.env.VITE_APP_API_PREFIX;

export const CONTENT_TYPE = "Content-Type";

export const FORM_URLENCODED =
  "application/x-www-form-urlencoded; charset=UTF-8";

export const APPLICATION_JSON = "application/json; charset=UTF-8";
export const HEADER_FORMDATA = "multipart/form-data";

export const TEXT_PLAIN = "text/plain; charset=UTF-8";

const service = Axios.create({
  baseURL,
  timeout: 10 * 60 * 1000,
});

service.interceptors.request.use(
  (config: any) => {
    CustomRequestInterceptor(config);
    if (config.data instanceof FormData) {
      config.headers[CONTENT_TYPE] = HEADER_FORMDATA;
    } else if (
      config.headers[CONTENT_TYPE]?.includes("x-www-form-urlencoded") ||
      config.method.toLowerCase() === "get"
    ) {
      config.data = qs.stringify(config.data);
      config.headers[CONTENT_TYPE] = FORM_URLENCODED;
    } else if (!config.headers[CONTENT_TYPE]) {
      config.headers[CONTENT_TYPE] = APPLICATION_JSON;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200) {
      return response;
    } else {
      throw new Error(response.status.toString());
    }
  },
  (error) => {
    if (import.meta.env.MODE === "development") {
      console.log(error);
    }
    return Promise.reject({
      code: error.response.status,
      msg: error.response.statusText,
    });
  }
);

export default service;
