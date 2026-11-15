export const SITE_URL = 'https://mw4-camo-tracker.otoo.workers.dev'
export const SITE_NAME = 'CamoField'
export function seo(title: string, description: string, path: string) {
  const fullTitle = title.includes('CamoField') ? title : `${title} | CamoField`
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: SITE_URL + path },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: SITE_URL + '/og.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: SITE_URL + path }],
  }
}
