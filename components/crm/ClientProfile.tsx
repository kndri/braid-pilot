'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { format } from 'date-fns';
import { useUser } from '@clerk/nextjs';

interface ClientProfileProps {
  clientId: Id<"clients">;
  salonId: Id<"salons">;
  onClose: () => void;
}

export function ClientProfile({ clientId, salonId, onClose }: ClientProfileProps) {
  const { user } = useUser();
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const profile = useQuery(api.crm.getClientProfile, { clientId, salonId });
  const updateClientNotes = useMutation(api.crm.updateClientNotes);
  const updateClientTags = useMutation(api.crm.updateClientTags);
  const viewer = useQuery(api.users.viewer);
  
  const handleAddNote = async () => {
    if (!newNote.trim() || !viewer) return;
    
    setIsAddingNote(true);
    try {
      await updateClientNotes({
        clientId,
        salonId,
        note: newNote,
        userId: viewer._id,
      });
      setNewNote('');
    } catch (error) {
      // Error handling - note addition failed
    } finally {
      setIsAddingNote(false);
    }
  };
  
  const handleToggleTag = async (tag: string) => {
    if (!profile) return;
    
    const currentTags = profile.client.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    try {
      await updateClientTags({
        clientId,
        tags: newTags,
      });
    } catch (error) {
      // Error handling - tag update failed
    }
  };
  
  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-md max-w-4xl w-full p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-24 bg-gray-100 rounded"></div>
              <div className="h-32 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };
  
  const availableTags = ['VIP', 'Regular', 'New', 'Loyal', 'High-Value'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-md max-w-4xl w-full my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Client Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Client Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.client.name}</h3>
              <p className="text-sm text-gray-500">{profile.client.email}</p>
              <p className="text-sm text-gray-500">{profile.client.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(profile.stats.lifetimeValue)}
              </p>
              <p className="text-sm text-gray-500">Lifetime Value</p>
            </div>
          </div>
          
          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  profile.client.tags?.includes(tag)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-lg font-semibold">{profile.stats.totalBookings}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-lg font-semibold">{profile.stats.completedBookings}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-lg font-semibold">{profile.stats.cancelledBookings}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Spend</p>
            <p className="text-lg font-semibold">{formatCurrency(profile.stats.averageSpend)}</p>
          </div>
        </div>
        
        {/* Preferred Styles */}
        {profile.stats.preferredStyles.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Preferred Styles</h4>
            <div className="flex flex-wrap gap-2">
              {profile.stats.preferredStyles.map((style, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-sm"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="px-6 py-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking History */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Booking History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {profile.bookings.length === 0 ? (
                <p className="text-sm text-gray-500">No bookings yet</p>
              ) : (
                profile.bookings.map((booking) => (
                  <div key={booking._id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.serviceDetails.style}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(booking.appointmentDate), 'MMM d, yyyy')} at {booking.appointmentTime}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.serviceDetails.size} • {booking.serviceDetails.length}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(booking.serviceDetails.finalPrice)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Notes</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {profile.notes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes yet</p>
              ) : (
                profile.notes.map((note) => (
                  <div key={note._id} className="p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm text-gray-800">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isAddingNote}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isAddingNote}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}