function mergeObj(config, newObj) {
  for (const key in newObj) {
    const item = newObj[key];
    if (Array.isArray(item)) {
      if (config[key]) {
        item.forEach((s) => {
          if (!config[key].includes(s)) {
            config[key].push(s);
          }
        });
      } else {
        config[key] = item;
      }
    } else if (typeof item === "object") {
      for (let sk in item) {
        config[key][sk] = item[sk];
      }
    } else {
      config[key] = item;
    }
  }
  return config;
}

export default mergeObj;
