import { Link } from "react-router-dom";
import { Activity, LogIn, UserPlus } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (err) {
      console.error("Error during logout:", err);
    }
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50">
      <div className="navbar px-4 min-h-[4rem] justify-between">
        {/* Logo */}
        <div className="flex-none">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Activity className="size-9 text-primary" />
              <span className="font-semibold font-mono tracking-widest text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Incident Management
              </span>
            </div>
          </Link>
        </div>
        {/* Right side navigation */}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="btn btn-primary btn-sm">
                <LogIn size={18} />
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary btn-sm">
                <UserPlus size={18} />
                Register
              </Link>
            </div>
          )}
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
