import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative z-10 w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-zinc-100"
          >
            {/* Gold Highlight Line */}
            <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />

            <h3 className="text-xl font-semibold leading-6 text-zinc-900 mb-2">
              {title}
            </h3>
            
            <p className="text-sm text-zinc-500 mb-6">
              {message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 hover:text-zinc-700 transition"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-5 py-2 text-sm font-semibold text-black bg-primary rounded-lg hover:bg-primary-hover active:scale-95 transition shadow-sm hover:shadow-md"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
