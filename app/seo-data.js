export const BASE_URL = "https://www.canevimsile.com";

// Blog altyapısı korunuyor. Yeni içerikler yalnızca gerçek işletme deneyimi,
// özgün fotoğraf ve doğrulanabilir bilgiyle hazırlandığında buraya eklenecek.
export const blogPosts = [];
export const menuLandings = [];
export const intentLandings = [];

export function getBlogPost(slug) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getMenuLanding(slug) {
  return menuLandings.find((item) => item.slug === slug);
}

export function getIntentLanding(slug) {
  return intentLandings.find((item) => item.slug === slug);
}
