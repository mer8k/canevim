import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { CONTENT_ROUTES, CANONICAL_ORIGIN } from "../app/seo-routes.mjs";
import { experiences, intentClusters } from "../app/growth-content.js";
import { buildPageGraph, MENU_SECTIONS } from "../app/growth-schema.js";
import nextConfig from "../next.config.mjs";
import { compiledPagePath } from "./compiled-pages.mjs";

process.chdir(path.resolve(import.meta.dirname, ".."));
const args = process.argv.slice(2), draft = args.includes("--draft");
const option = (name, fallback) => { const at = args.indexOf(name); return at < 0 ? fallback : args[at + 1]; };
const exists = (file) => fs.existsSync(file);
const read = (file, fallback = null) => { const text = exists(file) ? fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").trim() : ""; return text ? JSON.parse(text) : fallback; };
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const format = (value) => value == null ? "Bekleniyor" : new Intl.NumberFormat("tr-TR").format(value);
const pct = (value, digits = 2) => `%${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value * 100)}`;
const date = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date());
const textOf = (html) => html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&[^;\s]+;/g, " ").replace(/\s+/g, " ").trim();
const wordCount = (html) => html ? textOf(html).split(/\s+/).filter(Boolean).length : 0;
const reportNames = ["CANEVIM-DEV-BUYUME-RAPORU.html", "TUM-OPERASYON-KANITLARI.md"];
const baseline = read(".audit/baseline.json"), round2Baseline = read(".audit/round2/baseline.json");
const beforeHtml = read(".audit/baseline-html.json"), round1 = read(".audit/round2/before-final-metrics.json");
const beforeLh = read(".audit/lighthouse-before-summary.json"), round1Lh = read(".audit/round2/before-lighthouse-after-summary.json");
const gsc = read(".audit/round2/gsc-evidence.json");
if (!baseline || !round2Baseline || !beforeHtml || !round1 || !gsc) throw new Error("Initial/round-two baselines and real GSC evidence are required.");
const lhFile = option("--lighthouse", exists(".audit/round2/lighthouse-final-summary.json") ? ".audit/round2/lighthouse-final-summary.json" : ".audit/lighthouse-after-summary.json");
const afterLh = read(lhFile), http = read(option("--http", ".audit/http-tests.json")), browser = read(option("--browser", exists(".audit/round2/browser-tests.json") ? ".audit/round2/browser-tests.json" : ".audit/browser-tests.json"));
const seo = read(option("--seo", ".audit/round2/seo-infra-check.json")) || read(".audit/seo-infra-check.json");
const routes = read(".audit/route-tests.json", {}), deployment = read(".audit/round2/deployment-verification.json");
const buildId = exists(".next/BUILD_ID") ? fs.readFileSync(".next/BUILD_ID", "utf8").trim() : null;
const buildTime = exists(".next/BUILD_ID") ? fs.statSync(".next/BUILD_ID").mtimeMs : Infinity;
const redirectCount = (await nextConfig.redirects()).length;
const extra = exists("app/expanded-experiences.js") ? await import("../app/expanded-experiences.js") : {};
const content = new Map([...experiences, ...(extra.expandedExperiences || [])].map((entry) => [entry.slug, entry]));
const experienceRoutes = CONTENT_ROUTES.filter(({ source }) => source === "app/[experience]/page.js");
const pages = CONTENT_ROUTES.map(({ path: route }) => {
  const file = compiledPagePath(route);
  if (!exists(file)) return { path: route, compiled: false, bytes: null, sha256: null, visibleWords: null, articleWords: null };
  const bytes = fs.readFileSync(file), html = bytes.toString();
  const article = html.match(/<article class="growth-article">([\s\S]*?)<\/article>/)?.[1];
  return { path: route, compiled: true, bytes: bytes.length, sha256: sha(bytes), visibleWords: wordCount(html), articleWords: article ? wordCount(article) : null };
});
const allCompiled = pages.every(({ compiled }) => compiled);
const articleFailures = pages.filter((page) => experienceRoutes.some(({ path: route }) => route === page.path) && (page.articleWords == null || page.articleWords < 800));
const browserRoutes = new Set((browser?.pages || []).map(({ route }) => route));
const qa = {
  build: allCompiled && experienceRoutes.every(({ path: route }) => experiences.some(({ slug }) => route === `/${slug}`)),
  articles: allCompiled && !articleFailures.length,
  seo: seo?.passed === true && seo.canonicalPages === CONTENT_ROUTES.length && seo.redirectRules === redirectCount,
  http: http?.failed === 0 && http.configuredRedirectRules === redirectCount && (http.results || []).filter(({ name }) => name.startsWith("canonical:")).length === CONTENT_ROUTES.length && Date.parse(http.testedAt) >= buildTime - 1000,
  browser: browser?.status === "passed" && !browser.failures?.length && CONTENT_ROUTES.every(({ path: route }) => browserRoutes.has(route)) && Date.parse(browser.testedAt) >= buildTime - 1000,
  lighthouse: !draft && afterLh?.categories?.performance >= 98 && afterLh?.categories?.accessibility === 100 && afterLh?.categories?.seo === 100 && !afterLh.runtimeError && Date.parse(afterLh.fetchTime) >= buildTime - 1000 && JSON.stringify(afterLh) !== JSON.stringify(round1Lh),
};
if (!draft && Object.values(qa).some((passed) => !passed)) throw new Error(`Final evidence incomplete; --draft explicitly labels pending results. ${JSON.stringify({ qa, articleFailures: articleFailures.map(({ path: route }) => route) })}`);
const totalAfter = allCompiled ? pages.reduce((sum, page) => sum + page.bytes, 0) : null;
const ratio = totalAfter == null ? null : totalAfter / beforeHtml.totalIndexableBytes;
const round2Ratio = totalAfter == null ? null : totalAfter / round1.afterHtmlBytes;
if (!draft && ratio < 2) throw new Error("Complete HTML has not doubled relative to the original baseline.");
const live = deployment?.status === "verified" && deployment.expectedCanonicalPages === CONTENT_ROUTES.length && deployment.testedBuildId === buildId;
const finalLhContext = afterLh?.finalUrl === `${CANONICAL_ORIGIN}/` ? "canlı" : "yerel";
if (!draft && finalLhContext === "canlı" && (!live || Date.parse(afterLh.fetchTime) < Date.parse(deployment.checkedAt) - 60000)) throw new Error("Production final Lighthouse requires fresh verification of this tested build.");
const productionLh = read(".audit/round2/lighthouse-live-summary.json");
const productionLhVerified = live && productionLh?.finalUrl === `${CANONICAL_ORIGIN}/` && !productionLh.runtimeError && Date.parse(productionLh.fetchTime) >= Date.parse(deployment.checkedAt) - 60000;
const productionText = productionLhVerified ? `Canlı ${CANONICAL_ORIGIN}/ mobil Lighthouse: performans ${productionLh.categories.performance}, erişilebilirlik ${productionLh.categories.accessibility}, SEO ${productionLh.categories.seo}. LCP ${(productionLh.metrics.largestContentfulPaint / 1000).toFixed(2)} sn, TBT ${Math.round(productionLh.metrics.totalBlockingTime)} ms, CLS ${productionLh.metrics.cumulativeLayoutShift.toFixed(4)}. Ölçüm: ${productionLh.fetchTime}. Kanıt: .audit/round2/lighthouse-live-summary.json. Bu bir laboratuvar koşusudur.` : "Canlı Lighthouse ölçümü bu yayın için henüz doğrulanmadı; yerel ölçüm canlı ölçüm olarak sunulmaz.";
const publishText = live ? `Canlı yayın doğrulandı; commit ${deployment.pushedCommitSha}.` : "Bu build için canlı yayın henüz doğrulanmadı; yerel çalışma ve yayın sonucu ayrı tutulur.";
const providerPublicationText = live && deployment.verificationMode === "authenticated_vercel_provider"
  ? `Yetkili Vercel CLI üzerinden salt okunur sağlayıcı denetimi: ${deployment.provider.project.name} (${deployment.provider.project.id}), deployment ${deployment.provider.deployment.id}, tam Git SHA, production/READY durumu, alias ataması ve iki doğrulanmış alan adı eşleşti. Genel yayın kontrolleri ${deployment.publicChecksPassed}/${deployment.publicChecksPassed + deployment.publicChecksFailed}; sağlayıcı kriterleri ${Object.values(deployment.provider.criteria).filter(Boolean).length}/${Object.keys(deployment.provider.criteria).length}. Alan adının bağlı olduğu proje Vercel kayıtlarından doğrulandı. Kaynak: .audit/round2/deployment-verification.json. GitHub kaynağından yayın yapıldı; yerel GSC girdileri yüklenmedi.`
  : "Read-only hazırlık kontrolü GitHub main dalında ADMIN erişimi ve iki tarihsel Vercel production entegrasyonu (canevim / canevim-next) gösterdi. Yeni SHA'nın provider durumları ve asıl www sayfaları doğrulanmadan yayın tamamlandı denmez. Public gövde eşleşmesi özel alan adının proje sahipliğini tek başına kanıtlamaz. Kaynak: .audit/round2/deploy-readiness.md ve varsa deployment-verification.json.";
const liveTargetMet = productionLhVerified && productionLh.categories.performance >= 98 && productionLh.categories.accessibility === 100 && productionLh.categories.seo === 100;
const pagespeedApi = read(".audit/round2/pagespeed-public-api.json");
const productionTargetText = productionLhVerified ? `Canlı 98–100 performans hedefi ${liveTargetMet ? "sağlandı" : "sağlanmadı; açık madde olarak korunuyor"}.${pagespeedApi?.error?.code === 429 ? " Bağımsız Google PageSpeed API ölçümü HTTP 429 kota yanıtı nedeniyle alınmadı; ek bir puan üretilmedi." : ""}` : "Canlı performans hedefi için doğrulanmış ölçüm bekleniyor.";
const scores = qa.lighthouse ? afterLh.categories : null;
const menuItems = MENU_SECTIONS.reduce((sum, section) => sum + section.items.length, 0);
const graphMin = buildPageGraph()["@graph"].length, graphMax = buildPageGraph({ faqs: [["Örnek soru", "Örnek yanıt"]] })["@graph"].length;
const gs = gsc.localSource, gm = gsc.sourceVerifiedMetrics;
const packageGsc = Boolean(gs.sourceDataDirectory && gsc.queryPage);
const gscSourceLabel = packageGsc ? path.basename(gs.sourceDataDirectory) : path.basename(gs.path);
const metrics = {
  date, status: draft ? "draft_pending_final_evidence" : "final_local_qa_passed", deployment: publishText, buildId,
  beforeIndexablePages: Object.keys(beforeHtml.pages).filter((name) => name !== "blog").length, round1IndexablePages: round1.afterIndexablePages,
  afterIndexablePages: CONTENT_ROUTES.length, compiledPages: pages.filter(({ compiled }) => compiled).length, experienceArticles: experienceRoutes.length,
  beforeHtmlBytes: beforeHtml.totalIndexableBytes, round2BeforeHtmlBytes: round1.afterHtmlBytes, afterHtmlBytes: totalAfter, htmlRatio: ratio, round2HtmlRatio: round2Ratio,
  intentClusters: intentClusters.length, routeOrigins: routes.routeCount, menuItems, graphNodesMinimum: graphMin, graphNodesMaximum: graphMax,
  redirectRules: redirectCount, httpChecks: qa.http ? http.totalChecks : null, browserStatus: qa.browser ? "passed" : "pending", qa,
  lighthouseBefore: beforeLh?.categories, lighthouseRound1: round1Lh?.categories, lighthouseAfter: scores,
  lighthouseAfterContext: qa.lighthouse ? finalLhContext : null,
  targets: { localLighthouseMet: qa.lighthouse && finalLhContext === "yerel", liveLighthouseMet: liveTargetMet, gsc16MonthsAvailable: gs.contains16Months, gscAvailableHistoryReviewed: packageGsc && gsc.provenance?.allBytesAndHashesMatch === true },
  lighthouseLive: productionLhVerified ? productionLh.categories : null,
  lighthouseEvidence: qa.lighthouse ? lhFile : "Final ölçüm bekleniyor; eski/deneysel sonuç final sayılmadı.",
  gsc: { source: packageGsc ? "user_provided_export" : "real_local_export", sourceFile: gscSourceLabel, sha256: gs.sha256, start: gs.firstAvailableDate, end: gs.lastAvailableDate, days: gs.dailyRows, clicks: gm.propertyClicks, impressions: gm.propertyImpressions, joinedQueryPageRows: gs.containsJoinedQueryPageRows, joinedQueryPageRowCount: gsc.queryPage?.rows?.length || 0, containsDateQueryPageRows: gs.containsDateQueryPageRows === true, contains16Months: gs.contains16Months, independentlyAuthenticated: false, liveApiCalls: gsc.liveApi.callsMade }, pages,
};
fs.mkdirSync(".audit/round2", { recursive: true });
for (const file of [".audit/final-metrics.json", ".audit/round2/final-metrics.json"]) fs.writeFileSync(file, `${JSON.stringify(metrics, null, 2)}\n`);

// Compare tracked/staged deliverables with the baseline, including deletions.
// User-supplied untracked exports are inputs, not publication deliverables.
function evidence(start) {
  const listed = execFileSync("git", ["ls-files", "--cached", "-z"]).toString().split("\0").filter(Boolean);
  return [...new Set([...listed, ...Object.keys(start.files)])].filter((file) => !file.startsWith(".audit/") && !/(^|\/)\.env(?:\.|$)|\.(?:pem|key)$/i.test(file)).sort().flatMap((file) => {
    const before = start.files[file];
    if (!exists(file)) return before ? [{ file, before_bytes: before.bytes, after_bytes: 0, before_sha256: before.sha256, after_sha256: null, change: "deleted" }] : [];
    if (!fs.statSync(file).isFile()) return [];
    const bytes = fs.readFileSync(file), after = sha(bytes);
    return before?.sha256 === after ? [] : [{ file, before_bytes: before?.bytes || 0, after_bytes: bytes.length, before_sha256: before?.sha256 || null, after_sha256: after, change: before ? "changed" : "added" }];
  });
}
const sourceEvidence = evidence(baseline).filter(({ file }) => !reportNames.includes(file));
const round2Evidence = evidence(round2Baseline).filter(({ file }) => !reportNames.includes(file));
const proofTable = (rows) => "| Dosya | before_bytes | after_bytes | SHA-256 (son durum) |\n|---|---:|---:|---|\n" + rows.map((row) => `| ${row.file} | ${row.before_bytes} | ${row.after_bytes} | ${row.after_sha256 || "Silindi"} |`).join("\n");
const categoryNames = { performance: "Performans", accessibility: "Erişilebilirlik", "best-practices": "En iyi uygulamalar", seo: "SEO" };
const lhRows = Object.keys(categoryNames).map((key) => [categoryNames[key], beforeLh?.categories[key] ?? "—", round1Lh?.categories[key] ?? "—", scores?.[key] ?? "Final ölçüm bekleniyor"]);
const gscRows = [
  ["Günlük mülk toplamı", gm.propertyClicks, gm.propertyImpressions, gm.propertyCalculatedCtr, `Grafik A2:E${gs.dailyRows + 1}`],
  ["HTTPS ana sayfa", gm.home.clicks, gm.home.impressions, gm.home.exportedCtr, gm.home.range],
  ["Menü", gm.menu.clicks, gm.menu.impressions, gm.menu.exportedCtr, gm.menu.range],
  ["şile kahvaltı sorgusu", gm.sileKahvaltiQuery.clicks, gm.sileKahvaltiQuery.impressions, gm.sileKahvaltiQuery.exportedCtr, gm.sileKahvaltiQuery.range],
  ["şile serpme kahvaltı sorgusu", gm.serpmeQuery.clicks, gm.serpmeQuery.impressions, gm.serpmeQuery.exportedCtr, gm.serpmeQuery.range],
  ["şile gözleme sorgusu", gm.gozlemeQuery.clicks, gm.gozlemeQuery.impressions, gm.gozlemeQuery.exportedCtr, gm.gozlemeQuery.range],
];
const gscText = packageGsc
  ? `Kullanıcının sağladığı ${gscSourceLabel} paketi incelendi. Filtre “${gs.filterLabel}”, mevcut günlük veri ${gs.firstAvailableDate}–${gs.lastAvailableDate}, ${gs.dailyRows} gündür; 16 aylık dolu geçmiş değildir. ${gs.queryRows} sorgu, ${gs.pageRows} sayfa satırı ve ${gsc.queryPage.filterCount} sorgu filtresinden ${gsc.queryPage.rows.length} sorgu–URL eşleşmesi incelendi. Filtre operatörü dışa aktarımda açık değil; gün+sorgu+sayfa serisi yok. Kaynaklar değiştirilmedi; manifest ${format(gs.bytes)} byte, SHA-256 ${gs.sha256}. Hash uyumu paket bütünlüğünü gösterir; GSC oturumuna bağımsız erişim veya ekran aktarımının doğruluğunu tasdik etmez. Mobil ${gm.mobileClicks}/${gm.propertyClicks} tıklama (${pct(gm.mobileClickShare, 1)}). Veri 24 Ekim'de biter; 25 Ekim dağıtımının etkisini ölçmez. Konum bugünün Google sırası değildir; mülk/sayfa/sorgu toplamları aynı kapsam sayılmadı.`
  : `Gerçek yerel Can Evim dosyası ${path.basename(gs.path)} bulundu. Filtre etiketi “${gs.filterLabel}” olsa da günlük veri ${gs.firstAvailableDate}–${gs.lastAvailableDate}, ${gs.dailyRows} gündür. Dosya ${gs.queryRows} sorgu ve ${gs.pageRows} sayfa satırı içerir; 16 aylık veri veya bugünkü trafik değildir. Kaynak değiştirilmedi: ${format(gs.bytes)} byte; SHA-256 ${gs.sha256}. Mobil ${gm.mobileClicks}/${gm.propertyClicks} tıklama, ${pct(gm.mobileClickShare, 1)}. Ayrı sorgu ve sayfa sekmeleri ortak sorgu–sayfa satırı sağlamaz; bunlar hayali biçimde birleştirilmedi. Belirli sorgunun tıklaması bir URL'ye atanmadı, yamyamlık kanıtlandı denmedi. Tarihsel ortalama pozisyon ${gm.sileKahvaltiQuery.averagePosition} bugünün Google sırası değildir. Mülk, sayfa ve sorgu toplamları zorla eşitlenmedi.`;
const queryProof = packageGsc ? gsc.queryPage.rows.filter(row => ["şile kahvaltı", "şile kahvaltı mekanları"].includes(row.query) && ["/", "/menu", "/sile/sile-kahvalti-mekanlari"].includes(new URL(row.page).pathname)) : [];
const gscPeriodRows = packageGsc ? [
  ["Mülk toplamı", gsc.periods.previous, gsc.periods.current],
  ["Görünen markalı sorgular", gsc.brandBreakdown.brand.previous, gsc.brandBreakdown.brand.current],
  ["Görünen markasız sorgular", gsc.brandBreakdown.nonbrand.previous, gsc.brandBreakdown.nonbrand.current],
  ["Sorgu tablosunda temsil edilmeyen", gsc.brandBreakdown.unrepresented.previous, gsc.brandBreakdown.unrepresented.current],
] : [];
const gscInterpretation = packageGsc
  ? "İncelenen ana sorgularda eski rehberin ana sayfayı bastırdığı iddiası desteklenmiyor. Görünen markasız sorgular artarken toplam tıklama düşüyor; kayıp yalnız başlığa, sıralamaya veya tek bir sorgu grubuna bağlanmadı. Ayrı genel sorgu ve sayfa tabloları yapay biçimde birleştirilmedi."
  : "Desteklenen öncelikler: tarihsel ana sorgunun düşük TO'su için net ana sayfa/snippet, HTTP ve ürün URL'lerinin doğru hedefi ve mobil dönüşüm akışı. Ortak sorgu–sayfa verisi bulunmadığından çakışma kanıtlanmadı.";
const gscInspectionText = "GSC aktarımındaki 14/17 dizin durumu, üç tarihsel canonical farkı ve sitemap'te iki keşif iddiası bağımsız doğrulanmadı. Üç canonical kaydı URL dışında başka kayıtlarla tamamen aynı; sitemap görselinde satır görünmüyor. Canlı HTTP kontrolü 17/17 doğru canonical gösterir; bu Google indeks durumu değildir. Önce bu kayıtların yeni URL Denetimi kanıtı gerekir; buna dayanarak kod değiştirilmedi.";
const gscOperationsText = packageGsc
  ? `${gs.dailyRows} günlük kullanıcı paketi ve ${gsc.queryPage.rows.length} sorgu–URL eşleşmesi incelendi. Canlı GSC API çağrısı ${gsc.liveApi.callsMade}; sitemap gönderimi veya indeksleme isteği yapılmadı. ${gscInspectionText}`
  : `Gerçek yerel ${gs.dailyRows} günlük dosya incelendi; canlı API/16 aylık ortak sorgu–sayfa verisi yok. Kayıtlı izin reddi aşılmadı.`;
const gscExtraMarkdown = packageGsc ? `
### 28 günlük karşılaştırma

Önceki dönem ${gsc.periods.previous.start}–${gsc.periods.previous.end}; son dönem ${gsc.periods.current.start}–${gsc.periods.current.end}.

| Kapsam | Önceki tıklama | Son tıklama | Önceki gösterim | Son gösterim |
|---|---:|---:|---:|---:|
${gscPeriodRows.map(([label, prior, current]) => `| ${label} | ${prior.clicks} | ${current.clicks} | ${prior.impressions} | ${current.impressions} |`).join("\n")}

Marka ayrımı görünen sorgu metninden türetildi; eksik sorgular marka/markasız diye dağıtılmadı. Önceki yılın sıfırları güvenilir bir büyüme bazına çevrilmedi.

### Ana sorgu ve URL kanıtı

| Sorgu | URL | Tıklama | Gösterim |
|---|---|---:|---:|
${queryProof.map(row => `| ${row.query} | ${new URL(row.page).pathname} | ${row.clicks} | ${row.impressions} |`).join("\n")}

${gscInterpretation}

### GSC işlemlerinde açık kalanlar

${gscInspectionText}

İş sırası: üç kopya alanlı canonical kaydı ve üç bilinmiyor kaydını yeniden denetle; sitemap satırının gerçek keşif adedini görüntüle; ana sorgu için URL filtreli günlük grafikler al. Sonuçlar doğrulanmadan toplu canonical/yönlendirme değişikliği yapılmaz. Ayrıntılar .audit/gsc-review-2026-10-26/GSC-INCELEME.md ve EK-DOGRULAMA-PROMPTU.txt içindedir.
` : "";
const gscExtraHtml = packageGsc ? `<h3>28 günlük değişim</h3><p class="note">Önceki: ${escape(gsc.periods.previous.start)}–${escape(gsc.periods.previous.end)}. Son: ${escape(gsc.periods.current.start)}–${escape(gsc.periods.current.end)}.</p><div class="table-wrap"><table><thead><tr><th>Kapsam</th><th>Önceki tıklama</th><th>Son tıklama</th><th>Önceki gösterim</th><th>Son gösterim</th></tr></thead><tbody>${gscPeriodRows.map(([label, prior, current]) => `<tr><th>${escape(label)}</th><td>${prior.clicks}</td><td>${current.clicks}</td><td>${prior.impressions}</td><td>${current.impressions}</td></tr>`).join("")}</tbody></table></div><h3>Ana sorgu hangi URL'ye gitmiş?</h3><div class="table-wrap"><table><thead><tr><th>Sorgu</th><th>URL</th><th>Tıklama</th><th>Gösterim</th></tr></thead><tbody>${queryProof.map(row => `<tr data-gsc-query="${escape(row.query)}" data-gsc-page="${escape(new URL(row.page).pathname)}"><th>${escape(row.query)}</th><td>${escape(new URL(row.page).pathname)}</td><td>${row.clicks}</td><td>${row.impressions}</td></tr>`).join("")}</tbody></table></div><p>${escape(gscInterpretation)}</p><div class="notice" data-gsc-inspection-status="unverified"><p>${escape(gscInspectionText)}</p><p>Önce altı URL kaydı ve sitemap satırını yeni kanıtla doğrula. Sitemap gönderimi veya indeksleme isteği yapılmadı.</p></div>` : "";
const gscHtml = `<section id="gsc-evidence" data-gsc-source="${packageGsc ? "user-provided-export" : "legacy-local-export"}" data-gsc-query-page-rows="${gsc.queryPage?.rows?.length || 0}"><div class="wrap"><p class="eyebrow">${packageGsc ? "Kullanıcıdan gelen GSC dışa aktarımı" : "Gerçek eski dışa aktarım"} · ${gs.dailyRows} gün</p><h2>Mevcut verinin kapsamı açık.</h2><div class="notice"><p>${escape(gscText)}</p></div><div class="table-wrap"><table><thead><tr><th>Kapsam</th><th>Tıklama</th><th>Gösterim</th><th>TO</th></tr></thead><tbody>${gscRows.map(([label, clicks, impressions, ctr]) => `<tr><th>${label}</th><td>${format(clicks)}</td><td>${format(impressions)}</td><td>${pct(ctr)}</td></tr>`).join("")}</tbody></table></div>${gscExtraHtml}<p class="note">${packageGsc ? "Gün+sorgu+sayfa serisi yok; filtre operatörü bağımsız doğrulanmadı. Aktarım 25 Ekim sürümünün etkisini ölçmez." : "Ayrı sorgu/sayfa sekmeleri birleştirilmedi. Canlı 16 aylık veri alınmadı; eski pozisyon bugünün Google sırası değildir."} Mobil: ${gm.mobileClicks}/${gm.propertyClicks} tıklama, ${pct(gm.mobileClickShare, 1)}.</p></div></section>`;
const lhText = scores ? `Final ölçüm ${finalLhContext}: ${afterLh.finalUrl}. LCP ${(afterLh.metrics.largestContentfulPaint / 1000).toFixed(2)} sn; TBT ${Math.round(afterLh.metrics.totalBlockingTime)} ms; CLS ${afterLh.metrics.cumulativeLayoutShift.toFixed(4)}. 98–100 performans hedefi bu koşuda ${scores.performance >= 98 ? "sağlandı" : "sağlanmadı"}. İlk iki sütun yerel koşulardır; canlı final kullanıldığında sunucu ve sıkıştırma koşulları farklıdır. Kanıt: ${lhFile}.` : "İkinci turun final Lighthouse ölçümü bekleniyor. İlk tur ve deneysel koşular final başarı olarak gösterilmedi. 98–100 hedefinin sağlandığı henüz söylenmiyor.";
const sourceLinks = [["Can Evim menüsü", `${CANONICAL_ORIGIN}/menu`], ["Rokethane", "https://www.rokethane.com/"], ["Lotus restoran", "https://lotussile.com/restoran/"], ["Şile Kamp menü", "https://www.silekamp.com/menu"], ["Tripadvisor Şile", "https://www.tripadvisor.com.tr/Restaurants-g29015513-Sile.html"], ["Google Maps URL belgeleri", "https://developers.google.com/maps/documentation/urls/get-started"], ["Search Analytics API", "https://developers.google.com/webmaster-tools/v1/searchanalytics/query"], ["Vercel Git", "https://vercel.com/docs/git"]];
const departments = [
  ["Arama niyeti", "Genel kahvaltı ana sayfada; köy, mantı, mıhlama ve fiyat eski URL'leri ilgili yeni hedefte.", `${redirectCount} kalıcı 308 kuralı`],
  ["GSC verisinin incelenmesi", `${gs.dailyRows} günlük ${packageGsc ? "kullanıcı paketi" : "eski dosya"}: ${gm.propertyClicks} tıklama, ${format(gm.propertyImpressions)} gösterim.`, packageGsc ? `${gsc.queryPage.rows.length} sorgu–URL eşleşmesi; panel işlemleri ayrı` : "16 ay veya bugünkü trafik değil"],
  ["İçerik mimarisi", `${experienceRoutes.length} bağımsız makale; menü, aile, grup, bölgesel rota ve kapsam tabloları.`, "Her makale için en az 800 kelime kontrolü"],
  ["Yerel ulaşım", `${routes.routeCount} Google Haritalar başlangıcı ve doğru Üvezli varışı.`, "Sabit, doğrulanmamış km/dakika yok"],
  ["Arama görünümü", "Sayfaya özel title, description, canonical, Open Graph, Twitter ve #id rehberleri.", "Sıralama veya CTR garantisi yok"],
  ["Yapısal veri", `${menuItems} gerçek ürün, ${MENU_SECTIONS.length} menü bölümü; görünür içerikle aynı tek graf.`, `${graphMin}–${graphMax} üst seviye düğüm`],
  ["Masa planlayıcı", "Kişi sayısı, konsept ve tercihleri WhatsApp talebine dönüştürür; kullanıcı bütçesini çarpar.", "İşletme tarifesi veya kesin masa onayı değil"],
  ["Dönüşüm ve ölçüm", "Mobil eylem barı, hassas veriyi dışlayan izinli olay kuyruğu ve geri alma.", "Gerçek GA4 / DebugView doğrulaması ayrı"],
  ["Hız ve altyapı", "Statik içerik, duyarlı görseller, font/CSS iyileştirmeleri ve içerik hash'ine bağlı lastmod.", scores ? `Mobil performans ${round1Lh.categories.performance} → ${scores.performance}` : "Final Lighthouse ölçümü bekleniyor"],
  ["Kalite ve kanıt", "Build, özgün makale uzunluğu, schema, HTTP, tarayıcı, mobil ve dosya hash kayıtları.", qa.http ? `${http.totalChecks} HTTP kontrolü geçti` : "Yeni build final QA bekleniyor"],
];
const pageRows = pages.map((page) => `| ${page.path} | ${format(page.bytes)} | ${format(page.visibleWords)} | ${format(page.articleWords)} |`).join("\n");
const note = `# Can Evim — tüm operasyon kanıtları

${date} · Next.js 16.3.6 / React 19.2.4 · ${draft ? "TASLAK: final kanıtlar bekleniyor" : "Yerel QA tamamlandı; canlı hedef durumu aşağıdadır"}

${publishText}

## Üç ayrı başlangıç / sonuç sınırı

1. İlk başlangıç: **${metrics.beforeIndexablePages} sayfa, ${format(beforeHtml.totalIndexableBytes)} byte**. .audit/baseline.json ve baseline-html.json.
2. İkinci tur başlangıcı / ilk tur sonu: **${round1.afterIndexablePages} sayfa, ${format(round1.afterHtmlBytes)} byte**. .audit/round2/baseline.json ve before-final-metrics.json. Bu, ilk başlangıçla aynı veri değildir.
3. Güncel kapsam: **${CONTENT_ROUTES.length} kanonik URL, ${experienceRoutes.length} bağımsız makale**. Derlenmiş ${metrics.compiledPages}/${CONTENT_ROUTES.length} dosya; tam HTML toplamı ${format(totalAfter)} byte. İlk başlangıca oran ${ratio == null ? "bekleniyor" : ratio.toFixed(2) + " kat"}; ikinci tur başlangıcına oran ${round2Ratio == null ? "bekleniyor" : round2Ratio.toFixed(2) + " kat"}.

HTML toplamı yeni sayfaları içerir; tek sayfa veya sıkıştırılmış ağ transferi büyümesi değildir. Rapor/.audit/404/noindex arşiv toplamdan çıkarılır.

| Kanonik URL | Derlenmiş HTML byte | Görünür toplam kelime | Ana makale kelimesi |
|---|---:|---:|---:|
${pageRows}

${experienceRoutes.length} makalenin her birinde en az 800 kelime kontrolü ${qa.articles ? "geçti" : "final build üzerinde bekleniyor"}. Makale sayımı karşılaştırma/SSS dahil ana article alanıdır; ortak planlayıcı, tam menü ve alt bilgi hariçtir. Kaynak paragraf sayısı derlenmiş kelime sayısı yerine kullanılmaz.

## Mobil Lighthouse: ilk başlangıç / ilk tur / ikinci tur

| Kategori | İlk başlangıç | İlk tur sonu | İkinci tur final |
|---|---:|---:|---:|
${lhRows.map((row) => "| " + row.join(" | ") + " |").join("\n")}

${lhText} Mobil laboratuvar koşusu gerçek kullanıcı Core Web Vitals veya GSC sonucu değildir.

${productionText}

${productionTargetText}

## Gerçek GSC bulgusu

${gscText}

| Kapsam | Tıklama | Gösterim | TO | Kaynak |
|---|---:|---:|---:|---|
${gscRows.map(([label, clicks, impressions, ctr, source]) => `| ${label} | ${format(clicks)} | ${format(impressions)} | ${pct(ctr)} | ${source} |`).join("\n")}

${gscExtraMarkdown}

${packageGsc ? "Paket scripts/import-gsc-evidence.mjs ile kaynağı değiştirmeden doğrulanıp içeri alındı. Eski 19 günlük kayıt .audit/round2/gsc-evidence-2026-08-19.json olarak korundu." : gscInterpretation} Kanıt: .audit/round2/gsc-evidence.json. Kullanıcı dosyasının incelenmesi ile canlı GSC oturumuna erişim ayrı işlemlerdir. API çağrısı **${gsc.liveApi.callsMade}**; sitemap gönderimi veya indeksleme isteği yapılmadı.

## 10 çalışma alanı

${departments.map(([name, body, status], index) => `${index + 1}. **${name}:** ${body} ${status}.`).join("\n")}

app/growth-content.js ve expanded-experiences.js içerikleri; app/[experience]/page.js statik üretimi; GrowthContent.js karşılaştırma/bağlantı/görünür menüyü sağlar. Ana sayfa, home-content.js + ortak Header/MobileActions bileşenlerinden scripts/build-home.cjs ile derleme sırasında gerçek statik HTML üretilerek app/route.js üzerinden sunulur. Ana sayfada Next.js istemci framework isteği ve hidrasyonu yoktur; menü/rezervasyon public/home-ui.js ile çalışır. Detay sayfaları App Router kullanır; ana sayfaya dönüş yeni belge açar. Planlayıcı ve ana sayfa rota listesi IntersectionObserver ile yaklaşıldığında HTML/CSS olarak yüklenir; tam /ulasim içeriği sunucuda görünür. Üretilmiş HTML her build öncesi yeniden hazırlanır; Next scriptleri sonradan silinmez. Fiyat, tedarikçi, organik sertifika veya tesis özelliği doğrulanmadan eklenmez. ${menuItems} menü ürünü ve görünür SSS schema ile eşleşir. Sahte Offer, puan, 30 km hizmet alanı veya Wikidata yoktur. Düğüm sayısı sıralama/zengin sonuç garantisi değildir. Analitik dataLayer aktarımı Google alım kanıtı değildir; sıfır kayıp iddiası yoktur. Gerçek kimlik ve DebugView testi ayrıdır.

## Final QA

| Kontrol | Sonuç |
|---|---|
${Object.entries(qa).map(([name, passed]) => `| ${name} | ${passed ? "Geçti" : "Final kanıt bekleniyor"} |`).join("\n")}

HTTP: ${qa.http ? `${http.passed}/${http.totalChecks}` : "Yeni build sonucu bekleniyor"}. Tarayıcı: ${qa.browser ? "Tüm kanonikler kontrol edildi" : "Yeni tur sonucu bekleniyor"}. Kanıt zamanı build'den sonra olmalıdır. Eski başarılı koşu yeni final sonuç diye sunulmaz.

## ${intentClusters.length} arama / ziyaret eşlemesi

| Arayış | Hedef | Kapsam | Karşılaştırma notu |
|---|---|---|---|
${intentClusters.map((row) => "| " + row.join(" | ") + " |").join("\n")}

## Yayın kanıtı

${publishText} ${providerPublicationText}

## Yeniden üretme

- npm run build
- npm run test:seo
- node scripts/test-growth.mjs
- npm run test:content-dates
- node scripts/test-http.mjs (TEST_BASE_URL: production sunucusu)
- node scripts/test-browser.mjs (PLAYWRIGHT_MODULE / CHROME_PATH)
- node scripts/generate-growth-report.mjs --draft (açıkça bekleyen ölçümlü taslak)
- node scripts/generate-growth-report.mjs (taze final build / QA / Lighthouse zorunlu)
- node scripts/test-report.mjs (yerel sunum, içerik/hash ve mobil planlayıcı)
- node scripts/verify-deployment.mjs --sha <tam commit> --wait-seconds 300 (push sonrası read-only)
- node scripts/verify-deployment.mjs --sha <tam commit> --vercel-project <prj_ID> --vercel-deployment <dpl_ID> --vercel-scope <takım> (yetkili CLI ile salt okunur proje/alan adı doğrulaması)
- node scripts/gsc-audit.mjs --help
- node scripts/import-gsc-evidence.mjs --input gsc-canevim-2026-10-26 (salt okunur paket içe aktarımı)

## İlk başlangıca göre byte / SHA-256

Git modified durumuna bağlı değildir: tracked/staged teslim dosyaları ve baseline yolları SHA-256 ile karşılaştırılır. Yeni kaynak dosyaları rapor üretiminden önce stage edilir. Kullanıcının untracked GSC klasörü, ZIP'i ve paket hazırlama betiği yayın kapsamı değildir. Commit/push kanıtı silmez. Yeni dosya before_bytes=0, silinen after_bytes=0. Rapor kendi hash'ini içine alamadığı için iki raporun hash'i dış .audit/file-evidence.json ve round2/file-evidence.json dosyalarındadır. HTML hash'leri final-metrics.json, QA hash'leri artifact-evidence.json içindedir.

${proofTable(sourceEvidence)}

## İkinci tur başlangıcına göre farklar

Bu before değerleri ilk başlangıç değil .audit/round2/baseline.json değerleridir.

${proofTable(round2Evidence)}

## Kaynaklar

${sourceLinks.map(([label, url]) => `- [${label}](${url})`).join("\n")}
`;
fs.writeFileSync(reportNames[1], note);

const homepage = exists(compiledPagePath("/")) ? fs.readFileSync(compiledPagePath("/"), "utf8") : "";
const plannerSource = exists(".next/server/app/interactive/planner-breakfast.html") ? fs.readFileSync(".next/server/app/interactive/planner-breakfast.html", "utf8") : homepage;
const planner = plannerSource.match(/<section\b[^>]*class="[^"]*\bce-planner\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0] || "";
const plannerCss = fs.readFileSync("app/growth-interactive.css", "utf8"), plannerJs = fs.readFileSync("public/growth.js", "utf8").replace(/<\/script/gi, "<\\/script");
const routeHost = live ? CANONICAL_ORIGIN : "http://127.0.0.1:3100";
const routeCards = pages.map((page) => `<a data-canonical-path="${escape(page.path)}" href="${routeHost}${page.path}" target="_blank" rel="noopener noreferrer"><b>${escape(page.path === "/" ? "Ana sayfa" : page.path === "/menu" ? "Menü" : page.path === "/ulasim" ? "Ulaşım ve rota" : content.get(page.path.slice(1))?.label || page.path)}</b><code>${page.path}</code><small>${page.compiled ? `${format(page.bytes)} byte · ${format(page.visibleWords)} kelime` : "Final derleme bekleniyor"}</small></a>`).join("");
const badge = draft ? "TASLAK · FİNAL ÖLÇÜM BEKLENİYOR" : !live ? "YEREL QA TAMAM · YAYIN BEKLİYOR" : !productionLhVerified ? "YEREL QA TAMAM · CANLI ÖLÇÜM BEKLİYOR" : !liveTargetMet ? "YEREL QA TAMAM · CANLI 98 HEDEFİ AÇIK" : "FİNAL QA";
const css = `*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f6f2e9;color:#263c2c;font:16px/1.75 Arial,sans-serif}a{color:inherit}button,input{font:inherit}.wrap{max-width:1240px;margin:auto}header{padding:70px max(24px,6vw) 100px;background:#203728;color:#f8f3e5}.brand{font:42px Georgia,serif;letter-spacing:-2px}.eyebrow{font-size:11px;letter-spacing:2px;text-transform:uppercase}h1{font:clamp(40px,6vw,78px)/1.08 Georgia,serif;max-width:1040px;margin:38px 0 25px}h2{font:clamp(28px,4vw,46px)/1.2 Georgia,serif;margin:0 0 24px}h3{font:25px/1.25 Georgia,serif;margin:14px 0}header p{max-width:820px}.badge{display:inline-block;border:1px solid #9fb696;padding:6px 12px;font-size:11px;margin:12px 6px 0 0}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin:-42px auto 0;position:relative;background:#cad4be}.metrics>div{background:#e9edde;padding:26px;min-width:0}.metrics strong{display:block;font:38px Georgia,serif;overflow-wrap:anywhere}.metrics span{font-size:12px}main>section{padding:65px max(24px,6vw)}.soft{background:#e7ebdd}.note{font-size:13px;color:#4e6049}.department-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.department{padding:28px;border:1px solid #cbd5c0;background:#fffdf7;min-width:0}.department>span{font:14px Georgia,serif;color:#6c805f}.department p{font-size:14px}.department small{display:block;border-top:1px solid #d8dece;padding-top:14px;font-size:12px}.route-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.route-grid a{padding:20px;border:1px solid #bdccb2;background:#fffdf7;text-decoration:none;min-width:0}.route-grid b,.route-grid code,.route-grid small{display:block}.route-grid code{font-size:11px;overflow-wrap:anywhere;margin:10px 0}.route-grid small{font-size:11px}.table-wrap{max-width:100%;overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:15px;text-align:left;border-bottom:1px solid #c2ceb6}thead{background:#314d35;color:white}.notice{border-left:3px solid #a87939;background:#efe7d6;padding:22px;max-width:1100px;overflow-wrap:anywhere}.notice p{font-size:14px}.qa-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.qa-list>div{padding:18px;background:#fffdf7;border:1px solid #cad5bc;min-width:0}.qa-list b,.qa-list span{display:block}.qa-list span{font-size:12px}.proof{font-size:11px}.proof td{overflow-wrap:anywhere}.proof td:last-child{font-family:monospace;font-size:10px}.links{display:flex;flex-wrap:wrap;gap:14px 24px;font-size:12px}summary{cursor:pointer}code{font-size:12px}.footer{padding:35px max(24px,6vw);background:#203728;color:#f6f0df;font-size:12px}#demo{padding-inline:0}.ce-planner{max-width:1240px;margin:auto}#demo>.wrap{padding-inline:24px}@media(max-width:700px){header{padding-top:40px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr));margin-inline:20px}.metrics>div{padding:18px}.metrics strong{font-size:30px}.department-grid,.route-grid,.qa-list{grid-template-columns:1fr}main>section{padding-block:45px}.department{padding:22px}}@media print{#demo{display:none}.department{break-inside:avoid}main>section{padding:25px}.metrics{margin-top:0}}`;
const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Can Evim — Büyüme ve Mühendislik Raporu</title><style>${css}\n${plannerCss}</style></head><body><header><div class="wrap"><div class="brand">canevim</div><p class="eyebrow">${date} · İki tur uygulama ve kanıt</p><h1>Bir masa etrafında.<br>Daha fazla doğru başlangıç.</h1><p>Menü, deneyim ve ulaşımı ${CONTENT_ROUTES.length} kanonik adreste buluşturan yapı. ${experienceRoutes.length} bağımsız makale, gerçek menü, masa planlayıcı ve doğrulanabilir dosyalar.</p><span class="badge">${badge}</span><span class="badge">${live ? "CANLI YAYIN DOĞRULANDI" : "YAYIN DOĞRULAMASI AYRI"}</span></div></header><div class="wrap metrics"><div><strong>${metrics.beforeIndexablePages} → ${round1.afterIndexablePages} → ${CONTENT_ROUTES.length}</strong><span>ilk başlangıç / ilk tur / güncel kanonik kapsam</span></div><div><strong>${experienceRoutes.length}</strong><span>bağımsız deneyim / ürün makalesi</span></div><div><strong>${routes.routeCount}</strong><span>canlı rota başlangıcı</span></div><div><strong>${ratio == null ? "Bekleniyor" : ratio.toFixed(2) + "×"}</strong><span>tam HTML / ilk başlangıç</span></div></div><main>
<section><div class="wrap"><p class="eyebrow">İkinci tur kapsamı</p><h2>Her ziyaret ihtiyacının kendi sayfası var.</h2><p>İlk tur ${round1.afterIndexablePages} sayfaydı. Güncel ${CONTENT_ROUTES.length} adres; köy kahvaltısı, çocuklu aile, grup, bölgesel rota, fiyat kapsamı, mıhlama, mantı ve çay/tatlı ihtiyaçlarını ayrı içerikle anlatır. Ana sayfa deneyimleri birleştirir.</p><p class="note">Derlenmiş dosya ${metrics.compiledPages}/${CONTENT_ROUTES.length}; 800 kelime kontrolü ${qa.articles ? "geçti" : "final build üzerinde bekleniyor"}. Google sırası veya gerçekleşmiş rezervasyon artışı iddia edilmez.</p><div class="route-grid">${routeCards}</div></div></section>
<section class="soft"><div class="wrap"><p class="eyebrow">Üç ayrı ölçüm sınırı</p><h2>Başlangıçlar ve son ölçüm birbirine karışmıyor.</h2><div class="table-wrap"><table><thead><tr><th>Ölçüm</th><th>İlk başlangıç</th><th>İlk tur sonu</th><th>İkinci tur</th></tr></thead><tbody>${lhRows.map((row) => `<tr>${row.map((cell, index) => index ? `<td>${cell}</td>` : `<th>${cell}</th>`).join("")}</tr>`).join("")}<tr><th>Derlenmiş HTML</th><td>${format(beforeHtml.totalIndexableBytes)} byte / ${metrics.beforeIndexablePages} sayfa</td><td>${format(round1.afterHtmlBytes)} byte / ${round1.afterIndexablePages} sayfa</td><td>${format(totalAfter)} byte / ${CONTENT_ROUTES.length} sayfa</td></tr></tbody></table></div><p class="note">${escape(lhText)} Toplam HTML eklenen sayfaları içerir; gerçek ziyaretçi Core Web Vitals veya sıkıştırılmış ağ transferi değildir.</p><p class="note">${escape(productionText + " " + productionTargetText)}</p></div></section>
${gscHtml}
<section class="soft"><div class="wrap"><p class="eyebrow">10 çalışma alanı</p><h2>Dosyaya dönüşen iş.</h2><div class="department-grid">${departments.map(([name, body, status], index) => `<article class="department"><span>${String(index + 1).padStart(2, "0")}</span><h3>${name}</h3><p>${escape(body)}</p><small>${escape(status)}</small></article>`).join("")}</div></div></section>
<section id="demo"><div class="wrap"><p class="eyebrow">Yerel interaktif örnek</p><h2>Masanızı birlikte planlayın.</h2><p class="note">Mevcut derlemedeki araç seçimleri WhatsApp talebine dönüştürür. Göndermek size aittir; kesin rezervasyon veya fiyat onayı değildir.</p></div>${planner ? planner.replaceAll('href="/menu"', `href="${routeHost}/menu"`) : '<p class="wrap notice">Derlenmiş örnek final build sonrasında eklenir.</p>'}</section>
<section><div class="wrap"><p class="eyebrow">Final kanıt durumu</p><h2>Başarı ve bekleyen ölçüm ayrı yazıyor.</h2><div class="qa-list">${Object.entries(qa).map(([name, passed]) => `<div><b>${name}</b><span>${passed ? "Geçti" : "Final kanıt bekleniyor"}</span></div>`).join("")}</div><div class="notice"><p><strong>Yayın:</strong> ${escape(publishText)}</p><p><strong>GSC:</strong> ${escape(gscOperationsText)}</p><p><strong>Fiyat ve ölçüm:</strong> İşletme tarifesi veya gerçekleşmiş dönüşüm artışı uydurulmadı. Gerçek GA4/DebugView testi ayrı kanıttır.</p></div></div></section>
<section class="soft"><div class="wrap"><p class="eyebrow">Dosyanın izi</p><h2>Commit sonrasında da kalan byte ve hash kanıtı.</h2><p><a href="TUM-OPERASYON-KANITLARI.md">TUM-OPERASYON-KANITLARI.md</a> teknik ayrıntıları taşır. Hash karşılaştırması Git modified durumuna bağlı değildir; ilk ve ikinci tur farkları ayrıdır.</p><details><summary>İlk başlangıca göre kaynak dosyalarını açın</summary><div class="table-wrap"><table class="proof"><thead><tr><th>Dosya</th><th>before_bytes</th><th>after_bytes</th><th>SHA-256</th></tr></thead><tbody>${sourceEvidence.map((row) => `<tr><td>${escape(row.file)}</td><td>${row.before_bytes}</td><td>${row.after_bytes}</td><td>${row.after_sha256 || "Silindi"}</td></tr>`).join("")}</tbody></table></div></details><h3>Kaynaklar</h3><div class="links">${sourceLinks.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join("")}</div></div></section>
</main><footer class="footer"><div class="wrap">Can Evim Şile · ${date} · ${badge}</div></footer><script>${plannerJs}</script></body></html>`;
fs.writeFileSync(reportNames[0], html);
for (const [file, start] of [[".audit/file-evidence.json", baseline], [".audit/round2/file-evidence.json", round2Baseline]]) {
  const files = evidence(start);
  fs.writeFileSync(file, `${JSON.stringify({ capturedAt: new Date().toISOString(), baselineCapturedAt: start.capturedAt, scope: "Baseline-hash differences among tracked/staged deliverables; commit-independent. Untracked user inputs and QA/build artifacts are separate.", files }, null, 2)}\n`);
  if (file === ".audit/file-evidence.json") fs.writeFileSync(".audit/final-file-table.md", `${proofTable(files)}\n`);
}
const artifactFiles = fs.readdirSync(".audit", { recursive: true }).filter((name) => !name.endsWith("artifact-evidence.json") && fs.statSync(path.join(".audit", name)).isFile()).map((name) => { const bytes = fs.readFileSync(path.join(".audit", name)); return { file: `.audit/${name.replaceAll("\\", "/")}`, bytes: bytes.length, sha256: sha(bytes) }; });
fs.writeFileSync(".audit/artifact-evidence.json", `${JSON.stringify({ scope: "Local QA artifacts excluding this self-referential manifest", files: artifactFiles }, null, 2)}\n`);
console.log(JSON.stringify({ reports: reportNames, status: metrics.status, qa, canonicalPages: CONTENT_ROUTES.length, experienceArticles: experienceRoutes.length, htmlBytes: totalAfter, originalRatio: ratio, round2Ratio, lighthouse: scores, deploymentVerified: live }, null, 2));
