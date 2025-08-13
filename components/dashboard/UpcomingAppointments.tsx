import Link from 'next/link';

interface Appointment {
  id: string;
  clientName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceQuoteDetails: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  totalCount: number;
}

export function UpcomingAppointments({ appointments, totalCount }: UpcomingAppointmentsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Upcoming Appointments
        </h3>
        
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Share your link to get new clients!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Upcoming Appointments
        </h3>
        <Link
          href="/appointments"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {appointment.clientName}
                </p>
                <p className="text-sm text-gray-500">
                  {appointment.serviceQuoteDetails}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(appointment.appointmentDate)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(appointment.appointmentTime)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}