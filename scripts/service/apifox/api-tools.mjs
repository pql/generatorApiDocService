import fs from "fs";
import { projectId, tokenPath } from "./api-config.mjs";
import { build, get } from "./node-request.mjs";

const API_FOX_TOKEN = fs.readFileSync(tokenPath, { encoding: "utf-8" });
if (API_FOX_TOKEN) {
  const Authorization = "Bearer " + API_FOX_TOKEN.trim();
  // 获取api列表
  const apiList = await get({
    name: "details",
    Authorization,
    projectId,
    saveCache: true, // 是否缓存接口原始数据
  });
  const sortedApiList = apiList
    .filter((i) => i.path)
    .sort((a, b) => a.path.localeCompare(b.path));

  // 获取api对应的schema
  const schemas = await get({
    name: "schemas",
    Authorization,
    projectId,
    saveCache: true, // 是否缓存接口原始数据
  });

  build(sortedApiList, schemas);
} else {
  console.log(
    "没有权限，请在/scripts/service/apifox文件夹下创建token文件(https://app.apifox.com网站下指定项目下的token)"
  );
}
