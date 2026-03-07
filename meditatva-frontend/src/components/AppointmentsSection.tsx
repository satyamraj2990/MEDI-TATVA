import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Calendar, Clock, Video, MapPin, User, Phone, 
  Plus, CheckCircle, XCircle, AlertCircle, Star,
  Stethoscope, Award, IndianRupee, Navigation,
  Search, Filter
} from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  mode: "online" | "offline";
  status: "upcoming" | "completed" | "cancelled";
  location?: string;
  avatar: string;
}

interface Doctor {
  id: string;
  name: string;
  photo: string;
  specialization: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  hospital: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  availableTiming: string;
  nextAvailable: string;
}

// Mock doctor data
const availableDoctors: Doctor[] = [
  {
    id: "D001",
    name: "Dr. Rajesh Kumar",
    photo: "👨‍⚕️",
    specialization: "Cardiologist",
    experience: 15,
    rating: 4.8,
    reviewCount: 342,
    consultationFee: 800,
    hospital: "Apollo Hospital",
    city: "Chandigarh",
    address: "Sector 8B, Industrial Area, Phase I",
    latitude: 30.7046,
    longitude: 76.7179,
    distance: 2.4,
    availableTiming: "9:00 AM - 5:00 PM",
    nextAvailable: "Today, 3:00 PM"
  },
  {
    id: "D002",
    name: "Dr. Priya Sharma",
    photo: "👩‍⚕️",
    specialization: "Dermatologist",
    experience: 12,
    rating: 4.9,
    reviewCount: 456,
    consultationFee: 600,
    hospital: "Max Super Specialty Hospital",
    city: "Mohali",
    address: "Phase 6, Sector 59",
    latitude: 30.7046,
    longitude: 76.6934,
    distance: 3.8,
    availableTiming: "10:00 AM - 6:00 PM",
    nextAvailable: "Tomorrow, 11:00 AM"
  },
  {
    id: "D003",
    name: "Dr. Amit Verma",
    photo: "👨‍⚕️",
    specialization: "General Physician",
    experience: 20,
    rating: 4.7,
    reviewCount: 789,
    consultationFee: 500,
    hospital: "Fortis Hospital",
    city: "Delhi",
    address: "Sector 62, Noida Link Road",
    latitude: 28.6139,
    longitude: 77.2090,
    distance: 5.2,
    availableTiming: "8:00 AM - 8:00 PM",
    nextAvailable: "Today, 5:30 PM"
  },
  {
    id: "D004",
    name: "Dr. Sneha Patel",
    photo: "👩‍⚕️",
    specialization: "Pediatrician",
    experience: 10,
    rating: 4.9,
    reviewCount: 523,
    consultationFee: 700,
    hospital: "Medanta - The Medicity",
    city: "Gurgaon",
    address: "Sector 38, Golf Course Road",
    latitude: 28.4595,
    longitude: 77.0266,
    distance: 4.1,
    availableTiming: "9:00 AM - 4:00 PM",
    nextAvailable: "Today, 2:00 PM"
  },
  {
    id: "D005",
    name: "Dr. Vikram Singh",
    photo: "👨‍⚕️",
    specialization: "Orthopedic",
    experience: 18,
    rating: 4.6,
    reviewCount: 612,
    consultationFee: 900,
    hospital: "AIIMS Delhi",
    city: "Delhi",
    address: "Ansari Nagar East, Aurobindo Marg",
    latitude: 28.5672,
    longitude: 77.2100,
    distance: 6.7,
    availableTiming: "10:00 AM - 3:00 PM",
    nextAvailable: "Tomorrow, 10:30 AM"
  },
  {
    id: "D006",
    name: "Dr. Kavita Mehta",
    photo: "👩‍⚕️",
    specialization: "Neurologist",
    experience: 14,
    rating: 4.8,
    reviewCount: 445,
    consultationFee: 1000,
    hospital: "Jaypee Hospital",
    city: "Noida",
    address: "Sector 128, Expressway",
    latitude: 28.5355,
    longitude: 77.3910,
    distance: 8.3,
    availableTiming: "11:00 AM - 5:00 PM",
    nextAvailable: "Today, 4:30 PM"
  },
  {
    id: "D007",
    name: "Dr. Arjun Reddy",
    photo: "👨‍⚕️",
    specialization: "ENT Specialist",
    experience: 9,
    rating: 4.7,
    reviewCount: 328,
    consultationFee: 550,
    hospital: "Columbia Asia Hospital",
    city: "Panchkula",
    address: "MDC Sector 5, Near IT Park",
    latitude: 30.6942,
    longitude: 76.8517,
    distance: 1.9,
    availableTiming: "9:00 AM - 6:00 PM",
    nextAvailable: "Today, 6:00 PM"
  },
  {
    id: "D008",
    name: "Dr. Meera Iyer",
    photo: "👩‍⚕️",
    specialization: "Psychiatrist",
    experience: 11,
    rating: 4.9,
    reviewCount: 267,
    consultationFee: 1200,
    hospital: "Nimhans Bangalore",
    city: "Bangalore",
    address: "Hosur Road, Adugodi",
    latitude: 12.9716,
    longitude: 77.5946,
    distance: 12.5,
    availableTiming: "2:00 PM - 8:00 PM",
    nextAvailable: "Tomorrow, 3:00 PM"
  },
  {
    id: "D009",
    name: "Dr. Sanjay Joshi",
    photo: "👨‍⚕️",
    specialization: "Dentist",
    experience: 13,
    rating: 4.8,
    reviewCount: 534,
    consultationFee: 400,
    hospital: "Clove Dental",
    city: "Ludhiana",
    address: "Ferozepur Road, Model Town",
    latitude: 30.9010,
    longitude: 75.8573,
    distance: 7.8,
    availableTiming: "10:00 AM - 7:00 PM",
    nextAvailable: "Today, 7:30 PM"
  },
  {
    id: "D010",
    name: "Dr. Ananya Desai",
    photo: "👩‍⚕️",
    specialization: "Gastroenterologist",
    experience: 16,
    rating: 4.7,
    reviewCount: 398,
    consultationFee: 850,
    hospital: "Lilavati Hospital",
    city: "Mumbai",
    address: "Bandra Reclamation, Bandra West",
    latitude: 19.0596,
    longitude: 72.8295,
    distance: 15.2,
    availableTiming: "9:00 AM - 4:00 PM",
    nextAvailable: "Tomorrow, 11:30 AM"
  }
];

export const AppointmentsSection = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      doctor: "Dr. Sarah Wilson",
      specialty: "Cardiologist",
      date: "2024-11-15",
      time: "10:00 AM",
      mode: "online",
      status: "upcoming",
      avatar: "👩‍⚕️"
    },
    {
      id: "2",
      doctor: "Dr. Michael Chen",
      specialty: "General Physician",
      date: "2024-11-20",
      time: "2:30 PM",
      mode: "offline",
      status: "upcoming",
      location: "MediTatva Clinic, Downtown",
      avatar: "👨‍⚕️"
    },
    {
      id: "3",
      doctor: "Dr. Emily Brown",
      specialty: "Dermatologist",
      date: "2024-11-02",
      time: "11:00 AM",
      mode: "online",
      status: "completed",
      avatar: "👩‍⚕️"
    },
  ]);

  const [showBooking, setShowBooking] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "completed" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming": return <AlertCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "completed": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    selectedTab === "all" ? true : apt.status === selectedTab
  );

  const filteredDoctors = availableDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status: "cancelled" as const } : apt)
    );
    toast.success("Appointment cancelled");
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  const handleViewLocation = (doctor: Doctor) => {
    const mapsUrl = `https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}`;
    window.open(mapsUrl, '_blank');
    toast.success(`Opening location for ${doctor.hospital}`);
  };

  return (
    <div className="space-y-8">
      {/* Find Doctors Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-7 h-7 text-cyan-500" />
              Find Doctors
            </h2>
            <p className="text-gray-700 dark:text-gray-400 text-sm mt-1">
              Book appointments with top specialists near you
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by doctor name, specialty, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-6 text-base bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
          />
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:shadow-xl hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1">
                  {/* Doctor Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-white/10 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl flex-shrink-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                        {doctor.photo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          {doctor.name}
                        </h3>
                        <p className="text-cyan-600 dark:text-cyan-400 text-sm font-medium">
                          {doctor.specialization}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {doctor.rating}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            ({doctor.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="p-6 space-y-4">
                    {/* Hospital & Location */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {doctor.hospital}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {doctor.city} • {doctor.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Navigation className="w-3 h-3 text-orange-500" />
                        <span>{doctor.distance} km away</span>
                      </div>
                    </div>

                    {/* Experience & Fee */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-cyan-500" />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Experience</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {doctor.experience} years
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Consultation</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ₹{doctor.consultationFee}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Available</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400 truncate">
                          {doctor.nextAvailable}
                        </p>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{doctor.availableTiming}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex gap-2">
                    <Button
                      onClick={() => handleBookAppointment(doctor)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg shadow-cyan-500/25"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button
                      onClick={() => handleViewLocation(doctor)}
                      variant="outline"
                      className="border-cyan-500/30 hover:bg-cyan-500/10"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No doctors found matching your search
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-white/10 my-8" />

      {/* My Appointments Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h2>
            <p className="text-gray-700 dark:text-gray-400 text-sm mt-1">
              Manage your scheduled consultations
            </p>
          </div>
        </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {["upcoming", "completed", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as typeof selectedTab)}
            className={`px-4 py-2 capitalize transition-all ${
              selectedTab === tab
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAppointments.map((apt) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
            >
              <Card className="p-5 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{apt.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900 dark:text-white font-semibold">{apt.doctor}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(apt.status)} border`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(apt.status)}
                            {apt.status}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-gray-700 dark:text-gray-400 text-sm mb-3">{apt.specialty}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-300">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          {new Date(apt.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-300">
                          <Clock className="w-4 h-4 text-purple-400" />
                          {apt.time}
                        </div>
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-300">
                          {apt.mode === "online" ? (
                            <Video className="w-4 h-4 text-green-400" />
                          ) : (
                            <MapPin className="w-4 h-4 text-orange-400" />
                          )}
                          {apt.mode === "online" ? "Video Consultation" : apt.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {apt.status === "upcoming" && (
                      <>
                        {apt.mode === "online" && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            onClick={() => toast.success("Joining video call...")}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Call
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {apt.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => toast.success("Viewing prescription...")}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-400">No {selectedTab} appointments</p>
          </div>
        )}
      </div>
      </div>

      {/* Book Appointment Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="bg-white dark:bg-[#1a1f2e] border-gray-200 dark:border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {selectedDoctor ? `Book with ${selectedDoctor.name}` : 'Book New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDoctor && (
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{selectedDoctor.photo}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedDoctor.name}</p>
                    <p className="text-sm text-cyan-600 dark:text-cyan-400">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Consultation Fee:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">₹{selectedDoctor.consultationFee}</span>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">Consultation Mode</label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-gray-300 dark:border-white/20">
                  <Video className="w-4 h-4 mr-2" />
                  Online
                </Button>
                <Button variant="outline" className="flex-1 border-gray-300 dark:border-white/20">
                  <MapPin className="w-4 h-4 mr-2" />
                  Offline
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">Preferred Date</label>
              <Input type="date" className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">Preferred Time</label>
              <Input type="time" className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">Patient Name</label>
              <Input placeholder="Enter patient name" className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-400 mb-1 block">Phone Number</label>
              <Input placeholder="+91 XXXXX XXXXX" className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10" />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              onClick={() => {
                toast.success(`Appointment booked with ${selectedDoctor?.name || 'doctor'}!`);
                setShowBooking(false);
                setSelectedDoctor(null);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
