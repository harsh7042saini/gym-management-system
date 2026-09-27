import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  specialization: "",
  experience: "",
};

function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [viewTrainer, setViewTrainer] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/trainers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch trainers");
      }

      setTrainers(data.trainers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingTrainer(null);
    setFormData(emptyForm);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (trainer) => {
    setEditingTrainer(trainer);

    setFormData({
      name: trainer.name || "",
      phone: trainer.phone || "",
      email: trainer.email || "",
      specialization: trainer.specialization || "",
      experience:
        trainer.experience !== undefined
          ? String(trainer.experience)
          : "",
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTrainer(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Trainer name and phone are required.");
      return;
    }

    try {
      const url = editingTrainer
        ? `${API_URL}/trainers/${editingTrainer._id}`
        : `${API_URL}/trainers`;

      const method = editingTrainer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          specialization: formData.specialization.trim(),
          experience:
            formData.experience === ""
              ? 0
              : Number(formData.experience),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingTrainer
              ? "Unable to update trainer"
              : "Unable to create trainer")
        );
      }

      setMessage(
        editingTrainer
          ? "Trainer updated successfully."
          : "Trainer added successfully."
      );

      closeModal();
      await fetchTrainers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivate = async (trainer) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${trainer.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/trainers/${trainer._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to deactivate trainer"
        );
      }

      setMessage("Trainer deactivated successfully.");

      if (viewTrainer?._id === trainer._id) {
        setViewTrainer(null);
      }

      await fetchTrainers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setSearch("");
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      trainer.name?.toLowerCase().includes(searchText) ||
      trainer.phone?.toLowerCase().includes(searchText) ||
      trainer.email?.toLowerCase().includes(searchText) ||
      trainer.specialization
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  const totalTrainers = trainers.length;

  const activeTrainers = trainers.filter(
    (trainer) => trainer.status === "Active"
  ).length;

  const inactiveTrainers = trainers.filter(
    (trainer) => trainer.status === "Inactive"
  ).length;

  const totalExperience = trainers.reduce(
    (total, trainer) =>
      total + Number(trainer.experience || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Mind Control Gym
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Trainers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage gym trainers and their professional details.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            + Add Trainer
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && !showModal && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Trainers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {totalTrainers}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              All trainer records
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Trainers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {activeTrainers}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Currently active
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Inactive Trainers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-500">
              {inactiveTrainers}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Deactivated records
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Experience
            </p>

            <h2 className="mt-2 text-3xl font-bold text-indigo-600">
              {totalExperience}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Combined years
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search Trainers
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, email or specialization..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Trainers Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Trainer Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredTrainers.length} trainer
                {filteredTrainers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>

              <p className="mt-4 text-sm text-slate-500">
                Loading trainers...
              </p>
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🏋
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No trainers found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add a trainer or change your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Trainer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Specialization
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Experience
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTrainers.map((trainer) => (
                    <tr
                      key={trainer._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                            {trainer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "T"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {trainer.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              Trainer
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">
                          {trainer.phone}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {trainer.email || "No email"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-700">
                          {trainer.specialization || "Not specified"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-semibold text-slate-800">
                          {trainer.experience || 0}
                        </span>

                        <span className="ml-1 text-sm text-slate-500">
                          years
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {trainer.status === "Active" ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setViewTrainer(trainer)
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              openEditModal(trainer)
                            }
                            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Edit
                          </button>

                          {trainer.status === "Active" && (
                            <button
                              onClick={() =>
                                handleDeactivate(trainer)
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingTrainer
                    ? "Edit Trainer"
                    : "Add New Trainer"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter trainer information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Trainer Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter trainer name"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="trainer@example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Specialization
                  </label>

                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g. Weight Training"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Experience (Years)
                  </label>

                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  {editingTrainer
                    ? "Update Trainer"
                    : "Add Trainer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Trainer Modal */}
      {viewTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Trainer Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Complete trainer information
                </p>
              </div>

              <button
                onClick={() => setViewTrainer(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
                  {viewTrainer.name
                    ?.charAt(0)
                    ?.toUpperCase() || "T"}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {viewTrainer.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {viewTrainer.specialization ||
                      "General Trainer"}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">
                    Phone
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {viewTrainer.phone}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">
                    Email
                  </span>

                  <span className="break-all text-right text-sm font-semibold text-slate-800">
                    {viewTrainer.email || "Not provided"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">
                    Specialization
                  </span>

                  <span className="text-right text-sm font-semibold text-slate-800">
                    {viewTrainer.specialization ||
                      "Not specified"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">
                    Experience
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {viewTrainer.experience || 0} years
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  {viewTrainer.status === "Active" ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-7">
                <button
                  onClick={() => setViewTrainer(null)}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trainers;