import { ReactNode } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}
function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  const panelClasses = twMerge(
    'relative w-full max-w-md rounded-2xl bg-reel-dust p-8 text-white shadow-xl',
    className,
  );

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog
        as="div"
        className="relative z-50"
        open={isOpen}
        onClose={onClose}
      >
        {/* Backdrop — click or Esc triggers onClose automatically */}
        <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Center the panel */}
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
          <TransitionChild
            as="div"
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className={panelClasses}>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 cursor-pointer rounded-full p-1 hover:bg-white/10 focus:ring-2 focus:ring-white focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>

              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Modal;
