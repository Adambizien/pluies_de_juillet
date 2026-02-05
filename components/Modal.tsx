import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className={`relative w-full ${widthClasses[maxWidth]} rounded-xl bg-white p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto`}>
            <button
            onClick={onClose}
            aria-label="Fermer"
            className="sticky -top-2 sm:-top-3 -right-2 sm:-right-3 float-right flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-red-500 text-red-500 font-bold text-lg sm:text-xl hover:bg-red-500 hover:text-white transition bg-white z-10 shadow-md mb-2"
            >
            ×
            </button>

            <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 pr-8">{title}</h2>
            </div>

            <div>{children}</div>
        </div>
    </div>


  );
}
