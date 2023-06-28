import upperFirstCase from "./upperFirstCase.mjs";

function createNameByUrl(prefix, url, method) {
  const list = url
    .replace(prefix + "/", "")
    .replace(/[{}]/g, "")
    .split("/");
  list.push(method);
  return list.map((i) => upperFirstCase(i)).join("");
}

export default createNameByUrl;
