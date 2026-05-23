import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiNavigation, FiSearch, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { createAddress, editAddress } from '../redux/addressSlice';

const AddressFormModal = ({ isOpen, onClose, addressToEdit = null }) => {
  const dispatch = useDispatch();
  const { isActionLoading } = useSelector((state) => state.addresses);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    alternateMobile: '',
    flatHouse: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    addressType: 'Home',
    isDefault: false,
    latitude: null,
    longitude: null,
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Populate data if editing
  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        fullName: addressToEdit.fullName || '',
        mobileNumber: addressToEdit.mobileNumber || '',
        alternateMobile: addressToEdit.alternateMobile || '',
        flatHouse: addressToEdit.flatHouse || '',
        area: addressToEdit.area || '',
        landmark: addressToEdit.landmark || '',
        city: addressToEdit.city || '',
        state: addressToEdit.state || '',
        country: addressToEdit.country || 'India',
        pincode: addressToEdit.pincode || '',
        addressType: addressToEdit.addressType || 'Home',
        isDefault: addressToEdit.isDefault || false,
        latitude: addressToEdit.latitude || null,
        longitude: addressToEdit.longitude || null,
      });
    } else {
      setFormData({
        fullName: '',
        mobileNumber: '',
        alternateMobile: '',
        flatHouse: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        addressType: 'Home',
        isDefault: false,
        latitude: null,
        longitude: null,
      });
    }
    setSearchQuery('');
    setSuggestions([]);
  }, [addressToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Location suggestions search (Nominatim API)
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    }, 600); // Debounce search request

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Select place from suggestions
  const handleSelectSuggestion = (place) => {
    const addr = place.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
    const state = addr.state || '';
    const country = addr.country || 'India';
    const pincode = addr.postcode || '';
    const area = addr.suburb || addr.neighbourhood || addr.road || addr.village || '';

    setFormData((prev) => ({
      ...prev,
      area: area || prev.area,
      city: city || prev.city,
      state: state || prev.state,
      country: country || prev.country,
      pincode: pincode || prev.pincode,
      latitude: parseFloat(place.lat) || null,
      longitude: parseFloat(place.lon) || null,
    }));

    setSuggestions([]);
    setSearchQuery('');
    toast.success(`Populated details for ${place.display_name.split(',')[0]}`, {
      style: { background: '#111', color: '#faf9f6', borderRadius: '12px' },
    });
  };

  // Detect Current Location (Geolocation API)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.', {
        style: { background: '#111', color: '#faf9f6', borderRadius: '12px' },
      });
    }

    setIsLocating(true);
    toast.loading('Locating luxury coordinates...', { id: 'geolocation', style: { background: '#111', color: '#faf9f6', borderRadius: '12px' } });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const addr = data.address || {};

          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
          const state = addr.state || '';
          const country = addr.country || 'India';
          const pincode = addr.postcode || '';
          const area = addr.suburb || addr.neighbourhood || addr.road || addr.village || '';

          setFormData((prev) => ({
            ...prev,
            area: area || prev.area,
            city: city || prev.city,
            state: state || prev.state,
            country: country || prev.country,
            pincode: pincode || prev.pincode,
            latitude,
            longitude,
          }));

          toast.success('Coordinates mapped and fields populated!', {
            id: 'geolocation',
            style: { background: '#111', color: '#faf9f6', borderRadius: '12px' },
          });
        } catch (error) {
          toast.error('Reverse geocoding query failed. Please fill fields manually.', {
            id: 'geolocation',
            style: { background: '#111', color: '#faf9f6', borderRadius: '12px' },
          });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        let msg = 'Failed to fetch coordinates.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Geolocation access denied. Please grant permission or type details.';
        }
        toast.error(msg, {
          id: 'geolocation',
          style: { background: '#111', color: '#faf9f6', borderRadius: '12px' },
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required fields check
    const { fullName, mobileNumber, flatHouse, area, city, state, pincode } = formData;
    if (!fullName.trim() || !mobileNumber.trim() || !flatHouse.trim() || !area.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      return toast.error('Please enter all required information.');
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobileNumber)) {
      return toast.error('Please provide a valid 10-digit mobile number.');
    }

    if (formData.alternateMobile && !phoneRegex.test(formData.alternateMobile)) {
      return toast.error('Please provide a valid alternate 10-digit mobile number.');
    }

    // Pincode validation
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(pincode)) {
      return toast.error('Pincode must be exactly 6 digits.');
    }

    const payload = { ...formData };

    if (addressToEdit) {
      dispatch(editAddress({ id: addressToEdit._id, addressData: payload }))
        .unwrap()
        .then(() => {
          toast.success('Luxury destination revised successfully.');
          onClose();
        })
        .catch((err) => {
          toast.error(err || 'Failed to update address.');
        });
    } else {
      dispatch(createAddress(payload))
        .unwrap()
        .then(() => {
          toast.success('Boutique address registered.');
          onClose();
        })
        .catch((err) => {
          toast.error(err || 'Failed to register address.');
        });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Elegant Top Bar */}
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-ivory">
              <div>
                <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase block">JEWELLERY</span>
                <h3 className="text-xl font-light font-display text-zinc-950">
                  {addressToEdit ? 'Edit Destination Card' : 'Register New Address'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-stone-200/60 bg-white flex items-center justify-center text-luxury-gray hover:text-zinc-900 transition hover:shadow-sm cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Autocomplete Search box */}
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray block mb-1">
                  Location Search Autocomplete
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gray text-base" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for landmark, area, or city..."
                    className="w-full pl-11 pr-10 py-3.5 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold placeholder-luxury-gray/60 focus:outline-none focus:border-primary/50 focus:bg-white transition"
                  />
                  {isSearching && (
                    <FiLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                  )}
                </div>

                {/* Suggestions List */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-20 max-h-48 overflow-y-auto">
                    {suggestions.map((place) => (
                      <button
                        key={place.place_id}
                        type="button"
                        onClick={() => handleSelectSuggestion(place)}
                        className="w-full text-left px-4 py-3 text-xs hover:bg-stone-50 border-b border-stone-100/60 transition flex items-start gap-2.5"
                      >
                        <FiMapPin className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="truncate text-zinc-800 font-medium">{place.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* GPS button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full py-3.5 border border-primary/20 hover:border-primary rounded-2xl text-xs font-bold uppercase tracking-widest text-primary bg-primary-light/40 hover:bg-primary-light flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin text-primary" />
                    Locating boutique...
                  </>
                ) : (
                  <>
                    <FiNavigation className="w-4 h-4 text-primary animate-pulse" />
                    Use My Current Location
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200/50"></div>
                <span className="flex-shrink mx-4 text-[9px] font-bold text-luxury-gray uppercase tracking-[0.25em]">
                  OR ENTER MANUALLY
                </span>
                <div className="flex-grow border-t border-stone-200/50"></div>
              </div>

              {/* Form starts */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      required
                      placeholder="10-digit number"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Alternate Mobile Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Alternate Mobile Number
                    </label>
                    <input
                      type="text"
                      name="alternateMobile"
                      value={formData.alternateMobile}
                      onChange={handleChange}
                      placeholder="Optional 10-digit number"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      placeholder="6-digit pincode"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Flat, House, Building Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Flat / House / Building Name *
                    </label>
                    <input
                      type="text"
                      name="flatHouse"
                      value={formData.flatHouse}
                      onChange={handleChange}
                      required
                      placeholder="Apt, Suite, Unit, etc."
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Area, Sector, Locality */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Area / Sector / Locality *
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      placeholder="Street, Sector, Block, etc."
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Landmark */}
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Landmark
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Optional landmark"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="City Name"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="State Name"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Country */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      placeholder="Country Name"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Address Type Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
                      Address Type *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Home', 'Work', 'Other'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, addressType: type }))}
                          className={`py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border transition cursor-pointer select-none ${
                            formData.addressType === type
                              ? 'border-primary bg-primary-light text-primary'
                              : 'border-stone-200 hover:border-zinc-400 bg-white text-luxury-gray'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Default checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 accent-primary rounded border-stone-300 focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-xs font-semibold text-zinc-800 cursor-pointer select-none">
                    Set this as my default delivery address
                  </label>
                </div>

                {/* Submit Panel */}
                <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3.5 border border-stone-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-luxury-gray hover:bg-stone-50 transition cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="gold-shimmer-btn px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center min-w-36 hover:shadow-md cursor-pointer select-none"
                  >
                    {isActionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : addressToEdit ? (
                      'Save Changes'
                    ) : (
                      'Save Address'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddressFormModal;
