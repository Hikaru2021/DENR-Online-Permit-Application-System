import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Authorization from "./Authorization";
import ApplicationList from "./ApplicationList";
import Dashboard from "./Dashboard";
import User from "./User";
import Layout from "./Layout"; // Import the Layout component
import MyApplication from "./MyApplication";
import Reports from "./Reports";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing & Authorization Pages (No Sidebar & Navbar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/Authorization" element={<Authorization />} />
        <Route path="/Authorization#" element={<Authorization />} />

        {/* Wrap all other pages inside Layout */}
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/User" element={<User />} />
          <Route path="/ApplicationList" element={<ApplicationList />} />
          <Route path="/MyApplication" element={<MyApplication />} />
          <Route path="/Reports" element={<Reports />} />
          {/* Add other pages that need the sidebar/navbar here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
