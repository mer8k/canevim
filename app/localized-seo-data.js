import { getIntentLanding, getMenuLanding, intentLandings, menuLandings } from './seo-data';

export const locales = ['en'];
export const localizedSources = [
  ...intentLandings.map((item) => ({ ...item, type: 'sile', sourcePath: `/sile/${item.slug}` })),
  ...menuLandings.map((item) => ({ ...item, type: 'lezzetler', sourcePath: `/lezzetler/${item.slug}` })),
];

const titles = {
  en: {
    'sile-kahvalti': 'Breakfast in Şile',
    'sile-kahvalti-mekanlari': 'Breakfast Places in Şile', 'uvezli-kahvalti': 'Breakfast in Üvezli', 'sile-dogada-kahvalti': 'Breakfast in Nature in Şile', 'sile-restoran': 'Restaurant in Şile', 'sile-serpme-kahvalti-menusu': 'Şile Turkish Breakfast Menu', 'sile-yolu-kahvalti': 'Breakfast on Şile Road',
    'sile-serpme-kahvalti': 'Turkish Breakfast in Şile', 'sile-koy-kahvaltisi': 'Village Breakfast in Şile', 'sile-gozleme': 'Gözleme in Şile', 'sile-ev-yapimi-manti': 'Homemade Manti in Şile', 'sile-izgara-sac-kavurma': 'Grill and Sac Kavurma in Şile', 'sile-aile-restorani': 'Family Restaurant in Şile', 'sile-yolu-kahvalti-restoran': 'Breakfast Restaurant on Şile Road',
  },
  ar: {
    'sile-kahvalti-mekanlari': 'أماكن الإفطار في شيلا', 'uvezli-kahvalti': 'إفطار في أوزفيزلي', 'sile-dogada-kahvalti': 'إفطار في الطبيعة في شيلا', 'sile-restoran': 'مطعم في شيلا', 'sile-serpme-kahvalti-menusu': 'قائمة الإفطار التركي في شيلا', 'sile-yolu-kahvalti': 'إفطار على طريق شيلا',
    'sile-serpme-kahvalti': 'إفطار تركي في شيلا', 'sile-koy-kahvaltisi': 'إفطار قروي في شيلا', 'sile-gozleme': 'غوزلمة في شيلا', 'sile-ev-yapimi-manti': 'مانتي منزلي في شيلا', 'sile-izgara-sac-kavurma': 'مشاوي وساج قاورما في شيلا', 'sile-aile-restorani': 'مطعم عائلي في شيلا', 'sile-yolu-kahvalti-restoran': 'مطعم إفطار على طريق شيلا',
  },
  fa: {
    'sile-kahvalti-mekanlari': 'مکان‌های صبحانه در شیله', 'uvezli-kahvalti': 'صبحانه در اوزوزلی', 'sile-dogada-kahvalti': 'صبحانه در طبیعت شیله', 'sile-restoran': 'رستوران در شیله', 'sile-serpme-kahvalti-menusu': 'منوی صبحانه ترکی در شیله', 'sile-yolu-kahvalti': 'صبحانه در جاده شیله',
    'sile-serpme-kahvalti': 'صبحانه ترکی در شیله', 'sile-koy-kahvaltisi': 'صبحانه روستایی در شیله', 'sile-gozleme': 'گوزلمه در شیله', 'sile-ev-yapimi-manti': 'مانتی خانگی در شیله', 'sile-izgara-sac-kavurma': 'غذاهای گریل و ساچ کاورما در شیله', 'sile-aile-restorani': 'رستوران خانوادگی در شیله', 'sile-yolu-kahvalti-restoran': 'رستوران صبحانه در جاده شیله',
  },
};

export const languageCopy = {
  en: { eyebrow: 'Can Evim · Üvezli · Şile', intro: (title) => `Discover ${title} at Can Evim in Üvezli, surrounded by nature on Şile Road.`, detailTitle: 'A peaceful table in nature', detail: 'Can Evim serves Turkish breakfast, gözleme, homemade manti, grilled dishes and sac kavurma every day between 08:00 and 23:00.', menu: 'View current menu', reserve: 'Reservation', route: 'Directions', related: 'Other languages' },
  ar: { eyebrow: 'Can Evim · أوزفيزلي · شيلا', intro: (title) => `اكتشف ${title} في Can Evim وسط الطبيعة في أوزفيزلي على طريق شيلا.`, detailTitle: 'مائدة هادئة وسط الطبيعة', detail: 'يقدم Can Evim الإفطار التركي والغوزلمة والمانتي المنزلي والمشاوي وساج قاورما يومياً من الساعة 08:00 حتى 23:00.', menu: 'عرض القائمة الحالية', reserve: 'الحجز', route: 'الاتجاهات', related: 'لغات أخرى' },
  fa: { eyebrow: 'Can Evim · اوزوزلی · شیله', intro: (title) => `${title} را در Can Evim، در طبیعت اوزوزلی و جاده شیله تجربه کنید.`, detailTitle: 'سفره‌ای آرام در دل طبیعت', detail: 'Can Evim هر روز از ساعت 08:00 تا 23:00 صبحانه ترکی، گوزلمه، مانتی خانگی، غذاهای گریل و ساچ کاورما سرو می‌کند.', menu: 'مشاهده منوی فعلی', reserve: 'رزرو', route: 'مسیریابی', related: 'زبان‌های دیگر' },
};

export function getLocalizedPage(lang, type, slug) {
  if (!locales.includes(lang)) return null;
  const source = type === 'sile' ? getIntentLanding(slug) : type === 'lezzetler' ? getMenuLanding(slug) : null;
  if (!source || !titles[lang]?.[slug]) return null;
  return { ...source, type, lang, localizedTitle: titles[lang][slug], copy: languageCopy[lang] };
}
