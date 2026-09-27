import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      name: "Members",
      path: "/members",
      icon: "👥",
    },
    {
      name: "Payments",
      path: "/payments",
      icon: "₹",
    },
    {
      name: "Trainers",
      path: "/trainers",
      icon: "🏋",
    },
    {
      name: "Workout Plans",
      path: "/workouts",
      icon: "💪",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white flex flex-col">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">
          Mind Control
        </h1>

        <p className="text-xs text-slate-400 mt-1">
          Gym Management
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span className="w-6 text-center">
              {item.icon}
            </span>

            <span className="font-medium">
              {item.name}
            </span>
          </NavLink>
        ))}

      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-800">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <span>↪</span>
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;