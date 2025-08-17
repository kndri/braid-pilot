import { QuoteToolRedesigned } from '@/components/quote/QuoteToolRedesigned';

export default async function QuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <QuoteToolRedesigned token={token} />;
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return {
    title: 'Get Your Braiding Quote | BraidPilot',
    description: 'Get an instant, accurate quote for your next braiding style. Choose your style, size, length, and hair type to see your price.',
    openGraph: {
      title: 'Get Your Braiding Quote',
      description: 'Instant pricing for braiding styles',
      type: 'website',
    },
  };
}