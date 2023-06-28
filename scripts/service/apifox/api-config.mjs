export const dataFilePath = "./scripts/service/apifox/data.json"; // 接口数据缓存文件，不会被git提交，只在本地做测试审查
export const docDir = "./scripts/service/apifox/doc.json"; // api暑促路径
export const oldRequestDataUrl = "./scripts/service/apifox/request.body.json"; // 自定义配置请求参数
export const oldResponseDataUrl = "./scripts/service/apifox/response.body.json"; // 真实请求返回值结构文件
export const oldApiDetailDataUrl =
  "./scripts/service/apifox/api-details-old.json";
export const oldApiSchemasDataUrl =
  "./scripts/service/apifox/api-schemas-old.json";
export const apiOutDir = "./src/api/index.ts"; // api输出路径
export const requestOutDir = "./src/typed/request.d.ts"; // 请求数据结构保存的路径
export const responseOutDir = "./src/typed/response.d.ts"; // 响应的数据结构保存的路径
export const responseValueOutDir = "./src/typed/response.value.ts"; // 响应的数据初始值保存的路径
export const methodImport = `import {get, post, put, del} from "@/api/http"`; // 导入路径
export const requestImport = `import type {$} from "@/typed/request"`; // 请求参数类型导入路径 $：是占位符
export const responseImport = `import type {$} from "@/typed/response"`; // 响应数据类型导入路径 $：是占位符
export const tokenPath = "./scripts/service/apifox/token";
export const projectId = "2381435"; // apifox中对应的项目id
