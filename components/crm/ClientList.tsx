'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface ClientListProps {
  salonId: Id<"salons">;
  onSelectClient: (clientId: Id<"clients">) => void;
}

export function ClientList({ salonId, onSelectClient }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'spend' | 'visits'>('spend');
  
  const clients = useQuery(api.crm.getAllClients, { 
    salonId,
    searchQuery: searchQuery || undefined,
  });
  
  if (!clients) {
    return (
      <div className="bg-white rounded-md  border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const sortedClients = [...clients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'spend':
        return b.totalSpend - a.totalSpend;
      case 'visits':
        return b.bookingCount - a.bookingCount;
      default:
        return 0;
    }
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'VIP':
        return 'bg-purple-50 text-purple-700';
      case 'Regular':
        return 'bg-blue-50 text-blue-700';
      case 'New':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };
  
  return (
    <div className="bg-white rounded-md  border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <svg 
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="spend">Sort by Spend</option>
              <option value="visits">Sort by Visits</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spend
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Visit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            ) : (
              sortedClients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(client.totalSpend)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.bookingCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {client.lastVisit 
                        ? new Date(client.lastVisit).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTagColor(client.tag)}`}>
                      {client.tag}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => onSelectClient(client._id)}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {sortedClients.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {sortedClients.length} client{sortedClients.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}