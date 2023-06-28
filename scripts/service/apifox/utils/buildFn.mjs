import buildFnArrayCode from "./buildFnArrayCode.mjs";
import buildFnFileCode from "./buildFnFileCode.mjs";
import buildFnGetOrPostCode from "./buildFnGetOrPostCode.mjs";
import buildFnPathCode from "./buildFnPathCode.mjs";

function buildFn(config) {
  const url = `\`${config.pathReqUrl}\``;
  const hasFile = config.request.params.find((i) => i.type === "file");
  const headers = `${
    config.request &&
    config.request.contentType !== "none" &&
    !config.request.contentType.includes("form-data")
      ? `headers: { 'Content-Type': '${config.request.contentType}'}`
      : ""
  }`;
  if (config.request.path.length) {
    const { requestName, responseName, code } = buildFnPathCode({
      url: url,
      fnName: config.fnName,
      requestName: config.requestName,
      requestBaseName: config.requestBaseName,
      responseBaseName: config.responseBaseName,
      method: config.method,
      apiName: config.apiName,
      headers,
      pathList: config.request.path,
      query: config.request.query,
      params: config.request.params,
      resProps: config.response,
    });
    return {
      requestName,
      responseName,
      fnCode: code,
    };
  } else if (hasFile) {
    const { requestName, responseName, code } = buildFnFileCode({
      url: url,
      fnName: config.fnName,
      requestBaseName: config.requestBaseName,
      responseBaseName: config.responseBaseName,
      method: config.method,
      apiName: config.apiName,
      headers,
      params: config.request.params,
    });
    return {
      requestName,
      responseName,
      fnCode: code,
    };
  } else {
    if (config.response.oldType === "array") {
      const { requestName, responseName, code } = buildFnArrayCode({
        url: url,
        fnName: config.fnName,
        requestBaseName: config.requestBaseName,
        responseBaseName: config.responseBaseName,
        method: config.method,
        apiName: config.apiName,
        headers,
        params: config.request.params.concat(config.request.query),
      });
      return {
        requestName,
        responseName,
        fnCode: code,
      };
    } else {
      const { requestName, responseName, code } = buildFnGetOrPostCode({
        url: url,
        fnName: config.fnName,
        requestBaseName: config.requestBaseName,
        responseBaseName: config.responseBaseName,
        method: config.method,
        apiName: config.apiName,
        headers,
        params: config.request.params.concat(config.request.query),
        resProps: config.response,
      });
      return {
        requestName,
        responseName,
        fnCode: code,
      };
    }
  }
}

export default buildFn;
