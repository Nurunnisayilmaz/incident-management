import { Link } from "react-router-dom";
import { Activity   } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

function Navbar() {
  return (
    <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50">
      <div className="navbar px-4 min-h-[4rem] justify-between">
        {/* Logo */}
        <div className="flex-none">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Activity   className="size-9 text-primary" />
              <span className="font-semibold font-mono tracking-widest text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Incident Management
              </span>
            </div>
          </Link>
        </div>
        {/* Right side navigation */}
        <div className="flex items-center gap-4">
          <ThemeSelector />
        </div>
        

      </div>
    </div>
  );
}

export default Navbar;
