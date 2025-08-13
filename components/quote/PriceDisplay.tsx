interface PriceDisplayProps {
  price: number | null;
  isVisible: boolean;
  isCalculating?: boolean;
}

export function PriceDisplay({ price, isVisible, isCalculating = false }: PriceDisplayProps) {
  if (!isVisible) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="animate-fadeIn mt-8 p-6 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-200">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-2">Your Quote</p>
        {isCalculating ? (
          <div className="h-12 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : price !== null ? (
          <>
            <p className="text-4xl font-bold text-gray-900">
              {formatCurrency(price)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              * Final price may vary based on consultation
            </p>
          </>
        ) : (
          <p className="text-gray-500">Unable to calculate price</p>
        )}
      </div>
    </div>
  );
}