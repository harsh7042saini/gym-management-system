import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getDashboardStats } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardStats();

        console.log("Dashboard stats:", data);

        setStats(data.stats);
        setRecentMembers(data.recentMembers || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const statCards = [
    {
      title: "Total Members",
      value: stats?.totalMembers ?? 0,
      icon: "👥",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
      description: "Registered gym members",
    },
    {
      title: "Active Members",
      value: stats?.activeMembers ?? 0,
      icon: "✓",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      description: "Currently active members",
    },
    {
      title: "Total Trainers",
      value: stats?.totalTrainers ?? 0,
      icon: "🏋",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
      description: "Available gym trainers",
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue ?? 0}`,
      icon: "₹",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
      description: "Recorded payment revenue",
    },
  ];

  const quickActions = [
    {
      title: "Manage Members",
      description: "Add, edit and search gym members",
      icon: "👤",
      path: "/members",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
    },
    {
      title: "Manage Payments",
      description: "Track fees and payment records",
      icon: "💳",
      path: "/payments",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
    },
    {
      title: "Workout Plans",
      description: "Create and manage workout plans",
      icon: "💪",
      path: "/workouts",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">
                Mind Control Gym
              </p>

              <h2 className="text-2xl font-bold text-slate-900">
                Dashboard
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Manage your gym activities from one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800">
                  Administrator
                </p>

                <p className="text-xs text-slate-500">
                  Gym Admin
                </p>
              </div>

              <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="p-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-7 text-white shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-indigo-200 text-sm font-medium">
                  Welcome back, Administrator
                </p>

                <h1 className="text-3xl font-bold mt-1">
                  Keep Mind Control Gym moving forward.
                </h1>

                <p className="text-indigo-100 text-sm mt-3 max-w-2xl">
                  Manage members, payments, trainers and personalized
                  workout plans through your centralized gym management
                  system.
                </p>
              </div>

              <button
                onClick={() => navigate("/members")}
                className="w-fit px-5 py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition shadow-sm"
              >
                + Add Member
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                !
              </span>

              <div>
                <p className="font-semibold">
                  Unable to load dashboard
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Overview
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Current gym statistics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {statCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>

                      {loading ? (
                        <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse mt-3" />
                      ) : (
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">
                          {card.value}
                        </h3>
                      )}

                      <p className="text-xs text-slate-400 mt-2">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconText} flex items-center justify-center text-xl font-bold`}
                    >
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Workout Plans
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {loading ? "..." : stats?.totalWorkoutPlans ?? 0}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Active workout plans
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Due Payments
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {loading ? "..." : stats?.duePayments ?? 0}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Payment records requiring attention
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Expiring Soon
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {loading ? "..." : stats?.expiringSoon ?? 0}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Memberships nearing expiry
              </p>
            </div>
          </div>

          {/* Recent Members */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Recent Members
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Recently registered gym members
                </p>
              </div>

              <button
                onClick={() => navigate("/members")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All →
              </button>
            </div>

            {recentMembers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2">
                  👥
                </div>

                <p className="font-semibold text-slate-700">
                  No members found
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Add members to see them here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Member
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Phone
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Plan
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Expiry
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentMembers.map((member) => (
                      <tr
                        key={member._id}
                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {member.name}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {member.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {member.phone}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {member.membershipPlan}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(
                            member.membershipExpiry
                          ).toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              member.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                Quick Actions
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Quickly access the most important gym operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 text-left hover:shadow-md hover:border-indigo-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl ${action.iconBg} ${action.iconText} flex items-center justify-center text-xl`}
                    >
                      {action.icon}
                    </div>

                    <span className="text-slate-300 group-hover:text-indigo-500 text-xl transition">
                      →
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 mt-5">
                    {action.title}
                  </h4>

                  <p className="text-sm text-slate-500 mt-1 leading-6">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* System Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
                    About the system
                  </p>

                  <h3 className="text-2xl font-bold text-slate-900 mt-2">
                    Mind Control Gym
                  </h3>

                  <p className="text-slate-500 text-sm mt-3 leading-6 max-w-2xl">
                    A centralized gym management platform designed to
                    simplify member records, payment tracking, trainer
                    management and workout plan management.
                  </p>
                </div>

                <div className="hidden sm:flex w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 items-center justify-center text-xl">
                  🏋
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500">
                    Location
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    Sector 49, Faridabad
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500">
                    Management
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    Centralized System
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500">
                    Platform
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    Web Application
                  </p>
                </div>
              </div>
            </div>

            {/* System Modules */}
            <div className="bg-slate-950 rounded-2xl p-7 text-white shadow-sm">
              <p className="text-indigo-400 text-xs font-bold tracking-wider uppercase">
                System Modules
              </p>

              <h3 className="text-xl font-bold mt-2">
                Everything in one place
              </h3>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    👥
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Members
                    </p>

                    <p className="text-xs text-slate-400">
                      Member records & memberships
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    ₹
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Payments
                    </p>

                    <p className="text-xs text-slate-400">
                      Fees & payment tracking
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    🏋
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Trainers
                    </p>

                    <p className="text-xs text-slate-400">
                      Trainer management
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    💪
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Workout Plans
                    </p>

                    <p className="text-xs text-slate-400">
                      Personalized workout plans
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Mind Control Gym Management System
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Centralized management for a better gym experience
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;