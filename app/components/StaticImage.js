import { getImageProps } from "next/image";

// Responsive Next image URLs without a client component or per-image effects.
// These photographs do not use blur placeholders or JavaScript load callbacks.
export default function StaticImage(options) {
  const { props } = getImageProps(options);
  return <img {...props} />;
}
