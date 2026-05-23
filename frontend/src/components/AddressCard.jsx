import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiMapPin, FiPhone, FiStar, FiHome, FiBriefcase, FiCompass } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { removeAddress, setDefaultAddressAction } from '../redux/addressSlice';
import toast from 'react-hot-toast';

const AddressCard = ({ address, onEdit }) => {
  const dispatch = useDispatch();
  const { isActionLoading } = useSelector((state) => state.addresses);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this boutique delivery address?')) {
      dispatch(removeAddress(address._id))
        .unwrap()
        .then((res) => {
          toast.success(res.message || 'Address removed from register.');
        })
        .catch((err) => {
          toast.error(err || 'Failed to remove address.');
        });
    }
  };

  const handleSetDefault = () => {
    dispatch(setDefaultAddressAction(address._id))
      .unwrap()
      .then((res) => {
        toast.success(res.message || 'Default destination updated.');
      })
      .catch((err) => {
        toast.error(err || 'Failed to set default address.');
      });
  };

  const getTypeIcon = () => {
    switch (address.addressType) {
      case 'Home':
        return <FiHome className="w-3.5 h-3.5" />;
      case 'Work':
        return <FiBriefcase className="w-3.5 h-3.5" />;
      default:
        return <FiCompass className="w-3.5 h-3.5" />;
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -3, scale: 1.01 }}
      className={`luxury-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[220px] bg-white border ${
        address.isDefault ? 'border-primary shadow-md' : 'border-stone-200/60 hover:border-zinc-400'
      }`}
    >
      {/* Default Gold Shimmer Header Indicator */}
      {address.isDefault && (
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
      )}

      <div className="space-y-4">
        {/* Badges and Address Type */}
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200/50 rounded-full text-[9px] font-bold text-luxury-gray uppercase tracking-wider">
            {getTypeIcon()}
            {address.addressType}
          </span>
          {address.isDefault && (
            <span className="flex items-center gap-1 px-3 py-1 bg-primary-light border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider rounded-full">
              <FiStar className="w-3 h-3 fill-current" />
              Default Address
            </span>
          )}
        </div>

        {/* Full Name & Phone */}
        <div className="space-y-1">
          <h4 className="text-base font-medium text-zinc-950 font-sans tracking-tight">{address.fullName}</h4>
          <p className="text-xs font-semibold text-luxury-gray flex items-center gap-1.5">
            <FiPhone className="w-3.5 h-3.5 text-primary/70" />
            {address.mobileNumber}
            {address.alternateMobile && <span className="text-stone-300">| Alt: {address.alternateMobile}</span>}
          </p>
        </div>

        {/* Address Body */}
        <div className="space-y-0.5 text-xs text-luxury-gray font-medium leading-relaxed">
          <p className="text-zinc-800">{address.flatHouse}</p>
          <p>{address.area}</p>
          {address.landmark && <p className="italic text-[11px] text-stone-400">Landmark: {address.landmark}</p>}
          <p className="text-zinc-800">
            {address.city}, {address.state} - <strong className="font-semibold">{address.pincode}</strong>
          </p>
          <p className="text-[10px] tracking-wider uppercase font-semibold text-stone-400">{address.country}</p>
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex justify-between items-center pt-5 mt-4 border-t border-stone-100">
        <div className="flex gap-2">
          {/* Edit */}
          <button
            onClick={() => onEdit(address)}
            title="Edit Address"
            className="p-2 border border-stone-200 hover:border-zinc-800 hover:text-zinc-950 hover:bg-stone-50 rounded-xl text-luxury-gray transition cursor-pointer"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
          </button>
          
          {/* Delete */}
          <button
            onClick={handleDelete}
            title="Delete Address"
            className="p-2 border border-stone-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50/20 rounded-xl text-luxury-gray transition cursor-pointer"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Set as Default */}
        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={isActionLoading}
            className="px-4 py-2 border border-stone-200 hover:border-primary text-luxury-gray hover:text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest transition cursor-pointer bg-white select-none hover:bg-primary-light/10"
          >
            Set Default
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default AddressCard;
