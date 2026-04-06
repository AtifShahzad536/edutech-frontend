import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  twitterCard?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = 'EduTech Platform',
  twitterCard = 'summary_large_image',
  noindex = false,
  nofollow = false,
}) => {
  const router = useRouter();
  const currentUrl = url || `https://edutech.com${router.asPath}`;

  const defaultTitle = 'EduTech Platform - Learn Without Limits';
  const defaultDescription = 'Discover and enroll in online courses from expert instructors. Learn programming, design, business, and more at EduTech Platform.';
  const defaultImage = 'https://edutech.com/images/og-image.jpg';
  const defaultKeywords = 'online courses, elearning, education, programming, design, business, tutorials, video courses';

  const finalTitle = title ? `${title} | EduTech Platform` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalKeywords = keywords || defaultKeywords;

  const robots = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={finalTitle} />
      <meta name="twitter:site" content="@edutech" />
      <meta name="twitter:creator" content="@edutech" />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="EduTech Platform" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />

      {/* Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'EduTech Platform',
            url: 'https://edutech.com',
            logo: 'https://edutech.com/images/logo.png',
            description: finalDescription,
            sameAs: [
              'https://twitter.com/edutech',
              'https://facebook.com/edutech',
              'https://linkedin.com/company/edutech',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+1-234-567-8900',
              contactType: 'customer service',
              availableLanguage: ['English'],
            },
          }),
        }}
      />

      {/* Structured Data - Website */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'EduTech Platform',
            url: 'https://edutech.com',
            description: finalDescription,
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://edutech.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  );
};

export default SEOHead;
