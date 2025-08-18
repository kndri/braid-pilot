'use client'

import { useState } from 'react'
import { Link2, Copy, CheckCircle, ExternalLink, Phone, Star } from 'lucide-react'
import { FEATURE_FLAGS } from '@/lib/featureFlags'

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
    <div className="bg-white p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Your Tools</h3>
      
      {/* Price My Style Section */}
      {quoteToolUrl && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-gray-900">Price My Style</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
            <code className="text-xs font-mono text-gray-600 break-all">
              {quoteToolUrl}
            </code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
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
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View My Tool
            </a>
          </div>
        </div>
      )}

      {/* Virtual Receptionist Status - Only show if feature is enabled */}
      {FEATURE_FLAGS.VIRTUAL_RECEPTIONIST && (
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
            <button className="w-full bg-purple-600 text-white rounded-lg py-1.5 px-4 text-sm font-medium hover:bg-purple-700 transition-colors">
              Enable Virtual Receptionist
            </button>
          )}
        </div>
      )}

      {/* Automate Reviews Status - Only show if feature is enabled */}
      {FEATURE_FLAGS.REPUTATION_MANAGEMENT && (
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
            <button className="w-full bg-purple-600 text-white rounded-lg py-1.5 px-4 text-sm font-medium hover:bg-purple-700 transition-colors">
              Automate Reviews
            </button>
          )}
        </div>
      )}

      {/* Booking Pro CTA if not enabled */}
      {!bookingProEnabled && (
        <div className="border-t pt-4 mt-4">
          <button className="w-full bg-green-600 text-white rounded-lg py-2 px-4 font-medium hover:bg-green-700 transition-colors">
            Upgrade to Booking Pro
          </button>
        </div>
      )}
    </div>
  )
}