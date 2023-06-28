import buildResAnyTyped from "./buildResAnyTyped.mjs";
import buildResArrayTyped from "./buildResArrayTyped.mjs";
import getValueByType from "./getValueByType.mjs";

function buildRes(config) {
  const data = config.response;

  if (data.oldType === "array") {
    const { code, valueCode, name, deleteName } = buildResArrayTyped({
      url: config.url,
      name: config.responseBaseName,
      apiName: config.apiName,
      params: data,
    });
    return {
      responseName: name,
      deleteResponseName: deleteName,
      resCode: code,
      resValueCode: valueCode,
    };
  } else if (data.type === "any" || data.type === config.responseBaseName) {
    const { code, valueCode, name } = buildResAnyTyped({
      url: config.url,
      name: config.responseBaseName,
      apiName: config.apiName,
      params: data,
    });
    return {
      responseName: name,
      resCode: code,
      resValueCode: valueCode,
    };
  } else {
    const template1 = `
    /**
     * @description ${config.apiName} buildRes
     * @url ${config.url}
     */
    export type ${config.responseBaseName} = ${config.response.type}
    `;
    const template2 = `
    /**
     * @description ${config.apiName} buildRes
     * @url ${config.url}
     */
    export const ${config.responseBaseName}Value = ${getValueByType(
      config.response.type
    )}
    `;
    // 基础类型，无需处理
    return {
      responseName: [config.responseBaseName],
      resCode: template1.trim(),
      resValueCode: template2.trim(),
    };
  }
}

export default buildRes;
