'use client';

import { useState } from 'react';

interface PriceMyStyleCardProps {
  quoteToolUrl: string;
}

export function PriceMyStyleCard({ quoteToolUrl }: PriceMyStyleCardProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    if (!quoteToolUrl) return;
    try {
      await navigator.clipboard.writeText(quoteToolUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  
  const openTool = () => {
    if (!quoteToolUrl) return;
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
              value={quoteToolUrl || 'Generating URL...'}
              readOnly
              className="text-black flex-1 rounded-l-md border border-gray-300 bg-gray-50 text-sm px-3 py-2 focus:outline-none"
              placeholder="URL will appear here"
            />
            <button
              onClick={copyToClipboard}
              disabled={!quoteToolUrl}
              className={`px-4 py-2 rounded-r-md transition-colors text-sm font-medium ${
                quoteToolUrl 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
        
        <button
          onClick={openTool}
          disabled={!quoteToolUrl}
          className={`w-full px-4 py-2 rounded-md transition-colors font-medium ${
            quoteToolUrl
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          View My Tool
        </button>
      </div>
    </div>
  );
}