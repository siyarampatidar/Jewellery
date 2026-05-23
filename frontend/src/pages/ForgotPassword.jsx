import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/apis';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error('Please enter your email address.');
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      toast.success(response.data.message || 'Recovery email dispatched.');
      setIsSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch recovery link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-ivory px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-light/35 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="luxury-card p-8 sm:p-10 rounded-[28px] relative overflow-hidden">
          {/* Top Line Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] gold-gradient" />

          {/* Back to Home Button */}
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-luxury-gray hover:text-primary transition duration-300 mb-5 group"
          >
            <FiArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" />
            Home
          </Link>

          {isSent ? (
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6">
                <FiCheck className="w-5 h-5" />
              </div>
              <h2 className="text-3xl font-normal text-zinc-950 font-display mb-3">
                Link Sent
              </h2>
              <p className="text-xs font-semibold text-luxury-gray leading-relaxed mb-8 max-w-xs mx-auto">
                If <span className="font-bold text-zinc-800">{email}</span> matches our patrons directory, a password recovery link has been dispatched to it.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-hover hover:underline transition"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="text-center mb-10">
                <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">
                  Boutique Recovery
                </span>
                <h2 className="text-3xl font-normal text-zinc-950 font-display mt-2">
                  Forgot Password
                </h2>
                <p className="mt-2.5 text-xs font-medium text-luxury-gray uppercase tracking-widest leading-relaxed">
                  Recover your JEWELLERY account credentials
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Address */}
                <div className="floating-input-group">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    required
                    className="floating-input"
                  />
                  <label htmlFor="email" className="floating-label">
                    Email Address
                  </label>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-center py-4 px-6 border-0 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-white bg-luxury-black hover:bg-primary transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Dispatch Link'
                  )}
                </motion.button>
              </form>

              {/* Back link */}
              <div className="mt-8 text-center border-t border-primary/5 pt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-luxury-gray hover:text-zinc-950 transition"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Return to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
