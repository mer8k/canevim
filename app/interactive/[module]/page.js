import { notFound } from "next/navigation";
import BreakfastPlanner from "../../components/BreakfastPlanner";
import RouteMatrix from "../../components/RouteMatrix";

const modules = ["planner-breakfast", "planner-gozleme", "planner-breakfast_grill", "routes"];
export const dynamicParams = false;
export function generateStaticParams() { return modules.map((module) => ({ module })); }
export async function generateMetadata({ params }) {
  const { module } = await params;
  return { title: "Can Evim ziyaret araçları", robots: { index: false, follow: false }, alternates: { canonical: `/interactive/${module}` } };
}
export default async function InteractiveFragment({ params }) {
  const { module } = await params;
  if (!modules.includes(module)) notFound();
  return <main id="main-content"><link rel="stylesheet" href={`/performance/ui/${module === "routes" ? "routes" : "interactive"}.css`} precedence="interactive" /><h1 className="sr-only">Can Evim ziyaret araçları</h1>{module === "routes" ? <RouteMatrix id="rota-listesi" compact /> : <BreakfastPlanner id="kahvalti-planla-content" initialConcept={module.replace("planner-", "")} />}</main>;
}
