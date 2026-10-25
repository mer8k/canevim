// Git checkouts may use CRLF on Windows and LF on production Linux.
// Line-ending conversion alone must not advance sitemap lastmod.
export function contentBytes(source, bytes) {
  return /\.(?:[cm]?js|jsx|tsx?|css|json|html|md)$/i.test(source)
    ? Buffer.from(bytes.toString("utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n"))
    : bytes;
}
