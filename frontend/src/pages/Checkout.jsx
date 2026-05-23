import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
  FiArrowRight,
  FiCheckCircle,
  FiPlus,
  FiLock,
  FiShield,
  FiInfo,
  FiChevronsRight,
  FiChevronLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchAddresses, setDefaultAddressAction } from '../redux/addressSlice';
import { clearCartDB } from '../redux/cartSlice';
import AddressFormModal from '../components/AddressFormModal';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Selectors
  const cartItems = useSelector((state) => state.cart.items);
  const { addresses, loading: addressesLoading } = useSelector((state) => state.addresses);
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment, 3 = Success
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gateway'); // gateway, cod

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);

  // Address Modal States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);

  // Subtotal Calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Fetch addresses and check cart on mount
  useEffect(() => {
    dispatch(fetchAddresses());
    
    // Store cart items and subtotal locally so they don't disappear after clearing cart
    if (cartItems.length > 0) {
      setPurchasedItems(cartItems);
      setOrderTotal(subtotal);
    } else if (step !== 3) {
      // If cart is empty and not on success screen, go back to collection
      navigate('/collection');
    }
  }, [dispatch]);

  // Set default selected address on load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((addr) => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  // Address modal helpers
  const handleAddNewAddress = () => {
    setAddressToEdit(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (addr, e) => {
    e.stopPropagation(); // Avoid selecting address card when clicking edit
    setAddressToEdit(addr);
    setIsAddressModalOpen(true);
  };

  const handlePlaceOrder = () => {
    // Validate Selected Address
    if (!selectedAddressId) {
      return toast.error('Please select a delivery address to proceed.');
    }

    setIsProcessing(true);

    if (paymentMethod === 'gateway') {
      toast.loading('Connecting to secure payment gateway...', { id: 'order-placement' });
      
      // Simulate gateway redirection and authorisation
      setTimeout(() => {
        toast.loading('Authorizing secure transaction...', { id: 'order-placement' });
        setTimeout(() => {
          const randomOrderId = 'JEWELLERY-' + Math.floor(100000 + Math.random() * 900000);
          setOrderId(randomOrderId);
          setIsProcessing(false);
          setStep(3);
          dispatch(clearCartDB());
          toast.success('Payment authorized and order placed successfully!', { id: 'order-placement' });
        }, 1500);
      }, 1500);
    } else {
      toast.loading('Registering Cash on Delivery shipment details...', { id: 'order-placement' });
      setTimeout(() => {
        const randomOrderId = 'JEWELLERY-' + Math.floor(100000 + Math.random() * 900000);
        setOrderId(randomOrderId);
        setIsProcessing(false);
        setStep(3);
        dispatch(clearCartDB());
        toast.success('Order registered successfully under Cash on Delivery!', { id: 'order-placement' });
      }, 1500);
    }
  };

  const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId);

  return (
    <div className="pb-24 pt-10 bg-ivory min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <AnimatePresence mode="wait">
          {step === 3 ? (
            /* =============================================
               ORDER SUCCESS SCREEN
               ============================================= */
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto py-12 text-center"
            >
              <div className="luxury-card rounded-[32px] p-8 sm:p-12 space-y-8 bg-white shadow-xl relative overflow-hidden border border-primary/20">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                
                {/* Success Icon */}
                <div className="mx-auto w-24 h-24 bg-primary-light/50 border border-primary/20 rounded-full flex items-center justify-center text-primary shadow-inner">
                  <FiCheckCircle className="w-12 h-12 stroke-[1.5] animate-bounce" />
                </div>

                {/* Header text */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase block">JEWELLERY ATELIER</span>
                  <h1 className="text-3xl font-light font-display text-zinc-950">Order Placed Successfully</h1>
                  <p className="text-xs sm:text-sm text-luxury-gray leading-relaxed max-w-md mx-auto font-medium">
                    Thank you for your patronage. Your designer selection has been successfully reserved. A summary details notification is sent to your registered email.
                  </p>
                </div>

                {/* Details card */}
                <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-6 text-left space-y-4">
                  <div className="flex justify-between border-b border-stone-200/50 pb-3 text-xs font-semibold text-luxury-gray uppercase tracking-wider">
                    <span>Order Reference</span>
                    <span className="text-zinc-900 font-bold select-all">{orderId}</span>
                  </div>

                  <div className="flex justify-between border-b border-stone-200/50 pb-3 text-xs font-semibold text-luxury-gray uppercase tracking-wider">
                    <span>Valuation Total</span>
                    <span className="text-zinc-900 font-bold font-sans text-sm">₹{orderTotal}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-luxury-gray uppercase tracking-widest block">Delivery Destination</span>
                    {selectedAddress && (
                      <div className="text-xs text-zinc-800 font-medium">
                        <p className="font-bold">{selectedAddress.fullName}</p>
                        <p className="text-luxury-gray text-[11px] mt-0.5">
                          {selectedAddress.flatHouse}, {selectedAddress.area}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Items summary list */}
                <div className="space-y-3 text-left">
                  <span className="text-[10px] font-bold text-luxury-gray uppercase tracking-widest block mb-2">Purchased Items</span>
                  <div className="max-h-36 overflow-y-auto space-y-2.5 pr-2">
                    {purchasedItems.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between items-center text-xs font-medium text-zinc-800 border-b border-stone-100 pb-2">
                        <span className="truncate max-w-[280px]">
                          {item.name} <span className="text-[10px] text-luxury-gray font-normal">({item.size} | {item.color})</span>
                        </span>
                        <span className="text-zinc-950 font-bold font-sans">
                          {item.quantity} × ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/collection"
                    className="gold-shimmer-btn px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center shadow-lg transition"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    to="/account"
                    className="px-8 py-3.5 border border-stone-250 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-700 hover:bg-stone-50 transition text-center select-none"
                  >
                    My Orders
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* =============================================
               CHECKOUT STAGES AND SIDEBAR
               ============================================= */
            <motion.div
              key="checkout-flow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start"
            >
              {/* Left Column: Flow Stages */}
              <div className="lg:col-span-2 space-y-8">
                {/* Step Indicators */}
                <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-luxury-gray select-none border-b border-stone-200 pb-5">
                  {step !== 3 && (
                    <button
                      type="button"
                      onClick={() => navigate('/cart')}
                      className="w-7 h-7 rounded-full flex items-center justify-center border border-stone-200 bg-white hover:bg-stone-50 text-zinc-800 hover:text-zinc-950 transition duration-300 shadow-xs cursor-pointer select-none mr-1 flex-shrink-0"
                      title="Back to Bag"
                    >
                      <FiChevronLeft className="w-4 h-4 text-primary" />
                    </button>
                  )}
                  <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-primary' : ''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${step >= 1 ? 'border-primary bg-primary-light text-primary' : 'border-stone-300'}`}>1</span>
                    Address Selection
                  </span>
                  <FiChevronsRight className="text-stone-300 text-sm" />
                  <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-primary' : ''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${step >= 2 ? 'border-primary bg-primary-light text-primary' : 'border-stone-300'}`}>2</span>
                    Payment Details
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    /* =============================================
                       STEP 1: SELECT ADDRESS
                       ============================================= */
                    <motion.div
                      key="step-address"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block mb-1">STEP 1</span>
                          <h2 className="text-3xl font-light text-zinc-950 font-display tracking-tight">Delivery Address</h2>
                        </div>
                        <button
                          onClick={handleAddNewAddress}
                          className="px-5 py-3 border border-zinc-950 hover:bg-luxury-black hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
                        >
                          <FiPlus className="w-4 h-4" /> Add Address
                        </button>
                      </div>

                      {addressesLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-3">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-semibold text-luxury-gray uppercase tracking-widest">Retrieving destinations...</span>
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-stone-200 bg-white rounded-[24px] space-y-4">
                          <p className="text-sm font-semibold text-luxury-gray">No addresses saved to your Boutique account yet.</p>
                          <button
                            onClick={handleAddNewAddress}
                            className="gold-shimmer-btn px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:shadow-md transition cursor-pointer select-none inline-flex items-center gap-1.5"
                          >
                            <FiPlus className="w-3.5 h-3.5" /> Add Delivery Address
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {addresses.map((address) => {
                            const isSelected = selectedAddressId === address._id;
                            return (
                              <div
                                key={address._id}
                                onClick={() => setSelectedAddressId(address._id)}
                                className={`luxury-card rounded-2xl p-5 flex items-start gap-4 border transition duration-300 cursor-pointer bg-white relative ${
                                  isSelected ? 'border-primary shadow-sm bg-primary-light/5' : 'border-stone-200 hover:border-zinc-400'
                                }`}
                              >
                                {/* Radio select control */}
                                <div className="mt-1 flex-shrink-0">
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-stone-300'}`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                  </div>
                                </div>

                                {/* Address Details */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">{address.fullName}</span>
                                    <span className="px-2 py-0.5 bg-stone-50 border border-stone-200/50 rounded-full text-[8px] font-bold text-luxury-gray uppercase tracking-wider">
                                      {address.addressType}
                                    </span>
                                    {address.isDefault && (
                                      <span className="px-2 py-0.5 bg-primary-light border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-wider rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-luxury-gray leading-relaxed">
                                    {address.flatHouse}, {address.area}, {address.city}, {address.state} - <strong className="font-semibold text-zinc-900">{address.pincode}</strong>
                                  </p>

                                  <div className="text-[11px] font-semibold text-luxury-gray flex items-center gap-1">
                                    <span>Phone:</span>
                                    <span className="text-zinc-900">{address.mobileNumber}</span>
                                  </div>
                                </div>

                                {/* Edit Button */}
                                <button
                                  onClick={(e) => handleEditAddress(address, e)}
                                  className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-zinc-900 border border-transparent hover:border-primary/20 px-3 py-1.5 rounded-xl transition absolute top-4 right-4"
                                >
                                  Edit
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Proceed button */}
                      {addresses.length > 0 && (
                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() => setStep(2)}
                            disabled={!selectedAddressId}
                            className="gold-shimmer-btn px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition cursor-pointer select-none disabled:opacity-50"
                          >
                            Proceed to Payment <FiArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    /* =============================================
                       STEP 2: PAYMENT METHOD
                       ============================================= */
                    <motion.div
                      key="step-payment"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block mb-1">STEP 2</span>
                        <h2 className="text-3xl font-light text-zinc-950 font-display tracking-tight">Payment Selection</h2>
                      </div>

                      {/* Payment Method Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { id: 'gateway', label: 'Online Payment (UPI, Card, Netbanking)', desc: 'Pay securely using our online payment gateway checkout.' },
                          { id: 'cod', label: 'Cash On Delivery', desc: 'Pay with Cash or Digital options at the time of delivery.' },
                        ].map((method) => {
                          const isActive = paymentMethod === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setPaymentMethod(method.id)}
                              className={`p-6 rounded-2xl border text-left transition cursor-pointer select-none flex gap-4 items-start bg-white hover:border-zinc-400 ${
                                isActive
                                  ? 'border-primary bg-primary-light/5 shadow-sm'
                                  : 'border-stone-200 text-luxury-gray bg-white/70'
                              }`}
                            >
                              <div className="mt-1 flex-shrink-0">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isActive ? 'border-primary bg-primary' : 'border-stone-300'}`}>
                                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                                  {method.label}
                                </h4>
                                <p className="text-[11px] font-medium text-luxury-gray leading-normal mt-1">
                                  {method.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Method Input Panels */}
                      <div className="luxury-card rounded-2xl p-6 bg-white border border-stone-200/60">
                        <AnimatePresence mode="wait">
                          {paymentMethod === 'cod' ? (
                            <motion.div
                              key="panel-cod"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="space-y-3"
                            >
                              <div className="flex gap-3 text-zinc-800">
                                <FiInfo className="text-primary text-base flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</h4>
                                  <p className="text-xs text-luxury-gray leading-relaxed font-medium">
                                    Receive your JEWELLERY tailoring box and pay the delivery executive at your doorstep. We accept Cash, Card, or UPI on delivery.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="panel-gateway"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="space-y-3"
                            >
                              <div className="flex gap-3 text-zinc-800">
                                <FiShield className="text-primary text-base flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold uppercase tracking-wider">Secure Gateway Transaction</h4>
                                  <p className="text-xs text-luxury-gray leading-relaxed font-medium">
                                    Clicking below will launch our secure luxury checkout portal. You can complete the purchase via card networks (Visa, Mastercard, RuPay), any UPI application, or major banking institutions.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex justify-between items-center pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-5 py-3.5 border border-stone-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-luxury-gray hover:bg-stone-50 transition cursor-pointer select-none flex items-center gap-1"
                        >
                          <FiChevronLeft className="w-4 h-4" /> Go Back
                        </button>
                        <button
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={isProcessing}
                          className="gold-shimmer-btn px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:shadow-lg transition cursor-pointer select-none disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Proceed to Pay <FiLock className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Checkout Summary Details */}
              <div className="space-y-8 lg:sticky lg:top-24 select-none">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase block mb-1">ATELIER</span>
                  <h2 className="text-2xl font-light text-zinc-950 font-display tracking-tight">Checkout Summary</h2>
                </div>

                <div className="luxury-card rounded-3xl p-6 sm:p-8 space-y-6 bg-white border border-primary/10">
                  {/* Selected Address Preview */}
                  {selectedAddress && (
                    <div className="pb-5 border-b border-stone-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-luxury-gray uppercase tracking-widest flex items-center gap-1">
                          <FiMapPin className="text-primary" /> Delivery Destination
                        </span>
                        {step === 2 && (
                          <button
                            onClick={() => setStep(1)}
                            className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-zinc-900 transition"
                          >
                            Change
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-zinc-800 font-semibold leading-relaxed">
                        <p>{selectedAddress.fullName}</p>
                        <p className="text-luxury-gray text-[10px] font-normal leading-tight mt-0.5">
                          {selectedAddress.flatHouse}, {selectedAddress.area}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Purchased Items List */}
                  <div className="pb-5 border-b border-stone-150 space-y-3">
                    <span className="text-[9px] font-bold text-luxury-gray uppercase tracking-widest flex items-center gap-1">
                      <FiShoppingBag className="text-primary" /> Selection Detail ({cartItems.length})
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-3 pr-1">
                      {cartItems.map((item) => (
                        <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 items-center">
                          <img src={item.image} alt={item.name} className="w-10 h-14 object-cover rounded bg-stone-50 border border-stone-200/50" />
                          <div className="flex-1 min-w-0 text-xs">
                            <h4 className="font-semibold text-zinc-900 truncate">{item.name}</h4>
                            <p className="text-[10px] text-luxury-gray font-medium mt-0.5 uppercase tracking-wider">{item.size} | {item.color}</p>
                            <div className="flex justify-between items-baseline mt-1 font-semibold">
                              <span className="text-[10px] text-luxury-gray font-normal">Qty: {item.quantity}</span>
                              <span className="text-zinc-950 font-sans">₹{item.price * item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-4 pb-6 border-b border-stone-150 text-xs font-semibold text-luxury-gray uppercase tracking-widest">
                    <div className="flex justify-between">
                      <span>Subtotal Valuation</span>
                      <span className="text-zinc-900 font-bold font-sans">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atelier Shipping</span>
                      <span className="text-primary font-bold">Complimentary</span>
                    </div>
                  </div>

                  {/* Total calculation */}
                  <div>
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">Total Valuation</span>
                      <span className="text-2xl sm:text-3xl font-light text-zinc-950 font-display">₹{subtotal}</span>
                    </div>
                  </div>

                  {/* Trust Bar items */}
                  <div className="pt-2 space-y-3 text-[10px] text-luxury-gray tracking-wider uppercase font-semibold border-t border-stone-100/60">
                    <div className="flex items-center gap-2.5">
                      <FiShield className="text-primary text-sm flex-shrink-0" />
                      <span>Atelier packaging & insurance included</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FiLock className="text-primary text-sm flex-shrink-0" />
                      <span>Encrypted SSL Secure Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inline Address Form Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addressToEdit={addressToEdit}
      />
    </div>
  );
};

export default Checkout;
