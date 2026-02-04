"use client";

import { useState, useRef, useEffect } from "react";

interface DropdownAction {
  label: string;
  onClick: () => void;
  className?: string;
}

interface DropdownMenuProps {
  actions: DropdownAction[];
}

export default function DropdownMenu({ actions }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX
      });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          style={{ top: `${position.top}px`, right: `${position.right}px` }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${action.className || "text-gray-700"}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
