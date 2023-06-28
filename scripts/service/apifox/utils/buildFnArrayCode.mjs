function buildFnArrayCode(props) {
  const {
    url,
    fnName,
    requestBaseName,
    responseBaseName,
    method,
    apiName,
    headers,
    params,
  } = props;
  const resName = `${responseBaseName}Item`;
  const remarkList = [];
  params.forEach((i) => {
    remarkList.push(
      ` * @param {${requestBaseName}.${i.name}}${i.required ? "" : "?"}: ${
        i.type
      }; ${i.description === i.name ? "" : i.description}`
    );
  });

  const template = `
    /**
     * @description ${apiName} buildFnArrayCode
     * @param params: {${requestBaseName}} 请求参数${
    remarkList.length ? `\n${remarkList.join("\n")}` : ""
  }
     * @method ${method.toUpperCase()} 请求方式
     * @return Promise<${resName}[]> 返回值
     */
    export const ${fnName} = async (params?: ${requestBaseName}) => {
    \treturn ${method}<${resName}[]>(${url}, {
    \t\tparams${headers ? `,\n\t\t${headers}` : ""}
    \t})
    }
    `;
  return {
    requestName: [requestBaseName],
    responseName: [resName],
    code: template.trim(),
  };
}

export default buildFnArrayCode;
