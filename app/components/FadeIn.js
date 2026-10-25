// Content stays visible in server HTML. CSS adds a subtle entrance in supporting browsers.
export default function FadeIn({ children }) {
  return <div className="w-full flex-grow fade-in-section">{children}</div>;
}
