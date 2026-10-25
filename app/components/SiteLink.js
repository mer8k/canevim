import Link from "next/link";

export default function SiteLink({ href, prefetch, children, ...props }) {
  // The landing page is its own static document; enter it with a native navigation.
  return href === "/" || href.startsWith("/#")
    ? <a href={href} {...props}>{children}</a>
    : <Link href={href} prefetch={prefetch} {...props}>{children}</Link>;
}
