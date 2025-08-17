'use client'

import { useState } from 'react'
import { Link2, Copy, CheckCircle, ExternalLink, Phone, Star } from 'lucide-react'

interface YourToolsProps {
  quoteToolUrl?: string
  virtualReceptionistEnabled?: boolean
  automateReviewsEnabled?: boolean
  bookingProEnabled?: boolean
}

export function YourTools({
  quoteToolUrl,
  virtualReceptionistEnabled = false,
  automateReviewsEnabled = false,
  bookingProEnabled = false
}: YourToolsProps) {
  const [copiedUrl, setCopiedUrl] = useState(false)

  const copyToClipboard = () => {
    if (quoteToolUrl) {
      navigator.clipboard.writeText(quoteToolUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Your Tools</h3>
      
      {/* Price My Style Section */}
      {quoteToolUrl && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-5 w-5 text-indigo-600" />
            <h4 className="font-medium text-gray-900">Price My Style</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <code className="text-xs font-mono text-gray-600 break-all">
              {quoteToolUrl}
            </code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              {copiedUrl ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
            <a
              href={quoteToolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View My Tool
            </a>
          </div>
        </div>
      )}

      {/* Virtual Receptionist Status */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Virtual Receptionist</h4>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            virtualReceptionistEnabled 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {virtualReceptionistEnabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        {!virtualReceptionistEnabled && (
          <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity">
            Enable Virtual Receptionist
          </button>
        )}
      </div>

      {/* Automate Reviews Status */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Automate Reviews</h4>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            automateReviewsEnabled 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {automateReviewsEnabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        {!automateReviewsEnabled && (
          <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:opacity-90 transition-opacity">
            Automate Reviews
          </button>
        )}
      </div>

      {/* Booking Pro CTA if not enabled */}
      {!bookingProEnabled && (
        <div className="border-t pt-4 mt-4">
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg py-3 px-4 font-medium hover:opacity-90 transition-opacity">
            Upgrade to Booking Pro
          </button>
        </div>
      )}
    </div>
  )
}