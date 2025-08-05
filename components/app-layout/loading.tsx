import { Loader2 } from "lucide-react";

function NavigationLoading() {
  return (
    <div className="fixed z-[999] top-0 left-0 right-0 bottom-0 bg-white/30 backdrop-blur-sm">
      <Loader2 className="w-10 h-10 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin " />
    </div>
  );
}

export default NavigationLoading;
