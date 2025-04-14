import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import ApplicationModal from "./Modals/ApplicationModal"; // Adjust path based on your folder structure
import "./CSS/ApplicationList.css";

function ApplicationList() {
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Temporary Hardcoded Data (for testing)
  useEffect(() => {
    const tempData = [
      {
        id: 1,
        title:
          "Certificate of Verification (COV) for the transport of planted trees within the private land, non-timber forest...",
        type: "Certificate",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
      },
      {
        id: 2,
        title:
          "Tree Cutting Permit for Planted Trees and Naturally Growing Trees found within Public Places for Public Safety...",
        type: "Permit",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
      },
    ];
    setApplications(tempData);
  }, []);

  // Filter applications based on search input
  const filteredApplications = applications.filter((app) =>
    app.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Apply button click (toggles the modal)
  const handleApplyClick = (app) => {
    if (selectedApplication?.id === app.id) {
      setSelectedApplication(null);
      setTimeout(() => setSelectedApplication(app), 0); // Ensures re-render
    } else {
      setSelectedApplication(app);
    }
  };

  return (
    <div className="content-container">
      {/* Search Bar */}
      <div className="content-search-bar">
        <button className="content-add-btn">+ Add New Permit</button>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Applications List */}
      <h2 className="content-section-title">
        {filteredApplications.length} Available Applications
      </h2>
      <div className="content-grid">
        {filteredApplications.map((app) => (
          <div key={app.id} className="content-card">
            <h3>
              {app.title}
              <FaEdit className="content-edit-icon" />
            </h3>
            <span className={`content-badge ${app.type?.toLowerCase()}`}>
              {app.type}
            </span>
            <p className="content-description">{app.description}</p>
            <button
              className="content-apply-btn"
              onClick={() => handleApplyClick(app)}
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
}

export default ApplicationList;
