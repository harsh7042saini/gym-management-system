import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

const emptyExercise = {
  exerciseName: "",
  sets: "",
  reps: "",
  duration: "",
  instructions: "",
};

const emptyForm = {
  member: "",
  trainer: "",
  planName: "",
  goal: "",
  exercises: [],
  notes: "",
};

function Workouts() {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [viewPlan, setViewPlan] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [exerciseForm, setExerciseForm] =
    useState(emptyExercise);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/members`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch members"
        );
      }

      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetch(`${API_URL}/trainers`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch trainers"
        );
      }

      setTrainers(data.trainers || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/workouts`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch workout plans"
        );
      }

      setWorkoutPlans(data.workoutPlans || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlans();
    fetchMembers();
    fetchTrainers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExerciseInputChange = (e) => {
    const { name, value } = e.target;

    setExerciseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addExercise = () => {
    if (!exerciseForm.exerciseName.trim()) {
      setError("Exercise name is required.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseName: exerciseForm.exerciseName.trim(),
          sets:
            exerciseForm.sets === ""
              ? 0
              : Number(exerciseForm.sets),
          reps:
            exerciseForm.reps === ""
              ? 0
              : Number(exerciseForm.reps),
          duration: exerciseForm.duration.trim(),
          instructions:
            exerciseForm.instructions.trim(),
        },
      ],
    }));

    setExerciseForm(emptyExercise);
    setError("");
  };

  const removeExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter(
        (_, exerciseIndex) => exerciseIndex !== index
      ),
    }));
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setFormData(emptyForm);
    setExerciseForm(emptyExercise);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);

    setFormData({
      member: plan.member?._id || plan.member || "",
      trainer: plan.trainer?._id || plan.trainer || "",
      planName: plan.planName || "",
      goal: plan.goal || "",
      exercises: Array.isArray(plan.exercises)
        ? plan.exercises.map((exercise) => ({
            exerciseName: exercise.exerciseName || "",
            sets: exercise.sets || 0,
            reps: exercise.reps || 0,
            duration: exercise.duration || "",
            instructions: exercise.instructions || "",
          }))
        : [],
      notes: plan.notes || "",
    });

    setExerciseForm(emptyExercise);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData(emptyForm);
    setExerciseForm(emptyExercise);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.member) {
      setError("Please select a member.");
      return;
    }

    if (!formData.planName.trim()) {
      setError("Workout plan name is required.");
      return;
    }

    try {
      const url = editingPlan
        ? `${API_URL}/workouts/${editingPlan._id}`
        : `${API_URL}/workouts`;

      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          member: formData.member,
          trainer: formData.trainer || null,
          planName: formData.planName.trim(),
          goal: formData.goal.trim(),
          exercises: formData.exercises,
          notes: formData.notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingPlan
              ? "Unable to update workout plan"
              : "Unable to create workout plan")
        );
      }

      setMessage(
        editingPlan
          ? "Workout plan updated successfully."
          : "Workout plan created successfully."
      );

      closeModal();
      await fetchWorkoutPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (plan) => {
    const memberName =
      plan.member?.name || "this member";

    const confirmed = window.confirm(
      `Are you sure you want to delete the workout plan for ${memberName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/workouts/${plan._id}`,
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
          data.message || "Unable to delete workout plan"
        );
      }

      setMessage("Workout plan deleted successfully.");

      if (viewPlan?._id === plan._id) {
        setViewPlan(null);
      }

      await fetchWorkoutPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setSearch("");
  };

  const filteredPlans = workoutPlans.filter((plan) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      plan.planName?.toLowerCase().includes(searchText) ||
      plan.goal?.toLowerCase().includes(searchText) ||
      plan.member?.name
        ?.toLowerCase()
        .includes(searchText) ||
      plan.trainer?.name
        ?.toLowerCase()
        .includes(searchText) ||
      plan.trainer?.specialization
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  const totalPlans = workoutPlans.length;

  const totalExercises = workoutPlans.reduce(
    (total, plan) =>
      total +
      (Array.isArray(plan.exercises)
        ? plan.exercises.length
        : 0),
    0
  );

  const assignedTrainers = new Set(
    workoutPlans
      .filter((plan) => plan.trainer?._id)
      .map((plan) => plan.trainer._id)
  ).size;

  const membersWithPlans = new Set(
    workoutPlans
      .filter((plan) => plan.member?._id)
      .map((plan) => plan.member._id)
  ).size;

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
              Workout Plans
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage personalized workout plans
              for gym members.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            + Create Workout Plan
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
              Total Plans
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {totalPlans}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Created workout plans
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Members Covered
            </p>

            <h2 className="mt-2 text-3xl font-bold text-indigo-600">
              {membersWithPlans}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Members with plans
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Exercises
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {totalExercises}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Across all plans
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Trainers Assigned
            </p>

            <h2 className="mt-2 text-3xl font-bold text-purple-600">
              {assignedTrainers}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Trainers with plans
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search Workout Plans
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by plan, member, goal or trainer..."
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

        {/* Plans */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Workout Plan Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredPlans.length} plan
                {filteredPlans.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>

              <p className="mt-4 text-sm text-slate-500">
                Loading workout plans...
              </p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                💪
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No workout plans found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create a workout plan or change your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Plan
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Member
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Trainer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Goal
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Exercises
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr
                      key={plan._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          {plan.planName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {plan.notes
                            ? "Notes available"
                            : "No additional notes"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-800">
                          {plan.member?.name ||
                            "Unknown Member"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {plan.member?.phone || "No phone"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        {plan.trainer ? (
                          <>
                            <p className="text-sm font-semibold text-slate-800">
                              {plan.trainer.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {plan.trainer.specialization ||
                                "Trainer"}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {plan.goal || "General Fitness"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-semibold text-slate-800">
                          {plan.exercises?.length || 0}
                        </span>

                        <span className="ml-1 text-sm text-slate-500">
                          exercise
                          {plan.exercises?.length !== 1
                            ? "s"
                            : ""}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewPlan(plan)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              openEditModal(plan)
                            }
                            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(plan)
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
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
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingPlan
                    ? "Edit Workout Plan"
                    : "Create Workout Plan"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a personalized exercise plan for a
                  member.
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

              {/* Basic Details */}
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Plan Details
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Select the member and trainer for this plan.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Member *
                  </label>

                  <select
                    name="member"
                    value={formData.member}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">
                      Select Member
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
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Trainer
                  </label>

                  <select
                    name="trainer"
                    value={formData.trainer}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">
                      No Trainer Assigned
                    </option>

                    {trainers
                      .filter(
                        (trainer) =>
                          trainer.status === "Active"
                      )
                      .map((trainer) => (
                        <option
                          key={trainer._id}
                          value={trainer._id}
                        >
                          {trainer.name}
                          {trainer.specialization
                            ? ` — ${trainer.specialization}`
                            : ""}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Plan Name *
                  </label>

                  <input
                    type="text"
                    name="planName"
                    value={formData.planName}
                    onChange={handleInputChange}
                    placeholder="e.g. Weight Loss Program"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Goal
                  </label>

                  <input
                    type="text"
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    placeholder="e.g. Weight Loss, Muscle Gain"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Exercises */}
              <div className="mt-8 border-t border-slate-200 pt-7">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Exercises
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Add exercises with sets, reps and
                      instructions.
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {formData.exercises.length} Added
                  </span>
                </div>

                {/* Exercise Input */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Exercise Name *
                      </label>

                      <input
                        type="text"
                        name="exerciseName"
                        value={exerciseForm.exerciseName}
                        onChange={handleExerciseInputChange}
                        placeholder="e.g. Bench Press"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Sets
                      </label>

                      <input
                        type="number"
                        name="sets"
                        value={exerciseForm.sets}
                        onChange={handleExerciseInputChange}
                        placeholder="3"
                        min="0"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Reps
                      </label>

                      <input
                        type="number"
                        name="reps"
                        value={exerciseForm.reps}
                        onChange={handleExerciseInputChange}
                        placeholder="12"
                        min="0"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Duration
                      </label>

                      <input
                        type="text"
                        name="duration"
                        value={exerciseForm.duration}
                        onChange={handleExerciseInputChange}
                        placeholder="30 sec"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Instructions
                      </label>

                      <input
                        type="text"
                        name="instructions"
                        value={exerciseForm.instructions}
                        onChange={handleExerciseInputChange}
                        placeholder="Enter exercise instructions..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addExercise}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        + Add Exercise
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exercise List */}
                {formData.exercises.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {formData.exercises.map(
                      (exercise, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                                  {index + 1}
                                </div>

                                <div>
                                  <h4 className="font-bold text-slate-900">
                                    {exercise.exerciseName}
                                  </h4>

                                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                                    {exercise.sets > 0 && (
                                      <span>
                                        {exercise.sets} sets
                                      </span>
                                    )}

                                    {exercise.reps > 0 && (
                                      <span>
                                        • {exercise.reps} reps
                                      </span>
                                    )}

                                    {exercise.duration && (
                                      <span>
                                        •{" "}
                                        {exercise.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {exercise.instructions && (
                                <p className="mt-3 text-sm text-slate-500">
                                  {exercise.instructions}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeExercise(index)
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mt-8 border-t border-slate-200 pt-7">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Add any additional instructions or notes..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Buttons */}
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
                  {editingPlan
                    ? "Update Workout Plan"
                    : "Create Workout Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {viewPlan.planName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Workout plan details
                </p>
              </div>

              <button
                onClick={() => setViewPlan(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Member / Trainer */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Member
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {viewPlan.member?.name ||
                      "Unknown Member"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {viewPlan.member?.phone || "No phone"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {viewPlan.member?.email || "No email"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Trainer
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {viewPlan.trainer?.name ||
                      "Not Assigned"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {viewPlan.trainer?.specialization ||
                      "No specialization"}
                  </p>
                </div>
              </div>

              {/* Goal */}
              <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Fitness Goal
                </p>

                <p className="mt-2 text-base font-semibold text-indigo-900">
                  {viewPlan.goal ||
                    "General Fitness"}
                </p>
              </div>

              {/* Exercises */}
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Exercises
                  </h3>

                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {viewPlan.exercises?.length || 0} Exercises
                  </span>
                </div>

                {viewPlan.exercises?.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {viewPlan.exercises.map(
                      (exercise, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 p-5"
                        >
                          <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                              {index + 1}
                            </div>

                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900">
                                {exercise.exerciseName}
                              </h4>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {exercise.sets > 0 && (
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {exercise.sets} Sets
                                  </span>
                                )}

                                {exercise.reps > 0 && (
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {exercise.reps} Reps
                                  </span>
                                )}

                                {exercise.duration && (
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {exercise.duration}
                                  </span>
                                )}
                              </div>

                              {exercise.instructions && (
                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                  {exercise.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No exercises added to this plan.
                  </div>
                )}
              </div>

              {/* Notes */}
              {viewPlan.notes && (
                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900">
                    Notes
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {viewPlan.notes}
                  </p>
                </div>
              )}

              <button
                onClick={() => setViewPlan(null)}
                className="mt-7 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workouts;