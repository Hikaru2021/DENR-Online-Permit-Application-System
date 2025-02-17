import { useState, useEffect } from "react";
import "./CSS/User.css";
import { FaSearch, FaEdit } from "react-icons/fa";
import { supabase } from "./library/supabaseClient";

const User = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("id, full_name, email, contact, role, status");
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data);
    }
  };

  return (
    <div className="user-container">
      <h2 className="user-title">All Users</h2>
      
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="user-table">
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Contacts</th>
              <th>User Permission</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(user => user.full_name.toLowerCase().includes(search.toLowerCase())).map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.contact || "N/A"}</td>
                <td>{user.role || "User"}</td>
                <td>
                  <span className={`status-badge ${user.status ? user.status.toLowerCase() : 'inactive'}`}>
                    {user.status || "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="edit-btn">
                    <FaEdit /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="prev-btn">❮ Prev</button>
        <button className="next-btn">Next ❯</button>
      </div>
    </div>
  );
};

export default User;