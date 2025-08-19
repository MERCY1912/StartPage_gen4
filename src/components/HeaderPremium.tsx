import PricingModal from '../components/PricingModal';
import { useState } from 'react';

function HeaderPremium() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 lg:px-6 py-2 text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg text-sm lg:text-base"
        style={{ background: 'linear-gradient(90deg, #b94b72, #f3c6c6)' }}
      >
        Премиум
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export default HeaderPremium;
