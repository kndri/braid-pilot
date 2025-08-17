'use client';

// import { useQuery } from 'convex/react';
// import { api } from '@/convex/_generated/api';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  cost?: string;
  status?: string;
  subtitle?: string;
}

function MetricCard({ title, value, change, cost, status, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
        {status && (
          <span className={`text-sm font-medium ${status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
            {status}
          </span>
        )}
      </div>
      {cost && <p className="text-xs text-gray-500 mt-1">Cost: {cost}</p>}
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function PlatformMessagingDashboard() {
  // TODO: Implement getUsageReport API endpoint
  // const usageReport = useQuery(api.reputation.getUsageReport, {});
  
  // Mock data for now
  const usageReport = {
    totalEmails: 0,
    totalSMS: 1250,
    platformMargin: 98.9,
    platformRevenue: 9900,
    totalCost: 9.38, // 1250 SMS * $0.0075
    salonsActive: 100,
    topSalons: [
      {
        salonName: 'Sample Salon 1',
        tier: 'professional',
        emailsSent: 0,
        smsSent: 150,
        cost: 1.13,
      },
      {
        salonName: 'Sample Salon 2',
        tier: 'unlimited',
        emailsSent: 0,
        smsSent: 320,
        cost: 2.40,
      },
    ],
  };
  
  if (!usageReport) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Messaging Overview</h1>
      
      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Emails (Month)"
          value={usageReport.totalEmails.toLocaleString()}
          change="+12%"
          cost={`$${(usageReport.totalEmails * 0.001).toFixed(2)}`}
        />
        <MetricCard
          title="Total SMS (Month)"
          value={usageReport.totalSMS.toLocaleString()}
          change="+8%"
          cost={`$${(usageReport.totalSMS * 0.0075).toFixed(2)}`}
        />
        <MetricCard
          title="Delivery Rate"
          value="98.5%"
          status="healthy"
        />
        <MetricCard
          title="Platform Margin"
          value={`${usageReport.platformMargin.toFixed(1)}%`}
          subtitle={`Revenue: $${usageReport.platformRevenue.toLocaleString()}`}
        />
      </div>
      
      {/* Per-Salon Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Top Usage by Salon</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salon
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emails
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMS
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageReport.topSalons.map((salon, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {salon.salonName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      salon.tier === 'unlimited' ? 'bg-purple-100 text-purple-800' :
                      salon.tier === 'professional' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {salon.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {salon.emailsSent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {salon.smsSent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${salon.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    $99
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {((99 - salon.cost) / 99 * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Alerts */}
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <h3 className="font-semibold text-yellow-800">Attention Required</h3>
        <ul className="mt-2 text-sm text-yellow-700">
          <li>• 3 salons approaching monthly limits</li>
          <li>• SendGrid API rate limit: 67% used</li>
          <li>• 2 failed SMS deliveries to investigate</li>
        </ul>
      </div>
      
      {/* Cost Analysis */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">SendGrid (Pro Plan)</span>
              <span className="font-medium">$89.95/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Twilio Phone Number</span>
              <span className="font-medium">$1.00/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Variable Messaging</span>
              <span className="font-medium">${usageReport.totalCost.toFixed(2)}/mo</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total Platform Cost</span>
              <span>${(90.95 + usageReport.totalCost).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Salons</span>
              <span className="font-medium">{usageReport.salonsActive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Subscription</span>
              <span className="font-medium">$99/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-medium">${usageReport.platformRevenue.toLocaleString()}/mo</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold text-green-600">
              <span>Gross Margin</span>
              <span>{usageReport.platformMargin.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}