import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  age: "",
  address: "",
  membershipPlan: "",
  membershipType: "Single",
  membershipStart: "",
  membershipExpiry: "",
  membershipAmount: "",
};

function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  // --------------------------------------------------
  // GET MEMBERS
  // --------------------------------------------------

  const getMembers = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const query = searchValue.trim()
        ? `?search=${encodeURIComponent(searchValue.trim())}`
        : "";

      const response = await fetch(`${API_URL}/members${query}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch members.");
      }

      setMembers(data.members || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingMember(null);
    setShowForm(false);
  };

  // --------------------------------------------------
  // OPEN ADD MEMBER
  // --------------------------------------------------

  const handleAddMember = () => {
    setError("");
    setSuccess("");
    setEditingMember(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  // --------------------------------------------------
  // EDIT MEMBER
  // --------------------------------------------------

  const startEditing = (member) => {
    setError("");
    setSuccess("");

    setEditingMember(member);

    setFormData({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      gender: member.gender || "",
      age: member.age || "",
      address: member.address || "",
      membershipPlan: member.membershipPlan || "",
      membershipType: member.membershipType || "Single",
      membershipStart: member.membershipStart
        ? new Date(member.membershipStart).toISOString().split("T")[0]
        : "",
      membershipExpiry: member.membershipExpiry
        ? new Date(member.membershipExpiry).toISOString().split("T")[0]
        : "",
      membershipAmount:
        member.membershipAmount !== undefined
          ? member.membershipAmount
          : "",
    });

    setShowForm(true);
  };

  // --------------------------------------------------
  // SUBMIT FORM
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.gender ||
      !formData.age ||
      !formData.membershipPlan ||
      !formData.membershipStart ||
      !formData.membershipExpiry
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(formData.age) < 10 || Number(formData.age) > 100) {
      setError("Age must be between 10 and 100.");
      return;
    }

    if (formData.membershipAmount !== "") {
      if (Number(formData.membershipAmount) < 0) {
        setError("Membership amount cannot be negative.");
        return;
      }
    }

    if (
      formData.membershipExpiry &&
      formData.membershipStart &&
      new Date(formData.membershipExpiry) <
        new Date(formData.membershipStart)
    ) {
      setError("Membership expiry date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Exact field names matching backend Member model/controller
      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        age: Number(formData.age),
        address: formData.address.trim(),
        membershipPlan: formData.membershipPlan,
        membershipType: formData.membershipType,
        membershipStart: formData.membershipStart,
        membershipExpiry: formData.membershipExpiry,
        membershipAmount:
          formData.membershipAmount === ""
            ? 0
            : Number(formData.membershipAmount),
      };

      let response;

      if (editingMember) {
        response = await fetch(
          `${API_URL}/members/${editingMember._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(memberData),
          }
        );
      } else {
        response = await fetch(`${API_URL}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(memberData),
        });
      }

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to save member."
        );
      }

      setSuccess(
        editingMember
          ? "Member updated successfully."
          : "Member added successfully."
      );

      resetForm();

      await getMembers(search);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE / DEACTIVATE MEMBER
  // --------------------------------------------------

  const handleDeleteMember = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to deactivate this member?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/members/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to deactivate member."
        );
      }

      setSuccess(
        data.message || "Member deactivated successfully."
      );

      await getMembers(search);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = async (e) => {
    e.preventDefault();
    await getMembers(search);
  };

  const handleResetSearch = async () => {
    setSearch("");
    await getMembers("");
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------

  const getStatusClass = (status) => {
    if (status === "Active") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    if (status === "Expired") {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    }

    return "bg-slate-100 text-slate-600 border border-slate-200";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-1">
              Gym Management
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Members
            </h1>

            <p className="text-slate-500 mt-1">
              Manage gym members, memberships and records.
            </p>
          </div>

          <button
            onClick={handleAddMember}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <span className="text-xl leading-none">+</span>
            Add Member
          </button>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SEARCH CARD */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 md:flex-row"
          >
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleResetSearch}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </form>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Members
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {members.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active Members
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {
                members.filter(
                  (member) => member.status === "Active"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Inactive / Expired
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-700">
              {
                members.filter(
                  (member) => member.status !== "Active"
                ).length
              }
            </p>
          </div>
        </div>

        {/* MEMBERS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Member Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {members.length} member
              {members.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>

                <p className="text-sm text-slate-500">
                  Loading members...
                </p>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                👥
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                No members found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Add your first gym member to start managing
                member records.
              </p>

              <button
                onClick={handleAddMember}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Add First Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Member
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Plan
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Start Date
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Expiry
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      {/* MEMBER */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                            {member.name
                              ?.charAt(0)
                              ?.toUpperCase() || "M"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {member.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {member.gender} • {member.age} years
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-800">
                          {member.email}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {member.phone}
                        </p>
                      </td>

                      {/* PLAN */}
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-800">
                          {member.membershipPlan}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {member.membershipType}
                        </p>
                      </td>

                      {/* START */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatDate(member.membershipStart)}
                      </td>

                      {/* EXPIRY */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatDate(member.membershipExpiry)}
                      </td>

                      {/* AMOUNT */}
                      <td className="px-6 py-5">
                        <span className="font-semibold text-slate-800">
                          ₹
                          {Number(
                            member.membershipAmount || 0
                          ).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            member.status
                          )}`}
                        >
                          {member.status || "Active"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setViewingMember(member)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              startEditing(member)
                            }
                            className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Edit
                          </button>

                          {member.status !== "Inactive" && (
                            <button
                              onClick={() =>
                                handleDeleteMember(member._id)
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
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

      {/* ==================================================
          ADD / EDIT MEMBER MODAL
      ================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingMember
                    ? "Edit Member"
                    : "Add New Member"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingMember
                    ? "Update member information."
                    : "Enter member details to create a new record."}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-7 p-6"
            >
              {/* PERSONAL DETAILS */}
              <div>
                <div className="mb-4">
                  <h3 className="font-bold text-slate-900">
                    Personal Details
                  </h3>

                  <p className="text-sm text-slate-500">
                    Basic information about the gym member.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* NAME */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter member name"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email *
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="member@example.com"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone Number *
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* AGE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Age *
                    </label>

                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="10"
                      max="100"
                      placeholder="Enter age"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* GENDER */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Gender *
                    </label>

                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">
                        Select gender
                      </option>

                      <option value="Male">Male</option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* ADDRESS */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Address
                    </label>

                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>

              {/* MEMBERSHIP DETAILS */}
              <div>
                <div className="mb-4">
                  <h3 className="font-bold text-slate-900">
                    Membership Details
                  </h3>

                  <p className="text-sm text-slate-500">
                    Select membership plan and validity dates.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* PLAN */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Membership Plan *
                    </label>

                    <select
                      name="membershipPlan"
                      value={formData.membershipPlan}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">
                        Select membership plan
                      </option>

                      <option value="1 Month">
                        1 Month
                      </option>

                      <option value="3 Months">
                        3 Months
                      </option>

                      <option value="6 Months">
                        6 Months
                      </option>

                      <option value="12 Months">
                        12 Months
                      </option>
                    </select>
                  </div>

                  {/* MEMBERSHIP TYPE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Membership Type
                    </label>

                    <select
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="Single">
                        Single
                      </option>

                      <option value="Couple">
                        Couple
                      </option>
                    </select>
                  </div>

                  {/* START DATE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Membership Start Date *
                    </label>

                    <input
                      type="date"
                      name="membershipStart"
                      value={formData.membershipStart}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* EXPIRY DATE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Membership Expiry Date *
                    </label>

                    <input
                      type="date"
                      name="membershipExpiry"
                      value={formData.membershipExpiry}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* AMOUNT */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Membership Amount
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="membershipAmount"
                        value={formData.membershipAmount}
                        onChange={handleChange}
                        min="0"
                        placeholder="Enter amount"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingMember
                    ? "Update Member"
                    : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          VIEW MEMBER MODAL
      ================================================== */}

      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Member Profile
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {viewingMember.name}
                </h2>
              </div>

              <button
                onClick={() => setViewingMember(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {/* PROFILE */}
            <div className="p-6">
              <div className="mb-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
                  {viewingMember.name
                    ?.charAt(0)
                    ?.toUpperCase() || "M"}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {viewingMember.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {viewingMember.email}
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      viewingMember.status
                    )}`}
                  >
                    {viewingMember.status || "Active"}
                  </span>
                </div>
              </div>

              {/* INFORMATION GRID */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingMember.phone || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Gender
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingMember.gender || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Age
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingMember.age || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Membership Type
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingMember.membershipType || "Single"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Membership Plan
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingMember.membershipPlan || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Membership Amount
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    ₹
                    {Number(
                      viewingMember.membershipAmount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Start Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(
                      viewingMember.membershipStart
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Expiry Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(
                      viewingMember.membershipExpiry
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Address
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingMember.address || "Not provided"}
                  </p>
                </div>
              </div>

              {/* CLOSE */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingMember(null)}
                  className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
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

export default Members;