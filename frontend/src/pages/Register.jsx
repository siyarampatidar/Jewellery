import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/authSlice';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isActionLoading } = useSelector((state) => state.auth);

  // States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, mobile, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !mobile || !password || !confirmPassword) {
      return toast.error('Please enter all requested details.');
    }

    if (password.length < 6) {
      return toast.error('Secret password must contain at least 6 characters.');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    dispatch(registerUser(formData))
      .unwrap()
      .then((data) => {
        toast.success(data.message || 'OTP dispatched. Verify your address.');
        navigate('/verify-otp');
      })
      .catch((err) => {
        toast.error(err || 'Failed to complete registration.');
      });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-ivory px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-light/35 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="luxury-card p-8 sm:p-10 rounded-[28px] relative overflow-hidden">
          {/* Accent Gold Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[2px] gold-gradient" />

          {/* Back to Home Button */}
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-luxury-gray hover:text-primary transition duration-300 mb-5 group"
          >
            <FiArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" />
            Home
          </Link>

          {/* Heading */}
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">
              Patron Enlistment
            </span>
            <h2 className="text-3xl font-normal text-zinc-950 font-display mt-2">
              Register
            </h2>
            <p className="mt-2.5 text-xs font-medium text-luxury-gray uppercase tracking-widest leading-relaxed">
              Create an profile for luxury privileges
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="floating-input-group">
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={handleChange}
                placeholder=" "
                required
                className="floating-input"
              />
              <label htmlFor="name" className="floating-label">
                Full Name
              </label>
            </div>

            {/* Email Address */}
            <div className="floating-input-group">
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleChange}
                placeholder=" "
                required
                className="floating-input"
              />
              <label htmlFor="email" className="floating-label">
                Email Address
              </label>
            </div>

            {/* Mobile Number */}
            <div className="floating-input-group">
              <input
                type="tel"
                name="mobile"
                id="mobile"
                value={mobile}
                onChange={handleChange}
                placeholder=" "
                required
                className="floating-input"
              />
              <label htmlFor="mobile" className="floating-label">
                Mobile Number
              </label>
            </div>

            {/* Password */}
            <div className="floating-input-group relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={password}
                onChange={handleChange}
                placeholder=" "
                required
                className="floating-input pr-12"
              />
              <label htmlFor="password" className="floating-label">
                Secret Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-gray hover:text-zinc-950 transition cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="floating-input-group relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder=" "
                required
                className="floating-input pr-12"
              />
              <label htmlFor="confirmPassword" className="floating-label">
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-gray hover:text-zinc-950 transition cursor-pointer"
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
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
                'Create Profile'
              )}
            </motion.button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center border-t border-primary/5 pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-luxury-gray">
              Already Enlisted?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-primary-hover hover:underline transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
