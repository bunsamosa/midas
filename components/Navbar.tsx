import { Button } from "components/ui/button";
import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export function Navbar() {
  const { handleLogOut } = useDynamicContext();
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    try {
      await handleLogOut();
      // Redirect to the home page or login page after logout
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      // Handle logout error (e.g., show an error message to the user)
    }
  };

  return (
    <nav className="flex items-center justify-between w-full p-4">
      <div className="text-xl font-bold">
                        <NavLink to="/">Midas</NavLink>
      </div>
      <div className="flex-auto flex justify-center space-x-8">
        <NavLink
          to="/connect"
          style={{ padding: '0.5rem 0.75rem' }}
          className={({ isActive }) =>
            `rounded-md transition-all duration-200 ${isActive
              ? "font-bold bg-gray-100 text-blue-600"
              : "hover:bg-gray-100 hover:shadow-md hover:text-blue-600"
            }`
          }
        >
          Connect
        </NavLink>
        <NavLink
          to="/home"
          style={{ padding: '0.5rem 0.75rem' }}
          className={({ isActive }) =>
            `rounded-md transition-all duration-200 ${
              isActive
                ? "font-bold bg-gray-100 text-blue-600"
                : "hover:bg-gray-100 hover:shadow-md hover:text-blue-600"
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/agents"
          style={{ padding: '0.5rem 0.75rem' }}
          className={({ isActive }) =>
            `rounded-md transition-all duration-200 ${
              isActive
                ? "font-bold bg-gray-100 text-blue-600"
                : "hover:bg-gray-100 hover:shadow-md hover:text-blue-600"
            }`
          }
        >
          Agents
        </NavLink>
        <NavLink
          to="/swap"
          style={{ padding: '0.5rem 0.75rem' }}
          className={({ isActive }) =>
            `rounded-md transition-all duration-200 ${
              isActive
                ? "font-bold bg-gray-100 text-blue-600"
                : "hover:bg-gray-100 hover:shadow-md hover:text-blue-600"
            }`
          }
        >
          Swap
        </NavLink>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent"
        onClick={handleLogoutClick}
      >
        <LogOut
          className="h-5 w-5"
          color="#EF4444"
          style={{
            transition: 'color 0.2s ease-in-out',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#B91C1C'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#EF4444'}
        />
      </Button>
    </nav>
  );
}
