'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { 
  X, User, Calendar, Clock, DollarSign, Phone, Mail,
  CheckCircle, AlertCircle, TrendingUp, CreditCard, FileText
} from 'lucide-react'

interface BraiderDetailModalProps {
  braiderId: Id<'braiders'>
  isOpen: boolean
  onClose: () => void
}

export function BraiderDetailModal({ braiderId, isOpen, onClose }: BraiderDetailModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week')
  const [selectedTransactions, setSelectedTransactions] = useState<Id<'transactions'>[]>([])
  const [payoutMethod, setPayoutMethod] = useState<string>('cash')
  const [isProcessingPayout, setIsProcessingPayout] = useState(false)

  // Fetch braider details
  const braider = useQuery(api.braiders.getBraiderById, { braiderId })
  
  // Fetch earnings summary
  const earningsSummary = useQuery(api.braiderPayouts.getBraiderEarningsSummary, {
    braiderId,
    period: selectedPeriod
  })

  // Fetch detailed payouts
  const payouts = useQuery(api.braiderPayouts.getBraiderPayouts, {
    braiderId,
    status: undefined // Get all statuses
  })

  // Mutations
  const updatePayoutStatus = useMutation(api.braiderPayouts.updatePayoutStatus)
  const processBulkPayout = useMutation(api.braiderPayouts.processBulkPayout)

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTransactions([])
      setPayoutMethod('cash')
    }
  }, [isOpen])

  if (!isOpen || !braider || !earningsSummary || !payouts) return null

  const handleMarkAsPaid = async (transactionId: Id<'transactions'>) => {
    try {
      await updatePayoutStatus({
        transactionId,
        newStatus: 'paid',
        payoutMethod
      })
      alert('Payment marked as complete')
    } catch (error) {
      console.error('Failed to update payout status:', error)
      alert('Failed to update payment status')
    }
  }

  const handleBulkPayout = async () => {
    if (selectedTransactions.length === 0) {
      alert('Please select transactions to process')
      return
    }

    setIsProcessingPayout(true)
    try {
      const result = await processBulkPayout({
        braiderId,
        transactionIds: selectedTransactions,
        payoutMethod
      })
      alert(result.message)
      setSelectedTransactions([])
    } catch (error) {
      console.error('Failed to process bulk payout:', error)
      alert('Failed to process payouts')
    } finally {
      setIsProcessingPayout(false)
    }
  }

  const toggleTransactionSelection = (transactionId: Id<'transactions'>) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const selectAllPending = () => {
    const pendingTransactions = payouts.transactions
      .filter(t => !t.payoutStatus || t.payoutStatus === 'pending')
      .map(t => t._id)
    setSelectedTransactions(pendingTransactions)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>
      default:
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Pending Payout</span>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const selectedTotal = selectedTransactions.reduce((sum, transactionId) => {
    const transaction = payouts.transactions.find(t => t._id === transactionId)
    return sum + (transaction?.braiderPayout || 0)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{braider.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {braider.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {braider.email}
                  </span>
                )}
                {braider.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {braider.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Earnings Summary */}
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Summary</h3>
              <div className="flex gap-2">
                {(['day', 'week', 'month'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Earned</span>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${earningsSummary.totalEarnings.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Paid</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${earningsSummary.totalPaid.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pending</span>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  ${earningsSummary.totalPending.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Bookings</span>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {earningsSummary.bookingCount}
                </p>
              </div>
            </div>
          </div>

          {/* Payout Actions */}
          {payouts.summary.totalPending > 0 && (
            <div className="p-6 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Process Payouts</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTransactions.length > 0 
                      ? `${selectedTransactions.length} transactions selected ($${selectedTotal.toFixed(2)})`
                      : 'Select transactions to process payment'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="venmo">Venmo</option>
                    <option value="cashapp">CashApp</option>
                    <option value="zelle">Zelle</option>
                  </select>
                  <button
                    onClick={selectAllPending}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Select All Pending
                  </button>
                  <button
                    onClick={handleBulkPayout}
                    disabled={selectedTransactions.length === 0 || isProcessingPayout}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Process Selected Payouts
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
            
            {payouts.transactions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className={`border rounded-lg p-4 ${
                      selectedTransactions.includes(transaction._id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {(!transaction.payoutStatus || transaction.payoutStatus === 'pending') && (
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction._id)}
                            onChange={() => toggleTransactionSelection(transaction._id)}
                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-gray-900">
                              Transaction #{transaction._id.slice(-6)}
                            </p>
                            {getStatusBadge(transaction.payoutStatus)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{formatDate(new Date(transaction._creationTime).toISOString())}</span>
                            <span>Status: {transaction.status}</span>
                          </div>
                          {transaction.payoutDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Paid on {new Date(transaction.payoutDate).toLocaleDateString()} via {transaction.payoutMethod}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${(transaction.braiderPayout || 0).toFixed(2)}
                        </p>
                        {(!transaction.payoutStatus || transaction.payoutStatus === 'pending') && (
                          <button
                            onClick={() => handleMarkAsPaid(transaction._id)}
                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}