import React, { useEffect } from 'react';
import { ConnectionPanel } from '../ConnectionPanel';
import { GlobalSettings } from '../GlobalSettings';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] flex flex-col w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary uppercase">I/O_INTERFACE_PORT</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            title="Close settings"
            className="material-symbols-outlined text-tertiary opacity-70 hover:opacity-100 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            close
          </button>
        </div>
        <div className="space-y-6">
          <ConnectionPanel />
          <GlobalSettings />
        </div>
      </div>
    </div>
  );
};
