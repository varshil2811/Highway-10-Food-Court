import { Helmet } from 'react-helmet-async'
import site from '../data/site.json'

type Props = {
  title: string
  description: string
  path?: string
}

export default function Seo({ title, description, path = '/' }: Props) {
  const fullTitle = `${title} | Highway 10 Food Court`
  const url = `https://highway10.in${path}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: site.name,
    description,
    telephone: site.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'SP 11, Plot 11–12, SH-25, Lalpur–Rajkot Bypass, Khimliya',
      addressLocality: 'Jamnagar',
      addressRegion: 'Gujarat',
      postalCode: '361120',
      addressCountry: 'IN',
    },
    url,
    servesCuisine: ['Indian', 'Multi-cuisine'],
    priceRange: '₹₹',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '01:00',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: site.rating,
      reviewCount: site.reviewCount,
    },
    sameAs: [site.instagram, site.facebook],
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}
