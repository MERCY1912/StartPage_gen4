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
        <div className="flex items-center space-x-2">
          <img src="http://blog.femmify.me/wp-content/uploads/2025/08/About-femm.png" alt="" className="w-5 h-5" />
          <span className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-[linear-gradient(90deg,#ff9a8b,#ff6a88,#ffcc70,#ff9a8b)] bg-[size:300%_300%] animate-shine group-hover:opacity-90 transition-opacity duration-300">
            Премиум
          </span>
        </div>
        <span className="absolute bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#ff9a8b] via-[#ff6a88] to-[#ffcc70] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-center"></span>
      </button>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
export default HeaderPremium;
