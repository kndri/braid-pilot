interface MetricsCardsProps {
  metrics: {
    totalRevenue: number;
    totalFees: number;
    upcomingAppointmentsCount: number;
    totalClients?: number;
    completedBookings?: number;
    monthlyGrowth?: number;
  };
  isBookingProEnabled?: boolean;
  isCrmEnabled?: boolean;
}

export function MetricsCards({ metrics, isBookingProEnabled = true, isCrmEnabled = true }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };
  
  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: (metrics.monthlyGrowth && metrics.monthlyGrowth !== 0) ? {
        value: metrics.monthlyGrowth,
        isPositive: metrics.monthlyGrowth > 0
      } : null,
      enabled: isBookingProEnabled,
    },
    {
      title: 'Total Clients',
      value: metrics.totalClients?.toString() || '0',
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      subtitle: 'Unique clients served',
      enabled: isCrmEnabled,
    },
    {
      title: 'Upcoming',
      value: (metrics.upcomingAppointmentsCount || 0).toString(),
      icon: (
        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      subtitle: 'Appointments scheduled',
      enabled: isBookingProEnabled,
    },
    {
      title: 'Completed',
      value: metrics.completedBookings?.toString() || '0',
      icon: (
        <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subtitle: 'Bookings this month',
      enabled: isBookingProEnabled,
    },
  ];
  
  const enabledCards = cards.filter(card => card.enabled);
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${enabledCards.length} gap-6 mb-8`}>
      {enabledCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-700 mt-1">{card.subtitle}</p>
              )}
              {card.trend && (
                <div className="flex items-center mt-2">
                  <svg 
                    className={`w-4 h-4 mr-1 ${card.trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    {card.trend.isPositive ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    )}
                  </svg>
                  <span className={`text-sm font-medium ${card.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(card.trend.value)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
      
      {!isBookingProEnabled && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-orange-900">Unlock Revenue Tracking</h3>
              <p className="text-sm text-orange-700 mt-1">Upgrade to Booking Pro to track revenue and bookings</p>
            </div>
            <svg className="h-12 w-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      )}
      
      {!isCrmEnabled && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Client Insights</h3>
              <p className="text-sm text-purple-700 mt-1">Upgrade to CRM to track client relationships</p>
            </div>
            <svg className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}