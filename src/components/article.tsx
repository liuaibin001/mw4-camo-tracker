import { ArrowRight, ExternalLink } from 'lucide-react'
import { Breadcrumbs } from './layout'
import { JsonLd } from './json-ld'
import { SITE_URL } from '@/lib/site'
import { DATA_DATE } from '@/data/catalog'
export function Article({
  title,
  description,
  path,
  kicker = 'FIELD GUIDE',
  toc,
  children,
}: {
  title: string
  description: string
  path: string
  kicker?: string
  toc: { id: string; label: string }[]
  children: React.ReactNode
}) {
  return (
    <div className="page-container article-page">
      <Breadcrumbs
        items={[
          { label: kicker === 'FIELD GUIDE' ? 'Field guide' : 'CamoField' },
          { label: title },
        ]}
      />
      <header className="article-hero">
        <span className="eyebrow">{kicker} / MODERN WARFARE 4</span>
        <h1>{title}</h1>
        <p className="article-lead">{description}</p>
        <div className="article-meta">
          <span>By CamoField editorial</span>
          <span>Reviewed {DATA_DATE}</span>
          <a href="/sources">
            Sources & confidence policy <ExternalLink size={10} className="inline" />
          </a>
        </div>
      </header>
      <div className="article-layout">
        <div className="article-content">
          {children}
          <div className="article-cta">
            <h3>Put the plan into progress.</h3>
            <p>
              Find your weapon, check the challenge and record your unlocks. No account needed to
              start.
            </p>
            <a href="/" className="primary-link">
              Open the MW4 camo tracker <ArrowRight size={14} />
            </a>
          </div>
        </div>
        <nav className="article-toc" aria-label="On this page">
          <span>IN THIS BRIEFING</span>
          {toc.map((item) => (
            <a href={`#${item.id}`} key={item.id}>
              {item.label}
            </a>
          ))}
          <a href="/" className="primary-link">
            Open tracker <ArrowRight size={12} />
          </a>
        </nav>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description,
          url: SITE_URL + path,
          dateModified: DATA_DATE,
          author: {
            '@type': 'Organization',
            name: 'CamoField editorial',
            url: SITE_URL + '/about',
          },
          publisher: { '@type': 'Organization', name: 'CamoField', url: SITE_URL },
          mainEntityOfPage: SITE_URL + path,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'MW4 Camo Tracker', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: title, item: SITE_URL + path },
          ],
        }}
      />
    </div>
  )
}
