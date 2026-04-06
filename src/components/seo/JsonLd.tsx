import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Course structured data
export const CourseJsonLd: React.FC<{
  course: {
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
  };
}> = ({ course }) => {
  const courseData = {
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

  return <JsonLd data={courseData} />;
};

// Breadcrumb structured data
export const BreadcrumbJsonLd: React.FC<{
  breadcrumbs: Array<{
    name: string;
    url: string;
  }>;
}> = ({ breadcrumbs }) => {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };

  return <JsonLd data={breadcrumbData} />;
};

// Review structured data
export const ReviewJsonLd: React.FC<{
  review: {
    author: string;
    datePublished: string;
    reviewRating: {
      ratingValue: string;
      bestRating: string;
    };
    reviewBody: string;
  };
  itemReviewed: {
    name: string;
    image: string;
  };
}> = ({ review, itemReviewed }) => {
  const reviewData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.datePublished,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.reviewRating.ratingValue,
      bestRating: review.reviewRating.bestRating,
    },
    reviewBody: review.reviewBody,
    itemReviewed: {
      '@type': 'Thing',
      name: itemReviewed.name,
      image: itemReviewed.image,
    },
  };

  return <JsonLd data={reviewData} />;
};

// FAQ structured data
export const FAQJsonLd: React.FC<{
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}> = ({ faqs }) => {
  const faqData = {
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

  return <JsonLd data={faqData} />;
};

// Video structured data
export const VideoJsonLd: React.FC<{
  video: {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate: string;
    duration: string;
    contentUrl?: string;
    embedUrl?: string;
  };
}> = ({ video }) => {
  const videoData = {
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

  return <JsonLd data={videoData} />;
};

// Person structured data (for instructors)
export const PersonJsonLd: React.FC<{
  person: {
    name: string;
    jobTitle: string;
    description: string;
    image: string;
    url: string;
    sameAs?: string[];
  };
}> = ({ person }) => {
  const personData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.jobTitle,
    description: person.description,
    image: person.image,
    url: person.url,
    ...(person.sameAs && { sameAs: person.sameAs }),
  };

  return <JsonLd data={personData} />;
};

export default JsonLd;
