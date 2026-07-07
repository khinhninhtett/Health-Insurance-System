import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ShieldCheck, UploadCloud, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function VerifyProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [nrcFrontPhoto, setNrcFrontPhoto] = useState<File | null>(null);
  const [nrcBackPhoto, setNrcBackPhoto] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (user?.verificationStatus === "verified") {
    return <Navigate to="/customer/dashboard" replace />;
  }

  const onFileChange = (setter: (file: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files?.[0] ?? null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nrcFrontPhoto || !nrcBackPhoto || !profilePhoto) {
      setErrorMsg("Please select the NRC front photo, NRC back photo, and a personal photo.");
      return;
    }

    if (!dateOfBirth || !address.trim()) {
      setErrorMsg("Please provide your date of birth and address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("him_token");
      const formData = new FormData();
      formData.append("nrcFrontPhoto", nrcFrontPhoto);
      formData.append("nrcBackPhoto", nrcBackPhoto);
      formData.append("profilePhoto", profilePhoto);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("address", address);

      const response = await fetch("http://localhost:5000/api/users/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Verification failed");
      }

      updateUser({ verificationStatus: result.user.verificationStatus });
      navigate("/customer/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while submitting your documents.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 shadow-lg shadow-blue-500/30 mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-white">Verify your identity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome, {user?.name?.split(" ")[0]}! Upload your NRC (front &amp; back) and a personal photo, and confirm your details to finish setting up your account.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6">

          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900">
              {errorMsg}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <PhotoField
                label="NRC front photo"
                file={nrcFrontPhoto}
                onChange={onFileChange(setNrcFrontPhoto)}
              />
              <PhotoField
                label="NRC back photo"
                file={nrcBackPhoto}
                onChange={onFileChange(setNrcBackPhoto)}
              />
            </div>
            <PhotoField
              label="Personal photo"
              file={profilePhoto}
              onChange={onFileChange(setProfilePhoto)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date of birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Full residential address..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium hover:from-blue-700 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Submit for verification <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function PhotoField({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="w-12 h-12 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
          {file ? file.name : `Choose ${label.toLowerCase()}`}
        </span>
        <input type="file" accept="image/*" onChange={onChange} className="hidden" />
      </label>
    </div>
  );
}
