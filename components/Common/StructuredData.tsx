const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio.prannoy-mulmi.com';

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Prannoy Mulmi',
  url: SITE_URL,
  jobTitle: 'Senior Software Engineer',
  sameAs: ['https://linkedin.com/in/prannoy-mulmi', 'https://github.com/prannoymulmi'],
  knowsAbout: [
    'Cloud Architecture',
    'Backend Development',
    'DevOps',
    'Full-Stack Development',
    'Technical Leadership',
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
    />
  );
}
