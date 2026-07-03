import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Clock, Star, Navigation, Calendar, Search } from "lucide-react";
import { hospitals } from "../../data/mockData";
import GlassCard from "../../components/shared/GlassCard";
import PageHeader from "../../components/shared/PageHeader";
import toast from "react-hot-toast";

export default function VerifiedHospitals() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof hospitals[0] | null>(null);

  const filtered = hospitals.filter(
    (h) => h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Verified Hospitals" subtitle={`${hospitals.length} hospitals verified in our network`} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hospitals by name or location..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {filtered.map((hospital, i) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300 cursor-pointer"
            onClick={() => setSelected(hospital)}
          >
            <div className="relative h-44 overflow-hidden">
              <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                ✓ Verified
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center gap-1 text-white">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{hospital.rating}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-gray-900 dark:text-white mb-3">{hospital.name}</h3>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                  <span>{hospital.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Phone className="w-4 h-4 text-teal-500" />
                  <span>{hospital.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>{hospital.operatingHours}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {hospital.specialties.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toast.success("Opening directions..."); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  <Navigation className="w-3.5 h-3.5" /> Directions
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toast.success("Appointment booking opened!"); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm hover:from-blue-700 hover:to-teal-700 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selected.image} alt={selected.name} className="w-full h-48 object-cover rounded-t-2xl" />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-gray-900 dark:text-white">{selected.name}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selected.rating} rating</span>
                  </div>
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">Verified</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />{selected.address}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-teal-500" />{selected.phone}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" />{selected.operatingHours}</div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.specialties.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                  Close
                </button>
                <button
                  onClick={() => { toast.success("Appointment booking!"); setSelected(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm hover:from-blue-700 hover:to-teal-700 transition-all"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
