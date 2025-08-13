'use client';

import { useState } from 'react';

interface PriceMyStyleCardProps {
  quoteToolUrl: string;
}

export function PriceMyStyleCard({ quoteToolUrl }: PriceMyStyleCardProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(quoteToolUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  
  const openTool = () => {
    window.open(quoteToolUrl, '_blank');
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Price My Style Tool
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Quote Tool URL
          </label>
          <div className="flex">
            <input
              type="text"
              value={quoteToolUrl}
              readOnly
              className="flex-1 rounded-l-md border border-gray-300 bg-gray-50 text-sm px-3 py-2 focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
        
        <button
          onClick={openTool}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          View My Tool
        </button>
      </div>
    </div>
  );
}