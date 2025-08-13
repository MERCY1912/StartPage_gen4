import PricingModal from '../components/PricingModal';
import { useState } from 'react';

function HeaderPremium() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-primary/30 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/50 text-sm font-medium"
      >
        Премиум
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export default HeaderPremium;
