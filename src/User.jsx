import React, { useState, useEffect } from "react";
import "./CSS/User.css";
import "./CSS/SharedTable.css";
import { FaSearch, FaTimes, FaFilter, FaSort, FaTrash } from "react-icons/fa";
import { supabase } from "./library/supabaseClient";

const STATUS_MAPPING = {
  1: { label: 'Active', class: 'status-active' },
  2: { label: 'Blocked', class: 'status-blocked' }
};

const User = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleChangeData, setRoleChangeData] = useState(null);
  const [isRoleUpdating, setIsRoleUpdating] = useState(false);
  const [totalPages, setTotalPages] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          created_at,
          user_name,
          email,
          role_id,
          status,
          user_status (
            id,
            user_status
          )
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;
      setUsers(data || []);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
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

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const getStatusBadgeClass = (statusId) => {
    return STATUS_MAPPING[statusId]?.class || 'status-pending';
  };

  const getStatusText = (statusId) => {
    return STATUS_MAPPING[statusId]?.label || 'Pending';
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
      (statusFilter === 'all' || user.status === parseInt(statusFilter))
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

  const handleRoleChangeClick = (userId, currentRole, newRole) => {
    setRoleChangeData({
      userId,
      currentRole: getRolePermission(currentRole),
      newRole: getRolePermission(parseInt(newRole)),
      newRoleId: parseInt(newRole)
    });
    setShowRoleModal(true);
  };

  const handleRoleChangeConfirm = async () => {
    if (!roleChangeData) return;
    
    setIsRoleUpdating(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role_id: roleChangeData.newRoleId })
        .eq('id', roleChangeData.userId)
        .select();

      if (error) throw error;

      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user.id === roleChangeData.userId ? { ...user, role_id: roleChangeData.newRoleId } : user
      ));
      setShowRoleModal(false);
    } catch (err) {
      setError(`Error updating role: ${err.message}`);
      console.error('Error updating role:', err);
    } finally {
      setIsRoleUpdating(false);
      setRoleChangeData(null);
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
              {Object.entries(STATUS_MAPPING).map(([id, { label }]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
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
        <div className="applications-table-container table-container">
          <table className="shared-table">
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
                    <td>
                      <select
                        value={user.role_id || ""}
                        onChange={(e) => handleRoleChangeClick(user.id, user.role_id, e.target.value)}
                        className="role-select"
                      >
                        <option value="1">Admin</option>
                        <option value="2">Manager</option>
                        <option value="3">User</option>
                      </select>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
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
                  <td colSpan="6" className="empty-state">
                    No users found. {searchTerm ? "Try adjusting your search." : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-container">
        <div className="pagination">
          <button
            className="pagination-button nav-button"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ❮ Prev
          </button>
          <div className="pagination-pages">
            {/* Add page numbers */}
            {Array.from({ length: Math.min(5, Math.max(1, totalPages || 1)) }, (_, i) => {
              // Display current page and two pages before/after when possible
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageToShow}
                  className={`pagination-button ${currentPage === pageToShow ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageToShow)}
                >
                  {pageToShow}
                </button>
              );
            })}
          </div>
          <button
            className="pagination-button nav-button"
            onClick={handleNextPage}
            disabled={filteredUsers.length < itemsPerPage}
          >
            Next ❯
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="modal-overlay">
          <div className="modal-container role-modal">
            <div className="modal-header">
              <h2>Delete User</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingUser(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <p className="confirmation-message">
                Are you sure you want to delete user{' '}
                <strong>{deletingUser.user_name}</strong> with email{' '}
                <strong>{deletingUser.email}</strong>?
              </p>
              <p className="warning-message">
                This action cannot be undone. The user will lose all access to the system.
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingUser(null);
                  }}
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

      {/* Role Change Confirmation Modal */}
      {showRoleModal && roleChangeData && (
        <div className="modal-overlay">
          <div className="modal-container role-modal">
            <div className="modal-header">
              <h2>Change Role Permission</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowRoleModal(false);
                  setRoleChangeData(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <p className="confirmation-message">
                Are you sure you want to change this user's role from{' '}
                <strong>{roleChangeData.currentRole}</strong> to{' '}
                <strong>{roleChangeData.newRole}</strong>?
              </p>
              <p className="warning-message">
                This will modify the user's permissions and access levels.
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setRoleChangeData(null);
                  }}
                  disabled={isRoleUpdating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="submit-button"
                  onClick={handleRoleChangeConfirm}
                  disabled={isRoleUpdating}
                >
                  {isRoleUpdating ? "Updating..." : "Confirm Change"}
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