import { motion, AnimatePresence } from 'framer-motion';
import {  AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string; // Tùy chọn: Chữ trên nút xác nhận
  cancelText?: string;  // Tùy chọn: Chữ trên nút hủy
}

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy" }: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-[#2d1b3d] border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-sm text-white"
          onClick={(e) => e.stopPropagation()} // Ngăn việc click bên trong modal làm đóng nó
        >
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-red-500/20 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white/90">{title}</h3>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
          </div>
          <div className="flex bg-white/5 rounded-b-2xl px-4 py-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-transparent hover:bg-white/10 rounded-md transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 ml-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-lg shadow-red-900/50"
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};