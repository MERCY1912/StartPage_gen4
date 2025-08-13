import PricingModal from '../components/PricingModal';
import { useState } from 'react';

function HeaderPremium() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent-vibrant to-secondary-dark animate-gradient-x transition-opacity duration-300 hover:opacity-80"
      >
        Премиум
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export default HeaderPremium;
