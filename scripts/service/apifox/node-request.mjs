import fs from "fs";
import path from "path";
import request from "./utils/request.mjs";
import getEnvValueByKey from "./utils/getEnvValueByKey.mjs";
import createNameByUrl from "./utils/createNameByUrl.mjs";
import findSchema from "./utils/findSchema.mjs";
import getFnName from "./utils/getFnName.mjs";
import translateType from "./utils/translateType.mjs";
import buildFn from "./utils/buildFn.mjs";
import buildReq from "./utils/buildReq.mjs";
import buildRes from "./utils/buildRes.mjs";
import mergeObj from "./utils/mergeObj.mjs";
import fnCode from "./utils/fnCode.mjs";
import reqCode from "./utils/reqCode.mjs";
import resCode from "./utils/resCode.mjs";
import resValueCode from "./utils/resValueCode.mjs";
import buffDecompress from "./utils/buffDecompress.mjs";
import clearResponseData from "./utils/clearResponseData.mjs";
import deepMerge from "./utils/deepMerge.mjs";
import {
  apiOutDir,
  docDir,
  methodImport,
  oldApiDetailDataUrl,
  oldApiSchemasDataUrl,
  oldRequestDataUrl,
  oldResponseDataUrl,
  requestImport,
  requestOutDir,
  responseImport,
  responseOutDir,
  responseValueOutDir,
} from "./api-config.mjs";

export const VITE_APP_API_PREFIX = getEnvValueByKey("VITE_APP_API_PREFIX"); // api前缀

export async function get({ name, Authorization, projectId, saveCache }) {
  const res = await request({
    url: `https://api.apifox.cn/api/v1/api-${name}?locale=zh-CN`,
    headers: {
      Authorization,
      Referer: "https://www.apifox.cn/",
      "x-project-id": projectId,
    },
    method: "GET",
  });
  const data = JSON.parse(res);

  const result = data.data;

  if (saveCache) {
    // 缓存原始接口数据
    const apiNamePath = path.resolve(
      `scripts/service/apifox/api-${name}-old.json`
    );
    fs.writeFileSync(apiNamePath, JSON.stringify(result, null, 4), {
      encoding: "utf-8",
    });
  }
  return result;
}

export function build(apiList, schemas) {
  let dataList = [];
  // 组装数据
  if (apiList.length && schemas.length) {
    const requestBody = fs.existsSync(path.resolve(oldRequestDataUrl))
      ? JSON.parse(
          fs.readFileSync(path.resolve(oldRequestDataUrl), {
            encoding: "utf-8",
          }) || "{}"
        )
      : {};
    const responseBody = fs.existsSync(path.resolve(oldResponseDataUrl))
      ? JSON.parse(
          fs.readFileSync(path.resolve(oldResponseDataUrl), {
            encoding: "utf-8",
          }) || "{}"
        )
      : {};

    for (const item of apiList) {
      const url = item.path.replace(VITE_APP_API_PREFIX, "");
      const pureUrl = url.replace(/\/\{[^{}]+}/g, "");
      const pathReqUrl = url.replace(/\/\{/g, "/${");

      const key = createNameByUrl(VITE_APP_API_PREFIX, item.path, item.method);
      const req = item.requestBody.jsonSchema || {};
      const res = item.responses.find((i) => i.code === 200)?.jsonSchema || {
        type: "object",
        properties: {},
      };
      const requestSchema =
        req.properties || findSchema(req.$ref, schemas)?.properties;
      const responseSchema =
        res.properties?.data ||
        findSchema(res.$ref, schemas)?.properties?.data ||
        {}; // aa |  169811563

      const requestList = [];
      if (requestSchema) {
        if (req.required?.length) {
          req.required.forEach((i) => {
            requestSchema[i].required = true;
          });
        }

        Object.keys(requestSchema)
          .sort((a, b) => a.localeCompare(b))
          .forEach((key) => {
            if (requestSchema[key].type) {
              requestList.push({
                name: key,
                ...requestSchema[key],
              });
            }
          });
      }

      if (responseSchema.$ref) {
        responseSchema.properties = findSchema(
          responseSchema.$ref,
          schemas
        ).properties;
      } else if (responseSchema.items?.$ref) {
        responseSchema.items = findSchema(responseSchema.items.$ref, schemas);
      }
      delete responseSchema.$ref;
      delete responseSchema["x-apifox-orders"];
      delete responseSchema.items?.["x-apifox-orders"];
      delete responseSchema.items?.$ref;

      const config = {
        url,
        pureUrl,
        pathReqUrl,
        method: item.method,
        apiName: item.name,
        key,
        fnName: getFnName(key),
        requestBaseName: `I${key}`,
        requestName: [`I${key}`],
        responseBaseName: `O${key}`,
        responseName: [`O${key}`],
        responseValueName: [`O${key}Value`],
        request: {
          // file
          contentType: item.requestBody.type,
          params: (item.requestBody.parameters || []).concat(requestList),
          // query/path
          query: (item.parameters.query || []).concat(
            item.commonParameters.query || []
          ),
          path: (item.parameters.path || []).concat(
            item.commonParameters.path || []
          ),
          cookie: (item.parameters.cookie || []).concat(
            item.commonParameters.cookie || []
          ),
          header: (item.parameters.header || []).concat(
            item.commonParameters.header || []
          ),
        },
        response: responseSchema,
      };
      // 从地址中提取参数
      if (/\/\{[^{}]+}/.test(config.url)) {
        const otherPath = config.url.match(/\/\{([^{}\/]+)\}/g);
        otherPath.forEach((item) => {
          item = item.replace(/\/\{|}/g, "");
          const has = config.request.path.find((i) => i.name === item);
          if (!has) {
            config.request.path.push({
              name: item,
              type: "number | string",
            });
          }
        });
      }

      const bodyKey = config.method.toLowerCase() + "_" + config.pureUrl;
      // 处理前后端类型映射
      const conf = translateType(
        config,
        requestBody[bodyKey],
        responseBody[bodyKey]
      );

      const confOption = {
        bodyKey,
        ...conf,
      };

      const fnConfig = buildFn(confOption);
      const reqConfig = buildReq(confOption);
      const resConfig = buildRes(confOption);

      mergeObj(confOption, fnConfig);
      mergeObj(confOption, reqConfig);
      mergeObj(confOption, resConfig);

      // 删除确定不要的类型
      if (confOption.deleteResponseName) {
        const index = confOption.responseName.indexOf(
          confOption.deleteResponseName
        );
        confOption.responseName.splice(index, 1);

        let valueIndex = confOption.responseValueName.indexOf(
          `${confOption.deleteResponseName}Value`
        );
        confOption.responseValueName.splice(valueIndex, 1);
      }

      if (confOption.deleteRequestName) {
        const index = confOption.requestName.indexOf(
          confOption.deleteRequestName
        );
        confOption.requestName.splice(index, 1);
      }

      // 去重
      if (!dataList.find((i) => i.bodyKey === confOption.bodyKey)) {
        dataList.push(config);
      }
    }
  } else {
    return;
  }

  dataList = dataList.sort((a, b) => a.key.localeCompare(b.key));

  fs.writeFileSync(path.resolve(docDir), JSON.stringify(dataList, null, 4), {
    encoding: "utf-8",
  });
  fs.writeFileSync(
    path.resolve(apiOutDir),
    fnCode(dataList, methodImport, requestImport, responseImport),
    { encoding: "utf-8" }
  );

  fs.writeFileSync(path.resolve(requestOutDir), reqCode(dataList), {
    encoding: "utf-8",
  });
  fs.writeFileSync(path.resolve(responseOutDir), resCode(dataList), {
    encoding: "utf-8",
  });
  fs.writeFileSync(path.resolve(responseValueOutDir), resValueCode(dataList), {
    encoding: "utf-8",
  });
}

export function viteProxy(proxy) {
  proxy.on("error", (e) => {
    console.log("proxyError , 代理失败：服务器错误");
    console.log(JSON.stringify(e, null, 4));
  });
  proxy.on("proxyRes", (proxyRes, req, res) => {
    let encodingType = proxyRes.headers["content-encoding"];
    const body = [];
    proxyRes.on("data", (chunk) => {
      body.push(chunk);
    });
    proxyRes.on("end", () => {
      let buff = Buffer.concat(body);
      buffDecompress(req.url, encodingType, buff, (json) => {
        if (json.code === 200 && json.data !== undefined) {
          // 处理url
          let urlPath = req.url.split("?")[0];
          urlPath = urlPath
            .replace(getEnvValueByKey("VITE_APP_API_PREFIX"), "")
            .replace(/\/\d+$/, "");
          let key = req.method.toLowerCase() + "_" + urlPath;
          // 每次都重新读取文件
          const docFile = fs.existsSync(path.resolve(docDir))
            ? JSON.parse(
                fs.readFileSync(path.resolve(docDir), { encoding: "utf-8" }) ||
                  "[]"
              )
            : [];
          const resFile = fs.existsSync(path.resolve(oldResponseDataUrl))
            ? JSON.parse(
                fs.readFileSync(path.resolve(oldResponseDataUrl), {
                  encoding: "utf-8",
                }) || "{}"
              )
            : {};
          const dataFile = fs.existsSync(path.resolve(dataFilePath))
            ? JSON.parse(
                fs.readFileSync(path.resolve(dataFilePath), {
                  encoding: "utf-8",
                }) || "{}"
              )
            : {};
          dataFile[key] = json.data;
          let newData = {};
          Object.keys(dataFile)
            .sort((a, b) => a.localeCompare(b))
            .forEach((i) => {
              newData[i] = dataFile[i];
            });
          fs.writeFileSync(
            path.resolve(dataFilePath),
            JSON.stringify(newData, null, 4),
            { encoding: "utf-8" }
          );

          // 找到对应的原始数据结构
          const oldRes = resFile[key];
          // 处理新的数据结构
          const newRes = clearResponseData(json.data);
          let newObj = deepMerge(oldRes, newRes, true);

          // 判断更新条件
          if (JSON.stringify(oldRes) !== JSON.stringify(newObj)) {
            console.log(
              urlPath,
              "返回值类型：",
              Array.isArray(newRes)
                ? "array"
                : newRes === null
                ? "null"
                : typeof newRes === "string"
                ? newRes
                : typeof newRes
            );
            delete resFile[urlPath];
            resFile[key] = newObj;
            fs.writeFileSync(
              oldResponseDataUrl,
              JSON.stringify(resFile, null, 4),
              { encoding: "utf-8" }
            );
            const index = docFile.findIndex((i) => i.bodyKey === key);
            if (index > -1) {
              const oldDocItem = docFile[index];
              // 处理前后端类型映射
              let newDocItem = translateType(oldDocItem, null, newRes);
              newDocItem = {
                ...newDocItem,
                ...buildRes(newDocItem),
              };
              docFile[index] = newDocItem;
              fs.writeFileSync(docDir, JSON.stringify(docFile, null, 4), {
                encoding: "utf-8",
              });
              fs.writeFileSync(
                responseOutDir,
                (() => {
                  return `\n${docFile
                    .filter((i) => !!i.resCode)
                    .map((i) => i.resCode)
                    .join("\n\n")}\n\nexport default {\n\t${docFile
                    .filter((i) => i.responseName?.length > 0)
                    .map((i) => i.responseName.join(",\n\t"))
                    .join(",\n\t")},\n}\n`;
                })(),
                { encoding: "utf-8" }
              );
              fs.writeFileSync(
                responseValueOutDir,
                (() => {
                  return `\n${docFile
                    .filter((i) => !!i.resValueCode)
                    .map((i) => i.resValueCode)
                    .join("\n\n")}\n\nexport default {\n\t${docFile
                    .filter((i) => i.responseValueName?.length > 0)
                    .map((i) => i.responseValueName.join(",\n\t"))
                    .join(",\n\t")},\n}\n`;
                })(),
                { encoding: "utf-8" }
              );

              // 重新生成所有接口信息
              const apiList = fs.existsSync(path.resolve(oldApiDetailDataUrl))
                ? JSON.parse(
                    fs.readFileSync(path.resolve(oldApiDetailDataUrl), {
                      encoding: "utf-8",
                    }) || "{}"
                  )
                : [];
              const schemas = fs.existsSync(path.resolve(oldApiSchemasDataUrl))
                ? JSON.parse(
                    fs.readFileSync(path.resolve(oldApiSchemasDataUrl), {
                      encoding: "utf-8",
                    }) || "{}"
                  )
                : [];
              build(apiList, schemas);
            }
          }
        }
      });
      res.end(buff.toString("utf8"));
    });
  });
}
