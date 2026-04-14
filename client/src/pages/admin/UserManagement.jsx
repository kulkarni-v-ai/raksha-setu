import React, { useState } from 'react';
import { 
  Search, Filter, MoreVertical, ShieldCheck, 
  ShieldAlert, Trash2, Mail, Phone, ExternalLink 
} from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: 'Amit Sharma', email: 'amit@gmail.com', phone: '+91 98765 43210', status: 'Active', registered: '2024-03-12' },
    { id: 2, name: 'Priya Verma', email: 'priya@outlook.com', phone: '+91 99887 76655', status: 'Active', registered: '2024-03-15' },
    { id: 3, name: 'Rahul Singh', email: 'rahul@yahoo.com', phone: '+91 88776 65544', status: 'Blocked', registered: '2024-01-10' },
    { id: 4, name: 'Sneha Gupta', email: 'sneha@rakshasetu.in', phone: '+91 77665 54433', status: 'Active', registered: '2024-04-01' },
    { id: 5, name: 'Vikram Rao', email: 'vikram@company.com', phone: '+91 91234 56789', status: 'Active', registered: '2024-02-20' },
  ]);

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u
    ));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management">
      <div className="module-header">
        <div>
          <h1>User Management</h1>
          <p>Monitor and manage platform users and their access levels.</p>
        </div>
        <button className="admin-primary-btn">Export CSV</button>
      </div>

      <div className="admin-card table-card">
        <div className="table-controls">
          <div className="search-wrap">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <button className="filter-btn">
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{user.name.charAt(0)}</div>
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <Phone size={14} />
                      {user.phone}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.registered}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className={`action-btn ${user.status === 'Active' ? 'block' : 'unblock'}`}
                        onClick={() => toggleUserStatus(user.id)}
                        title={user.status === 'Active' ? 'Block User' : 'Unblock User'}
                      >
                        {user.status === 'Active' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                      </button>
                      <button className="action-btn delete" title="Delete User">
                        <Trash2 size={18} />
                      </button>
                      <button className="action-btn view">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <div className="pagination">
            <button disabled>Prev</button>
            <button className="active">1</button>
            <button>2</button>
            <button>Next</button>
          </div>
        </div>
      </div>

      <style>{`
        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .module-header h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
          color: var(--text-main);
        }

        .module-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .admin-primary-btn {
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px var(--btn-shadow);
        }

        .table-card {
           padding: 0 !important;
           overflow: hidden;
           background: var(--glass-bg);
           backdrop-filter: blur(16px);
           border-radius: 1rem;
           border: 1px solid var(--glass-border);
           box-shadow: var(--shadow-lg);
        }

        .table-controls {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          width: 300px;
          color: var(--text-muted);
        }

        .search-wrap input {
          background: none;
          border: none;
          outline: none;
          font-family: inherit;
          width: 100%;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .filter-btn {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          color: var(--text-main);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .admin-table th {
          text-align: left;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        .admin-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-main);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 700;
          color: var(--text-main);
        }

        .user-email {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .phone-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
        }

        .status-pill {
          padding: 0.25rem 0.65rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-pill.active { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .status-pill.blocked { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

        .table-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
          background: var(--input-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .action-btn.view:hover { border-color: var(--primary); color: var(--primary); }
        .action-btn.delete:hover { border-color: var(--emergency); color: var(--emergency); }
        .action-btn.block:hover { border-color: var(--emergency); color: var(--emergency); }
        .action-btn.unblock:hover { border-color: var(--success); color: var(--success); }

        .table-footer {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .pagination {
          display: flex;
          gap: 0.4rem;
        }

        .pagination button {
          padding: 0.4rem 0.8rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background: var(--card-bg);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .pagination button.active {
          background: var(--primary-gradient);
          color: white;
          border-color: var(--primary);
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
