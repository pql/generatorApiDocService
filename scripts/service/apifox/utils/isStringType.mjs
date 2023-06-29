function isStringType(key) {
    return /email|phone|name|avatar|url|title/i.test(key) || /\w+(No|Time|Title|By|Name)$/.test(key)
}

export default isStringType