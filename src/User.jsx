import { useState, useEffect } from "react";
import "./CSS/User.css";
import { FaSearch, FaEdit, FaTimes, FaFilter, FaSort } from "react-icons/fa";
import { supabase } from "./library/supabaseClient";

const User = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, created_at, user_name, email, cell_number, sex, current_address, role_id, status")
        .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1);

      if (error) {
        throw error;
      }
      setUsers(data || []);
    } catch (err) {
      setError(`Error fetching users: ${err.message}`);
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          user_name: editingUser.user_name,
          email: editingUser.email,
          cell_number: editingUser.cell_number,
          sex: editingUser.sex,
          current_address: editingUser.current_address,
          status: editingUser.status,
        })
        .eq("id", editingUser.id)
        .select();

      if (error) throw error;

      console.log("User updated:", data);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(`Error updating user: ${err.message}`);
      console.error("Error updating user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "status-approved";
      case "inactive":
        return "status-denied";
      case "pending":
        return "status-pending";
      default:
        return "status-pending";
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="my-application-container">
      <div className="my-application-header">
      </div>

      <div className="my-application-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort By:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={handleSortChange}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Gender</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.user_name || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>{user.cell_number || "N/A"}</td>
                    <td>{user.sex || "N/A"}</td>
                    <td>{user.current_address || "N/A"}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                        {user.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-button track-button"
                        onClick={() => handleEditClick(user)}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No users found. {search ? "Try adjusting your search." : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button
          className="prev-btn"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          ❮ Prev
        </button>
        <span className="page-info">Page {currentPage}</span>
        <button
          className="next-btn"
          onClick={handleNextPage}
          disabled={filteredUsers.length < usersPerPage}
        >
          Next ❯
        </button>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {formError && (
                <div className="form-error">{formError}</div>
              )}

              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label htmlFor="user_name">Full Name</label>
                  <input
                    type="text"
                    id="user_name"
                    name="user_name"
                    value={editingUser.user_name || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editingUser.email || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cell_number">Contact Number</label>
                  <input
                    type="text"
                    id="cell_number"
                    name="cell_number"
                    value={editingUser.cell_number || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sex">Gender</label>
                  <select
                    id="sex"
                    name="sex"
                    value={editingUser.sex || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="current_address">Address</label>
                  <textarea
                    id="current_address"
                    name="current_address"
                    value={editingUser.current_address || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={editingUser.status || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;