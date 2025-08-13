import { QuoteTool } from '@/components/quote/QuoteTool';

export default function QuotePage({ params }: { params: { token: string } }) {
  return <QuoteTool token={params.token} />;
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { token: string } }) {
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