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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative w-full max-w-lg mx-4 rounded-xl bg-white p-8 shadow-2xl border border-gray-200">
            <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-500 text-red-500 font-bold text-xl hover:bg-red-500 hover:text-white transition"
            >
            ×
            </button>

            <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>

            <div>{children}</div>
        </div>
    </div>


  );
}
