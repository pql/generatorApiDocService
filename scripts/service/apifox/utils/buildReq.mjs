import buildReqFileTyped from "./buildReqFileTyped.mjs";
import buildReqGetOrPostTyped from "./buildReqGetOrPostTyped.mjs";

function buildReq(config) {
  const hasFile = config.request.params.find((i) => i.type === "file");
  if (hasFile) {
    // 单独处理文件类型
    const { code, name, deleteName } = buildReqFileTyped({
      url: config.url,
      name: config.requestName,
      apiName: config.apiName,
      fileProps: config.request.params,
    });
    return {
      requestName: name,
      deleteRequestName: deleteName,
      reqCode: code,
    };
  } else {
    // 处理get/post请求的参数
    const { code, name } = buildReqGetOrPostTyped({
      url: config.url,
      name: config.requestBaseName,
      apiName: config.apiName,
      params: config.request.params.concat(config.request.query),
      path: config.request.path,
    });
    return {
      requestName: name,
      reqCode: code,
    };
  }
}

export default buildReq;
