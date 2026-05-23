import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isActionLoading } = useSelector((state) => state.auth);

  // States
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const { identifier, password, rememberMe } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      return toast.error('Please enter both email/mobile and password.');
    }

    dispatch(loginUser(formData))
      .unwrap()
      .then((data) => {
        toast.success(`Welcome back to JEWELLERY, ${data.user.name.split(' ')[0]}.`);
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      })
      .catch((err) => {
        if (err?.unverified) {
          toast.error(err.message || 'Please verify your account.');
          navigate('/verify-otp');
        } else {
          toast.error(err?.message || err || 'Invalid credentials provided.');
        }
      });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-ivory px-4 py-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Luxury Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-light/35 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Luxury Card Container */}
        <div className="luxury-card p-6 sm:p-8 rounded-[24px] relative overflow-hidden">
          {/* Top Fine Gold Highlight Line */}
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
          <div className="text-center mb-6">
            <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase">
              Boutique Portal
            </span>
            <h2 className="text-2xl font-normal text-zinc-950 font-display mt-1">
              Sign In
            </h2>
            <p className="mt-1.5 text-[10px] font-medium text-luxury-gray uppercase tracking-widest leading-relaxed">
              Unlock access to JEWELLERY luxury fashion
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier input group */}
            <div className="floating-input-group">
              <input
                type="text"
                name="identifier"
                id="identifier"
                value={identifier}
                onChange={handleChange}
                placeholder=" "
                required
                className="floating-input"
              />
              <label htmlFor="identifier" className="floating-label">
                Email Address or Mobile
              </label>
            </div>

            {/* Password input group */}
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

              {/* Password eye button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-gray hover:text-zinc-950 transition cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember Me & Recover password */}
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleChange}
                  className="h-4.5 w-4.5 rounded-md border-primary/20 text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2.5 text-xs font-semibold uppercase tracking-wider text-luxury-gray hover:text-zinc-950 transition cursor-pointer">
                  Remember Me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-hover hover:underline transition"
              >
                Forgot?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isActionLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center py-3.5 px-6 border-0 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-white bg-luxury-black hover:bg-primary transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isActionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Enter Boutique'
              )}
            </motion.button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-5 text-center border-t border-primary/5 pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-luxury-gray">
              New Patron?{' '}
              <Link to="/register" className="font-bold text-primary hover:text-primary-hover hover:underline transition">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
