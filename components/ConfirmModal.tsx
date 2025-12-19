import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, onConfirm, onCancel, 
  confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
       <div className="parchment-card p-8 md:p-10 rounded-[40px] w-full max-w-md border-4 border-[#3d2b1f] shadow-5xl relative animate-bounce-in">
           <button onClick={onCancel} className="absolute top-6 right-6 text-fantasy-wood/40 dark:text-fantasy-parchment/40 hover:text-fantasy-wood p-2 rounded-full transition-colors"><X size={24}/></button>
           
           <div className="flex flex-col items-center text-center space-y-6">
              <div className={`wax-seal w-20 h-20 flex items-center justify-center text-white shadow-lg ${variant === 'danger' ? 'bg-red-900 border-red-950' : 'bg-blue-900 border-blue-950'}`}>
                 <AlertCircle size={40} />
              </div>
              
              <h3 className="text-3xl font-medieval text-fantasy-wood dark:text-fantasy-gold uppercase tracking-tighter leading-none">{title}</h3>
              <p className="font-serif text-lg text-fantasy-wood/80 dark:text-fantasy-parchment/80 leading-relaxed italic">"{message}"</p>
              
              <div className="flex w-full gap-4 pt-4">
                  <button onClick={onCancel} className="flex-1 py-4 rounded-[28px] font-medieval text-lg uppercase tracking-widest bg-black/5 dark:bg-white/5 text-fantasy-wood dark:text-fantasy-parchment transition-all hover:bg-black/10 dark:hover:bg-white/10">
                    {cancelText}
                  </button>
                  <button onClick={onConfirm} className={`flex-1 py-4 rounded-[28px] font-medieval text-lg uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 ${variant === 'danger' ? 'bg-fantasy-blood' : 'bg-indigo-900'}`}>
                    {confirmText}
                  </button>
              </div>
           </div>
       </div>
    </div>
  );
};

export default ConfirmModal;