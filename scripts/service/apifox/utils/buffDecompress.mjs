import zlib from "zlib";

function buffDecompress(url, encodingType, buff, callback) {
  if (encodingType === "gzip" || encodingType === "br") {
    zlib[encodingType === "gzip" ? "unzip" : "brotliDecompress"](
      buff,
      (err, bufferDecompressed) => {
        if (!err) {
          const result = bufferDecompressed.toString();
          try {
            const json = JSON.parse(result);
            callback(json);
          } catch (e) {
            console.log(result);
            console.log("数据格式化时出现错误：", url);
            console.log(e);
          }
        } else {
          console.log(encodingType, "解压失败", url);
          console.log(err);
        }
      }
    );
  } else {
    const json = JSON.parse(buff.toString("utf-8"));
    callback(json);
  }
}

export default buffDecompress;
