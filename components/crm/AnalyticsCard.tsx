'use client';

import { ReactNode } from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function AnalyticsCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  trend,
  className = ''
}: AnalyticsCardProps) {
  return (
    <div className={`bg-white rounded-md  border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <svg 
                className={`w-4 h-4 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {trend.isPositive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                )}
              </svg>
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-orange-50 rounded-md flex items-center justify-center text-orange-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}