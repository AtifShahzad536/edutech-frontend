// SEO utility functions

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const generateMetaDescription = (content: string, maxLength: number = 160): string => {
  // Remove HTML tags and extra whitespace
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  // Truncate to max length
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Find the last complete sentence before the cutoff
  const truncated = plainText.substring(0, maxLength - 3);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
};

export const generateKeywords = (title: string, content: string, category?: string): string => {
  const words = [
    ...title.toLowerCase().split(' '),
    ...content.toLowerCase().split(' '),
  ];
  
  // Remove common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'now', 'also', 'here', 'there', 'then', 'again',
  ]);
  
  // Filter and count word occurrences
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    const cleanWord = word.replace(/[^a-z0-9]/g, '');
    if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
    }
  });
  
  // Sort by frequency and take top keywords
  const keywords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  // Add category if provided
  if (category) {
    keywords.unshift(category.toLowerCase());
  }
  
  return keywords.join(', ');
};

export const generateStructuredData = (type: string, data: Record<string, any>) => {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
  
  return JSON.stringify(baseStructuredData);
};

export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
};

export const generateCourseSchema = (course: {
  name: string;
  description: string;
  image: string;
  provider: string;
  offers: {
    price: string;
    priceCurrency: string;
    availability: string;
  };
  educationalLevel: string;
  inLanguage: string;
  aggregateRating?: {
    ratingValue: string;
    reviewCount: string;
  };
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    image: course.image,
    provider: {
      '@type': 'Organization',
      name: course.provider,
    },
    offers: {
      '@type': 'Offer',
      price: course.offers.price,
      priceCurrency: course.offers.priceCurrency,
      availability: course.offers.availability,
      validFrom: new Date().toISOString(),
    },
    educationalLevel: course.educationalLevel,
    inLanguage: course.inLanguage,
    ...(course.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: course.aggregateRating.ratingValue,
        reviewCount: course.aggregateRating.reviewCount,
      },
    }),
  };
};

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EduTech Platform',
    url: 'https://edutech.com',
    logo: 'https://edutech.com/images/logo.png',
    description: 'Discover and enroll in online courses from expert instructors. Learn programming, design, business, and more.',
    sameAs: [
      'https://twitter.com/edutech',
      'https://facebook.com/edutech',
      'https://linkedin.com/company/edutech',
      'https://instagram.com/edutech',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-234-567-8900',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Education Street',
      addressLocality: 'Learning City',
      addressRegion: 'CA',
      postalCode: '94102',
      addressCountry: 'US',
    },
  };
};

export const generateWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EduTech Platform',
    url: 'https://edutech.com',
    description: 'Discover and enroll in online courses from expert instructors. Learn programming, design, business, and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://edutech.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
};

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

export const generateVideoSchema = (video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl?: string;
  embedUrl?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    ...(video.contentUrl && { contentUrl: video.contentUrl }),
    ...(video.embedUrl && { embedUrl: video.embedUrl }),
  };
};

export const generatePersonSchema = (person: {
  name: string;
  jobTitle: string;
  description: string;
  image: string;
  url: string;
  sameAs?: string[];
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.jobTitle,
    description: person.description,
    image: person.image,
    url: person.url,
    ...(person.sameAs && { sameAs: person.sameAs }),
  };
};

// Open Graph utilities
export const generateOpenGraphTags = (data: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  siteName?: string;
}) => {
  return {
    'og:title': data.title,
    'og:description': data.description,
    'og:image': data.image,
    'og:url': data.url,
    'og:type': data.type || 'website',
    'og:site_name': data.siteName || 'EduTech Platform',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': data.title,
  };
};

// Twitter Card utilities
export const generateTwitterCardTags = (data: {
  title: string;
  description: string;
  image: string;
  card?: string;
  site?: string;
  creator?: string;
}) => {
  return {
    'twitter:card': data.card || 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.image,
    'twitter:image:alt': data.title,
    'twitter:site': data.site || '@edutech',
    'twitter:creator': data.creator || '@edutech',
  };
};
