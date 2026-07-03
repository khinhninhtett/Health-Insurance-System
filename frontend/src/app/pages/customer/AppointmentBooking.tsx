import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { Calendar, Clock, Hospital, CheckCircle, FileText } from "lucide-react";
import { hospitals } from "../../data/mockData";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

interface BookingForm {
  hospitalId: string;
  date: string;
  time: string;
  notes: string;
}

const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"];

export default function AppointmentBooking() {
  const [confirmed, setConfirmed] = useState<BookingForm & { hospital: string; confirmationCode: string } | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingForm>();

  const selectedHospitalId = watch("hospitalId");
  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId);

  const onSubmit = async (data: BookingForm) => {
    if (!selectedTime) { toast.error("Please select a time slot"); return; }
    await new Promise((r) => setTimeout(r, 800));
    setConfirmed({
      ...data,
      time: selectedTime,
      hospital: selectedHospital?.name || "",
      confirmationCode: `APT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    });
    toast.success("Appointment booked successfully!");
  };

  if (confirmed) {
    return (
      <div className="space-y-6">
        <PageHeader title="Appointment Booking" subtitle="Your appointment confirmation" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <GlassCard className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-gray-900 dark:text-white mb-1">Appointment Confirmed!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your appointment has been successfully booked.</p>

            <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl p-4 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Confirmation</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{confirmed.confirmationCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Hospital</span>
                <span className="font-medium text-gray-900 dark:text-white">{confirmed.hospital}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Date</span>
                <span className="font-medium text-gray-900 dark:text-white">{confirmed.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Time</span>
                <span className="font-medium text-gray-900 dark:text-white">{confirmed.time}</span>
              </div>
              {confirmed.notes && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{confirmed.notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setConfirmed(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm hover:from-blue-700 hover:to-teal-700 transition-all"
            >
              Book Another Appointment
            </button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Book Appointment" subtitle="Schedule a medical examination at a verified hospital" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Hospital</label>
                <select
                  {...register("hospitalId", { required: "Please select a hospital" })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="">Choose a hospital...</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
                {errors.hospitalId && <p className="mt-1 text-xs text-red-500">{errors.hospitalId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />Select Date
                </label>
                <input
                  {...register("date", { required: "Please select a date" })}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />Select Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedTime === t
                          ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Any special requirements or notes for the hospital..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
              >
                <Calendar className="w-4 h-4" /> Confirm Booking
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Hospital Info */}
        <div>
          {selectedHospital ? (
            <GlassCard className="p-5">
              <img src={selectedHospital.image} alt={selectedHospital.name} className="w-full h-32 object-cover rounded-xl mb-4" />
              <h3 className="text-gray-900 dark:text-white text-sm mb-2">{selectedHospital.name}</h3>
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <p>{selectedHospital.address}</p>
                <p>{selectedHospital.phone}</p>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">{selectedHospital.operatingHours}</p>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-5">
              <div className="text-center text-gray-400 py-8">
                <Hospital className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select a hospital to see details</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
