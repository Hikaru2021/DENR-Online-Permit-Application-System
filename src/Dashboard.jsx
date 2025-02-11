import React from "react";
import "./CSS/Dashboard.css"; // CSS file for styling

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-body">
          {/* Placeholder Boxes */}
          <div className="dashboard-boxes">
            <div className="box total">
              <h3>Total Application</h3>
              <p className="count">29</p>
              <span>from this month</span>
            </div>
            <div className="box pending">
              <h3>Pending Application</h3>
              <p className="count">17</p>
              <span>from this month</span>
            </div>
            <div className="box approved">
              <h3>Approved Application</h3>
              <p className="count">10</p>
              <span>from this month</span>
            </div>
            <div className="box rejected">
              <h3>Rejected Application</h3>
              <p className="count">2</p>
              <span>from this month</span>
            </div>
          </div>

          {/* New Big Placeholder Box Below */}
          <div className="big-placeholder-box">
            <h3>Additional Overview</h3>
            <p>This section can display extra statistics or charts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
