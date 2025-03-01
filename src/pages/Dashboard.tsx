import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Key, FileText, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Dashboard: React.FC = () => {
  const { items, isLoading, error, refreshItems } = useData();
  const [stats, setStats] = useState({
    passwords: 0,
    notes: 0,
    other: 0,
  });

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    // Calculate stats
    const newStats = {
      passwords: 0,
      notes: 0,
      other: 0,
    };

    items.forEach((item) => {
      if (item.type === 'password') {
        newStats.passwords++;
      } else if (item.type === 'note') {
        newStats.notes++;
      } else {
        newStats.other++;
      }
    });

    setStats(newStats);
  }, [items]);

  // Get recent items (last 5)
  const recentItems = items.slice(0, 5);

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {error && (
        <div className="alert alert-error mb-6">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-primary">
            <Key className="h-8 w-8" />
          </div>
          <div className="stat-title">Passwords</div>
          <div className="stat-value">{stats.passwords}</div>
          <div className="stat-desc">Secure credentials</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-secondary">
            <FileText className="h-8 w-8" />
          </div>
          <div className="stat-title">Notes</div>
          <div className="stat-value">{stats.notes}</div>
          <div className="stat-desc">Encrypted notes</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-accent">
            <Shield className="h-8 w-8" />
          </div>
          <div className="stat-title">Other Items</div>
          <div className="stat-value">{stats.other}</div>
          <div className="stat-desc">Additional secure data</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex justify-between">
              <span>Recent Items</span>
              <Clock className="h-5 w-5" />
            </h2>
            <div className="divider mt-0"></div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : recentItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          <div className="badge badge-outline">
                            {item.type}
                          </div>
                        </td>
                        <td>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-base-content/70">No items yet</p>
                <Link to="/vault" className="btn btn-primary btn-sm mt-2">
                  Add Item
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Quick Actions</h2>
            <div className="divider mt-0"></div>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/vault" className="btn btn-primary">
                <Key className="h-5 w-5 mr-2" />
                Manage Vault
              </Link>
              <Link to="/settings" className="btn btn-outline">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </Link>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Security Tips</h3>
              <ul className="list-disc list-inside text-sm text-base-content/70">
                <li>Use a strong, unique master password</li>
                <li>Enable biometric authentication if available</li>
                <li>Regularly export encrypted backups</li>
                <li>Never share your master password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;