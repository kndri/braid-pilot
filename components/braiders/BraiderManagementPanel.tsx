'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { User, Calendar, Clock, Percent, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import { AddBraiderModal } from './AddBraiderModal';

interface BraiderManagementPanelProps {
  salonId: Id<"salons">;
  selectedDate?: string;
}

export const BraiderManagementPanel = ({ salonId, selectedDate }: BraiderManagementPanelProps) => {
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [selectedBraiderId, setSelectedBraiderId] = useState<Id<"braiders"> | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all braiders for the salon
  const braiders = useQuery(api.braiders.getBySalonId, { salonId });
  
  // Get available braiders for current date/time
  const availableBraiders = useQuery(api.braiderAssignment.getAvailableBraiders, {
    salonId,
    date,
    time: "09:00",
    serviceStyle: "Box Braids",
    duration: 240,
  });

  // Get selected braider's schedule
  const braiderSchedule = useQuery(
    api.braiderAssignment.getBraiderSchedule, 
    selectedBraiderId ? {
      braiderId: selectedBraiderId,
      startDate: date,
      endDate: date,
    } : 'skip'
  );

  const updateAvailability = useMutation(api.braiderAssignment.updateBraiderAvailability);

  const handleAvailabilityUpdate = async (
    braiderId: Id<"braiders">,
    isAvailable: boolean,
    startTime?: string,
    endTime?: string
  ) => {
    try {
      await updateAvailability({
        braiderId,
        date,
        isAvailable,
        startTime,
        endTime,
        reason: isAvailable ? undefined : "Time off",
      });
      alert('Availability updated successfully');
    } catch (error) {
      alert('Failed to update availability');
    }
  };


  const getWorkloadColor = (hours: number) => {
    if (hours >= 8) return 'text-red-600';
    if (hours >= 6) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Filter braiders based on search
  const filteredBraiders = braiders?.filter(braider => {
    return braider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           braider.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-md  p-6">
      <div className="border-b pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-purple-600" />
              Braider Management
            </h2>
            <p className="text-gray-600 mt-1">Manage your team and their availability</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Braider
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search braiders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Date Selection */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Braiders List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">
            Your Team ({filteredBraiders?.length || 0} braiders)
          </h3>
          {braiders && braiders.length > 0 && (
            <p className="text-sm text-gray-500">
              Click on a card to view schedule
            </p>
          )}
        </div>
        
        {filteredBraiders && filteredBraiders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBraiders.map((braider) => {
              const availability = availableBraiders?.find(a => a._id === braider._id);
              
              return (
                <div
                  key={braider._id}
                  className="border border-gray-100 rounded-md p-5 hover: transition-all cursor-pointer bg-white group"
                  onClick={() => {
                    setSelectedBraiderId(braider._id);
                    setShowSchedule(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-lg">{braider.name}</h4>
                      <p className="text-sm text-gray-600">{braider.email}</p>
                    </div>
                    {braider.splitPercentage !== undefined && (
                      <div className="bg-purple-50 px-3 py-1 rounded-md">
                        <div className="flex items-center gap-1">
                          <Percent className="w-3 h-3 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-700">
                            {braider.splitPercentage}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        braider.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {braider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {availability && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Availability:</span>
                          <span className={`font-medium ${
                            availability.isQualified ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {availability.isQualified ? 'Available' : 'Not Qualified'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Workload:</span>
                          <span className={`font-medium ${
                            getWorkloadColor(availability.workloadHours)
                          }`}>
                            {availability.workloadHours} hours
                          </span>
                        </div>
                      </>
                    )}

                    {braider.specialties && braider.specialties.length > 0 && (
                      <div>
                        <span className="text-gray-600">Specialties:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {braider.specialties.slice(0, 3).map((specialty, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {specialty}
                            </span>
                          ))}
                          {braider.specialties.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                              +{braider.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAvailabilityUpdate(braider._id, true);
                      }}
                      className="flex-1 text-sm px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-50 transition-colors font-medium"
                    >
                      Available
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAvailabilityUpdate(braider._id, false, "09:00", "18:00");
                      }}
                      className="flex-1 text-sm px-3 py-2 bg-gray-50 text-gray-500 rounded-md hover:bg-gray-50 transition-colors font-medium"
                    >
                      Time Off
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-md">
            {braiders && braiders.length === 0 ? (
              <>
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Braiders Yet</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Add your first braider to start managing appointments and tracking capacity
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Braider
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Try adjusting your search or filters to find braiders
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Braider Schedule Modal */}
      {showSchedule && braiderSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Braider Schedule</h3>
                <p className="text-gray-600">{braiderSchedule.braider.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowSchedule(false);
                  setSelectedBraiderId(null);
                }}
                className="text-gray-500 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Working Hours:</span>
                  <p className="font-medium">
                    {braiderSchedule.braider.defaultStartTime} - {braiderSchedule.braider.defaultEndTime}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Skill Level:</span>
                  <p className="font-medium">Standard</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Bookings:</span>
                  <p className="font-medium">{braiderSchedule.stats.totalBookings}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Hours:</span>
                  <p className="font-medium">{braiderSchedule.stats.totalHours.toFixed(1)} hrs</p>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Appointments for {new Date(date).toLocaleDateString()}
              </h4>
              
              {braiderSchedule.bookings.length > 0 ? (
                <div className="space-y-2">
                  {braiderSchedule.bookings.map((booking) => (
                    <div key={booking._id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{booking.clientName}</p>
                          <p className="text-sm text-gray-600">
                            {booking.serviceDetails.style} - {booking.serviceDetails.size}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.appointmentTime} - Duration: {booking.serviceDurationMinutes || 240} min
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                          booking.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                          'bg-gray-50 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.clientPhone && (
                        <p className="text-xs text-gray-500 mt-1">📱 {booking.clientPhone}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-md">
                  <p className="text-gray-600">No appointments scheduled</p>
                </div>
              )}
            </div>

            {/* Availability Exceptions */}
            {braiderSchedule.exceptions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Availability Exceptions
                </h4>
                <div className="space-y-1">
                  {braiderSchedule.exceptions.map((exception: any, idx: number) => (
                    <div key={idx} className="text-sm bg-yellow-50 p-2 rounded">
                      {exception.startTime} - {exception.endTime}: 
                      {exception.isAvailable ? ' Available' : ' Unavailable'} 
                      {exception.reason && ` (${exception.reason})`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Braider Modal */}
      <AddBraiderModal
        salonId={salonId}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          // Braiders list will auto-refresh due to Convex reactivity
        }}
      />
    </div>
  );
};