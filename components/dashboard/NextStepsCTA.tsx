import Link from 'next/link';

export function NextStepsCTA() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 mt-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Ready to grow?
        </h3>
        <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
          Automatically accept payments and manage your schedule with Booking Pro. 
          Take your business to the next level with our premium features.
        </p>
        <Link
          href="/upgrade"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50 transition-colors"
        >
          Upgrade to Booking Pro
        </Link>
      </div>
    </div>
  );
}