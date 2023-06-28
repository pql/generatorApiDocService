// import useUserStore from "@/store/modules/user";
import { AxiosRequestConfig } from "axios";

export default function (config: AxiosRequestConfig) {
  //   const userStore = useUserStore();

  if (config) {
    if (!config.headers) {
      config.headers = {};
    }
    if (!config.headers.Authorization) {
      //   config.headers.Authorization = userStore.token;
      config.headers.Authorization = "";
    }
  }
  return config;
}
