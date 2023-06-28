import { AxiosResponse } from "axios";
import { App } from "vue";
import request from "@/api/axios.config";
// import { logout } from "@/store/modules/user";

export interface HttpOptionBase {
  params?: any;
  method?: string;
  headers?: any;
}

export interface HttpOption extends HttpOptionBase {
  url: string;
}

export interface Response<T = any> {
  total?: number;
  code: number;
  msg: string;
  data: T;
}

export type MethodType = "get" | "post" | "put" | "delete";

function http<T = any>(options: HttpOption) {
  const { url, params = {}, method = "GET", headers = {} } = options;
  return new Promise<Response<T>>((resolve) => {
    const successHandler = (res: AxiosResponse<Response<T>>) => {
      if (res.data.code !== 200) {
        res.data.data = null as any;
        res.data.msg = res.data.msg || "请求失败，未知异常";
        // window.$message.error(res.data.msg, {
        //   keepAliveOnHover: true,
        // });
        if (res.data.code === 401) {
          //   logout();
          location.reload();
        }
      }
      resolve(res.data as Response<T>);
    };
    const failHandler = (error: Response<Error>) => {
      // throw new Error(error.msg || '请求失败，未知异常');
      error.msg = error.msg || "请求失败，未知异常";
      //   window.$message.error(`${error.code} ${error.msg}`, {
      //     keepAliveOnHover: true,
      //   });
      resolve({ data: null as any, code: error.code, msg: error.msg });
    };
    const lowerMethod = method.toLowerCase() as MethodType;
    switch (method) {
      case "PUT":
      case "POST":
        request[lowerMethod](url, params, { headers }).then(
          successHandler,
          failHandler
        );
        break;
      default:
        request[lowerMethod](url, { params }).then(successHandler, failHandler);
    }
  });
}

export async function get<T = any>(
  url: string,
  props: HttpOptionBase = {}
): Promise<Response<T>> {
  return await http<T>({
    url,
    ...props,
    method: "GET",
  });
}

export async function post<T = any>(
  url: string,
  props: HttpOptionBase
): Promise<Response<T>> {
  return await http<T>({
    url,
    ...props,
    method: "POST",
  });
}

export async function put<T = any>(
  url: string,
  props: HttpOptionBase
): Promise<Response<T>> {
  return await http<T>({
    url,
    ...props,
    method: "PUT",
  });
}

export async function del<T = any>(
  url: string,
  props: HttpOptionBase = {}
): Promise<Response<T>> {
  return await http<T>({
    url,
    ...props,
    method: "DELETE",
  });
}

function install(app: App): void {
  app.config.globalProperties.$http = http;

  app.config.globalProperties.$httpGet = get;

  app.config.globalProperties.$httpPost = post;

  app.config.globalProperties.$httpPut = put;

  app.config.globalProperties.$httpDel = del;
}

export default {
  install,
  get,
  post,
  put,
  del,
};
