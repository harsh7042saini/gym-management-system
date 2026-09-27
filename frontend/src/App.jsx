import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Payments from "./pages/Payments";
import Trainers from "./pages/Trainers";
import Workouts from "./pages/Workouts";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/members"
          element={<Members />}
        />

        <Route
          path="/payments"
          element={<Payments />}
        />

        <Route
          path="/trainers"
          element={<Trainers />}
        />

        <Route
          path="/workouts"
          element={<Workouts />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;