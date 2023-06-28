import URL from "url";
import http from "http";
import https from "https";

async function request({ url, method, dataStr, headers }) {
  const urlObj = URL.parse(url);
  const protocol = urlObj.protocol.replace(":", "");
  console.log("收到请求，", url, method);
  return new Promise((resolve) => {
    const isHttpsProtocol = protocol === "https";
    const isHttpProtocol = protocol === "http";
    const isNotGetMethod = method.toUpperCase() !== "GET";
    const isNotDeleteMethod = method.toUpperCase() !== "DELETE";
    const protocolType = isHttpsProtocol
      ? https
      : isHttpProtocol
      ? http
      : https;
    const req = protocolType.request(
      {
        ...urlObj,
        ...(isHttpsProtocol ? { rejectUnauthorized: false } : {}),
        method, // 请求方式
        headers: {
          ...(isNotGetMethod
            ? { "Content-Length": Buffer.byteLength(dataStr) }
            : {}), // post必须填写
          "Content-type": "application/x-www-form-urlencoded", // 编码格式
          referer: url, // 如果资源有防盗链，则清空该属性
          ...headers,
        },
      },
      (res) => {
        console.log("已得到响应", res.statusCode, res.statusMessage);
        // 给浏览器返回数据
        if (res.statusCode === 200) {
          // 设置编码格式
          res.setEncoding("utf-8");
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            resolve(data);
          });
        } else {
          resolve(
            JSON.stringify({
              code: res.statusCode,
              msg: res.statusMessage,
              data: {},
            })
          );
        }
      }
    );
    req.on("error", (e) => {
      console.log("error", e.toString());
      resolve(
        JSON.stringify({
          code: 500,
          msg: e.toString(),
          data: {},
        })
      );
    });
    if (isNotGetMethod && isNotDeleteMethod) {
      // 向接口服务器 发送数据
      req.write(dataStr);
    }
    // 关闭发送通道
    req.end();
  });
}

export default request;
