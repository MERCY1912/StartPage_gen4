import PricingModal from '../components/PricingModal';
import { useState } from 'react';

function HeaderPremium() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex items-center space-x-2 transition-opacity duration-300 hover:opacity-80"
      >
        <img src="https://blog.femmify.me/wp-content/uploads/2025/08/vip-c.png" alt="" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-teal-400 animate-gradient-x">
          Премиум
        </span>
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out origin-left"></span>
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export default HeaderPremium;
