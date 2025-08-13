import PricingModal from '../components/PricingModal';
import { useState } from 'react';

function HeaderPremium() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-accent-vibrant/30 bg-gradient-to-r from-accent-vibrant to-secondary-dark hover:shadow-xl hover:shadow-accent-vibrant/50 text-sm font-medium animate-gradient-x"
      >
        Премиум
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export default HeaderPremium;
