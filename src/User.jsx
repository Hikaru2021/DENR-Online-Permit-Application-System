import React, { useState, useEffect } from "react";
import "./CSS/User.css";
import { FaSearch, FaEdit, FaTimes, FaFilter, FaSort, FaTrash } from "react-icons/fa";
import { supabase } from "./library/supabaseClient";

const User = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    role_id: '',
    status: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, created_at, user_name, email, role_id, status')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      setError(`Error fetching users: ${error.message}`);
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      user_name: user.user_name,
      email: user.email,
      role_id: user.role_id,
      status: user.status
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          user_name: formData.user_name,
          email: formData.email,
          role_id: formData.role_id,
          status: formData.status,
        })
        .eq("id", selectedUser.id)
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
        return "status-active";
      case "inactive":
        return "status-inactive";
      case "pending":
        return "status-pending";
      default:
        return "status-pending";
    }
  };

  const getRolePermission = (roleId) => {
    switch (roleId) {
      case 1: return 'Admin';
      case 2: return 'Manager';
      case 3: return 'User';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'all' || user.status?.toLowerCase() === statusFilter.toLowerCase())
  );

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", deletingUser.id);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== deletingUser.id));
      setShowDeleteModal(false);
      setDeletingUser(null);
    } catch (err) {
      setError(`Error deleting user: ${err.message}`);
      console.error("Error deleting user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="my-application-container">
      <div className="application-list-header">
        <h1 className="application-list-title">User Management</h1>
        <p className="application-list-subtitle">Manage and track all registered users</p>
      </div>

      <div className="my-application-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <th>Role Permission</th>
                <th>Created At</th>
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
                    <td>{getRolePermission(user.role_id)}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                        {user.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEditClick(user)}
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteClick(user)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No users found. {searchTerm ? "Try adjusting your search." : ""}
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
          disabled={filteredUsers.length < itemsPerPage}
        >
          Next ❯
        </button>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
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
                  <label htmlFor="username">Full Name</label>
                  <input
                    type="text"
                    id="username"
                    name="user_name"
                    value={formData.user_name || ""}
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
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role_id">Role Permission</label>
                  <select
                    id="role_id"
                    name="role_id"
                    value={formData.role_id || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Role</option>
                    <option value="1">Admin</option>
                    <option value="2">Manager</option>
                    <option value="3">User</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="modal-overlay">
          <div className="modal-container delete-modal">
            <div className="modal-header">
              <h2>Delete User</h2>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <p className="delete-confirmation-message">
                Are you sure you want to delete the user "{deletingUser.user_name}"? 
                This action cannot be undone.
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;