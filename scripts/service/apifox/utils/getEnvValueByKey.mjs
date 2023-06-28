import path from "path";
import fs from "fs";
function getEnvValueByKey(key, mode = "development") {
  let filePath = path.resolve(".env.development");
  switch (mode) {
    case "development":
      filePath = path.resolve(".env.development");
      break;
    case "production":
      filePath = path.resolve(".env.production");
      break;
    case "staging":
      filePath = path.resolve(".env.staging");
      break;
    default:
      filePath = path.resolve(".env.development");
  }
  let value = "";
  const env = fs.readFileSync(filePath, { encoding: "utf-8" });
  env
    .replace(/\x20*#[^\n]*/g, "")
    .split(/\s*\n\s*/)
    .forEach((i) => {
      if (i.includes(key)) {
        value = i.split(/\s*=\s*/)[1]?.trim();
      }
    });
  return value;
}

export default getEnvValueByKey;
