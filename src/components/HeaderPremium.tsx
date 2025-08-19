import PricingModal from '../components/PricingModal';
import { useState } from 'react';

function HeaderPremium() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative group px-3 py-2"
      >
        <span className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 group-hover:opacity-90 transition-opacity duration-300">
          Премиум
        </span>
        <span className="absolute bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-center"></span>
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export default HeaderPremium;
