import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtpCode, resendOtpCode } from '../redux/authSlice';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { otpEmail, isActionLoading } = useSelector((state) => state.auth);
  
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!otpEmail) {
      toast.error('Session not found. Please register first.');
      navigate('/register');
    }
  }, [otpEmail, navigate]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp.length !== 6 || isNaN(Number(otp))) {
      return toast.error('OTP code must be 6 digits.');
    }

    dispatch(verifyOtpCode({ email: otpEmail, otp }))
      .unwrap()
      .then((data) => {
        toast.success('Patron session established. Welcome to JEWELLERY.');
        navigate('/profile');
      })
      .catch((err) => {
        toast.error(err || 'Verification failed. Try again.');
      });
  };

  const handleResend = () => {
    if (!canResend) return;

    dispatch(resendOtpCode(otpEmail))
      .unwrap()
      .then((data) => {
        toast.success(data.message || 'OTP resent successfully!');
        setTimer(60);
        setCanResend(false);
      })
      .catch((err) => {
        toast.error(err || 'Failed to resend code.');
      });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-ivory px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-light/35 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="luxury-card p-8 sm:p-10 rounded-[28px] relative overflow-hidden text-center">
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

          {/* Icon */}
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <FiCheckCircle className="w-5 h-5" />
          </div>

          {/* Header */}
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">
            Security Check
          </span>
          <h2 className="text-3xl font-normal text-zinc-950 font-display mt-2 mb-3">
            Verify Email
          </h2>
          
          <p className="text-xs font-semibold text-luxury-gray leading-relaxed mb-8 max-w-xs mx-auto">
            We have dispatched a 6-digit access code to <span className="font-bold text-zinc-800">{otpEmail}</span>. Please verify below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Center Single Box OTP */}
            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="000000"
                className="block w-full text-center tracking-[0.4em] text-3xl font-bold py-4 bg-white/40 border border-primary/20 rounded-2xl text-zinc-950 placeholder-primary/20 focus:outline-hidden focus:ring-4 focus:ring-primary/5 focus:border-primary transition duration-300"
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isActionLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center py-4 px-6 border-0 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-white bg-luxury-black hover:bg-primary transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isActionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verify Session'
              )}
            </motion.button>
          </form>

          {/* Resend actions */}
          <div className="mt-8 text-xs font-semibold uppercase tracking-widest text-luxury-gray">
            {canResend ? (
              <p>
                No code received?{' '}
                <button
                  onClick={handleResend}
                  className="font-bold text-primary hover:text-primary-hover hover:underline transition bg-transparent border-0 cursor-pointer"
                >
                  Resend OTP
                </button>
              </p>
            ) : (
              <p className="text-zinc-400">
                Resend link in <span className="font-bold text-zinc-600">{timer}s</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
