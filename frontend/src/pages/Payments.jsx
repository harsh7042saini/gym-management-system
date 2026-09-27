import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

const initialFormData = {
  member: "",
  amount: "",
  paymentDate: "",
  paymentMethod: "Cash",
  status: "Paid",
  nextDueDate: "",
  notes: "",
};

function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  // --------------------------------------------------
  // GET AUTH TOKEN
  // --------------------------------------------------

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // --------------------------------------------------
  // GET PAYMENTS
  // --------------------------------------------------

  const getPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/payments`, {
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
        throw new Error(
          data.message || "Unable to fetch payments."
        );
      }

      setPayments(data.payments || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // GET MEMBERS
  // --------------------------------------------------

  const getMembers = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/members`, {
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
        throw new Error(
          data.message || "Unable to fetch members."
        );
      }

      setMembers(data.members || []);
    } catch (err) {
      setError(err.message || "Unable to load members.");
    }
  };

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    getPayments();
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
    setShowForm(false);
  };

  // --------------------------------------------------
  // OPEN ADD PAYMENT
  // --------------------------------------------------

  const handleAddPayment = () => {
    setError("");
    setSuccess("");

    const today = new Date().toISOString().split("T")[0];

    setFormData({
      ...initialFormData,
      paymentDate: today,
    });

    setShowForm(true);
  };

  // --------------------------------------------------
  // CREATE PAYMENT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.member) {
      setError("Please select a member.");
      return;
    }

    if (formData.amount === "") {
      setError("Please enter payment amount.");
      return;
    }

    if (Number(formData.amount) < 0) {
      setError("Payment amount cannot be negative.");
      return;
    }

    if (!formData.paymentDate) {
      setError("Please select payment date.");
      return;
    }

    if (
      formData.nextDueDate &&
      new Date(formData.nextDueDate) <
        new Date(formData.paymentDate)
    ) {
      setError(
        "Next due date cannot be before payment date."
      );
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const paymentData = {
        member: formData.member,
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        nextDueDate: formData.nextDueDate || null,
        notes: formData.notes.trim(),
      };

      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
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
            "Unable to create payment."
        );
      }

      setSuccess(
        data.message || "Payment record created successfully."
      );

      resetForm();

      await getPayments();

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
  // SEARCH + FILTER
  // --------------------------------------------------

  const filteredPayments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const memberName =
        payment.member?.name?.toLowerCase() || "";

      const memberEmail =
        payment.member?.email?.toLowerCase() || "";

      const memberPhone =
        payment.member?.phone?.toLowerCase() || "";

      const method =
        payment.paymentMethod?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        memberName.includes(searchValue) ||
        memberEmail.includes(searchValue) ||
        memberPhone.includes(searchValue) ||
        method.includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

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
  // FORMAT CURRENCY
  // --------------------------------------------------

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  // --------------------------------------------------
  // PAYMENT METHOD STYLE
  // --------------------------------------------------

  const getMethodClass = (method) => {
    if (method === "UPI") {
      return "bg-violet-50 text-violet-700";
    }

    if (method === "Card") {
      return "bg-blue-50 text-blue-700";
    }

    if (method === "Bank Transfer") {
      return "bg-cyan-50 text-cyan-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const totalPayments = payments.length;

  const paidPayments = payments.filter(
    (payment) => payment.status === "Paid"
  );

  const duePayments = payments.filter(
    (payment) => payment.status === "Due"
  );

  const totalRevenue = paidPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const totalDue = duePayments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-indigo-600">
              Gym Management
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Payments
            </h1>

            <p className="mt-1 text-slate-500">
              Track membership payments, dues and payment history.
            </p>
          </div>

          <button
            onClick={handleAddPayment}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <span className="text-xl leading-none">+</span>
            Add Payment
          </button>
        </div>

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL PAYMENTS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Payments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalPayments}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              All payment records
            </p>
          </div>

          {/* REVENUE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Revenue
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {formatAmount(totalRevenue)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              From paid payments
            </p>
          </div>

          {/* PAID */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Paid Records
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {paidPayments.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Successfully paid
            </p>
          </div>

          {/* DUE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Due Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {formatAmount(totalDue)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Pending payment amount
            </p>
          </div>
        </div>

        {/* ==================================================
            SEARCH + FILTER
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member name, email, phone or payment method..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* STATUS FILTER */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Due">Due</option>
            </select>

            {/* CLEAR */}

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ==================================================
            PAYMENT TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Payment Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredPayments.length} payment
              {filteredPayments.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>

                <p className="text-sm text-slate-500">
                  Loading payments...
                </p>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                ₹
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                No payment records found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                {payments.length === 0
                  ? "Add your first payment record to start tracking gym payments."
                  : "Try changing your search or status filter."}
              </p>

              {payments.length === 0 && (
                <button
                  onClick={handleAddPayment}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  Add First Payment
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Member
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Payment Date
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Method
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Next Due
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      {/* MEMBER */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                            {payment.member?.name
                              ?.charAt(0)
                              ?.toUpperCase() || "M"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {payment.member?.name ||
                                "Unknown Member"}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {payment.member?.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* AMOUNT */}

                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900">
                          {formatAmount(payment.amount)}
                        </p>
                      </td>

                      {/* DATE */}

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatDate(payment.paymentDate)}
                      </td>

                      {/* METHOD */}

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getMethodClass(
                            payment.paymentMethod
                          )}`}
                        >
                          {payment.paymentMethod}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      {/* NEXT DUE */}

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {payment.nextDueDate
                          ? formatDate(payment.nextDueDate)
                          : "-"}
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            setViewingPayment(payment)
                          }
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          View
                        </button>
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
          ADD PAYMENT MODAL
      ================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Payment Management
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Add Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new payment record for a gym member.
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
              className="space-y-6 p-6"
            >
              {/* MEMBER */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Member *
                </label>

                <select
                  name="member"
                  value={formData.member}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">
                    Select a member
                  </option>

                  {members.map((member) => (
                    <option
                      key={member._id}
                      value={member._id}
                    >
                      {member.name} — {member.phone}
                    </option>
                  ))}
                </select>

                {members.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No members available. Please add a member
                    first.
                  </p>
                )}
              </div>

              {/* AMOUNT + METHOD */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* AMOUNT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Amount *
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      min="0"
                      placeholder="Enter amount"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* PAYMENT METHOD */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Cash">Cash</option>

                    <option value="UPI">UPI</option>

                    <option value="Card">Card</option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                  </select>
                </div>
              </div>

              {/* PAYMENT DATE + STATUS */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* PAYMENT DATE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Date *
                  </label>

                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Paid">Paid</option>

                    <option value="Due">Due</option>
                  </select>
                </div>
              </div>

              {/* NEXT DUE DATE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Next Due Date
                </label>

                <input
                  type="date"
                  name="nextDueDate"
                  value={formData.nextDueDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Optional. Useful for tracking the next membership
                  payment.
                </p>
              </div>

              {/* NOTES */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Add any payment-related notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
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
                  disabled={saving || members.length === 0}
                  className="rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Add Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          VIEW PAYMENT MODAL
      ================================================== */}

      {viewingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Payment Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Payment Record
                </h2>
              </div>

              <button
                onClick={() => setViewingPayment(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {/* PAYMENT CONTENT */}

            <div className="p-6">
              {/* AMOUNT HEADER */}

              <div className="mb-6 rounded-2xl bg-indigo-50 p-6 text-center">
                <p className="text-sm font-medium text-indigo-600">
                  Payment Amount
                </p>

                <p className="mt-2 text-4xl font-bold text-indigo-700">
                  {formatAmount(viewingPayment.amount)}
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    viewingPayment.status
                  )}`}
                >
                  {viewingPayment.status}
                </span>
              </div>

              {/* MEMBER */}

              <div className="mb-6 rounded-2xl border border-slate-200 p-5">
                <p className="mb-4 text-sm font-bold text-slate-900">
                  Member Information
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
                    {viewingPayment.member?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "M"}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      {viewingPayment.member?.name ||
                        "Unknown Member"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {viewingPayment.member?.email || "-"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {viewingPayment.member?.phone || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PAYMENT INFORMATION */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(
                      viewingPayment.paymentDate
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment Method
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingPayment.paymentMethod || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Membership Plan
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingPayment.member?.membershipPlan ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Next Due Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingPayment.nextDueDate
                      ? formatDate(
                          viewingPayment.nextDueDate
                        )
                      : "Not set"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {viewingPayment.notes || "No notes added."}
                  </p>
                </div>
              </div>

              {/* CLOSE */}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingPayment(null)}
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

export default Payments;