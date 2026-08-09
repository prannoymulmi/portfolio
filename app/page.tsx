import type { Metadata } from 'next';
import { Hero } from '@/components/Hero/Hero';

export const metadata: Metadata = {
  title: 'Prannoy Mulmi | Senior Software Engineer',
  description:
    'Senior software engineer portfolio showcasing cloud architecture, full-stack development, and technical leadership. 10+ years building scalable systems.',
  openGraph: {
    title: 'Prannoy Mulmi | Senior Software Engineer',
    description:
      'Senior software engineer portfolio showcasing cloud architecture, full-stack development, and technical leadership.',
    type: 'website',
    url: 'https://portfolio.prannoy-mulmi.com',
  },
};

export default function Home() {
  return <Hero />;
}
