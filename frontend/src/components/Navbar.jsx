import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="bg-base-100/80 backdrop-blur-md border-b border-base-300 fixed w-full top-0 z-40">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <Link
            to="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img src="/synccat_logo.svg" alt="SyncChat" className="h-9" />
          </Link>

          {authUser && (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="btn btn-sm btn-ghost gap-2">
                <User className="size-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button className="btn btn-sm btn-ghost gap-2" onClick={logout}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
