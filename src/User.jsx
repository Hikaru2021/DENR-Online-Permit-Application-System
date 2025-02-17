// import { useState } from "react";
// import "./CSS/User.css";
// // import { FaSearch } from "react-icons/fa";

// const User = () => {
//   const [search, setSearch] = useState("");

//   return (
//     <div className="user-container">
//       <h2 className="user-title">All Users</h2>
      
//       <div className="search-bar">
//         <FaSearch className="search-icon" />
//         <input
//           type="text"
//           placeholder="Search"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       <div className="user-table">
//         <table>
//           <thead>
//             <tr>
//               <th>User name</th>
//               <th>Email</th>
//               <th>Contacts</th>
//               <th>User Permission</th>
//               <th>Status</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {/* Example user data structure:
//             {users.map((user, index) => (
//               <tr key={index}>
//                 <td>
//                   <div className="user-profile">
//                     <div className="user-avatar"></div>
//                     {user.name}
//                   </div>
//                 </td>
//                 <td>{user.email}</td>
//                 <td>{user.contact}</td>
//                 <td>{user.role}</td>
//                 <td>
//                   <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>
//                 </td>
//                 <td>
//                   <button className="edit-btn">
//                     <FaEdit /> Edit
//                   </button>
//                 </td>
//               </tr>
//             ))} */}
//           </tbody>
//         </table>
//       </div>

//       <div className="pagination">
//         <button className="prev-btn">❮ Prev</button>
//         <button className="next-btn">Next ❯</button>
//       </div>
//     </div>
//   );
// };

// export default User;
