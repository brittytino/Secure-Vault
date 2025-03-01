import React, { useState, useEffect } from 'react';
import { 
  Key, 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  AlertTriangle,
  X,
  Save,
  Copy
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

type ItemType = 'password' | 'note' | 'card' | 'other';

interface FormData {
  name: string;
  type: ItemType;
  data: Record<string, any>;
}

const VaultManager: React.FC = () => {
  const { items, isLoading, error, createItem, updateItem, deleteItem, refreshItems } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'password',
    data: {
      username: '',
      password: '',
      url: '',
      notes: '',
    },
  });

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  // Filter items based on search term
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'password',
      data: {
        username: '',
        password: '',
        url: '',
        notes: '',
      },
    });
    setShowPassword(false);
  };

  const handleAddItem = async () => {
    if (!formData.name.trim()) {
      return;
    }

    const success = await createItem({
      name: formData.name,
      type: formData.type,
      data: formData.data,
    });

    if (success) {
      resetForm();
      setShowAddModal(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem || !formData.name.trim()) {
      return;
    }

    const success = await updateItem(currentItem.id, {
      name: formData.name,
      type: formData.type,
      data: formData.data,
    });

    if (success) {
      setShowViewModal(false);
      setIsEditing(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!currentItem) {
      return;
    }

    const success = await deleteItem(currentItem.id);
    if (success) {
      setShowDeleteModal(false);
      setShowViewModal(false);
    }
  };

  const openViewModal = (item: any) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      data: { ...item.data },
    });
    setIsEditing(false);
    setShowPassword(false);
    setShowViewModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const renderFormFields = () => {
    switch (formData.type) {
      case 'password':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username/Email</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.data.username || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, username: e.target.value },
                  })
                }
                disabled={!isEditing && showViewModal}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full"
                  value={formData.data.password || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, password: e.target.value },
                    })
                  }
                  disabled={!isEditing && showViewModal}
                />
                <button
                  type="button"
                  className="btn btn-square"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {showViewModal && !isEditing && (
                  <button
                    type="button"
                    className="btn btn-square"
                    onClick={() => copyToClipboard(formData.data.password || '')}
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Website URL</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.data.url || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, url: e.target.value },
                  })
                }
                disabled={!isEditing && showViewModal}
              />
            </div>
          </>
        );
      case 'note':
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Note Content</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={formData.data.notes || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data: { ...formData.data, notes: e.target.value },
                })
              }
              disabled={!isEditing && showViewModal}
            ></textarea>
          </div>
        );
      case 'card':
        return (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Card Number</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input input-bordered w-full"
                value={formData.data.cardNumber || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, cardNumber: e.target.value },
                  })
                }
                disabled={!isEditing && showViewModal}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Expiry Date</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="MM/YY"
                  value={formData.data.expiryDate || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, expiryDate: e.target.value },
                    })
                  }
                  disabled={!isEditing && showViewModal}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">CVV</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full"
                  value={formData.data.cvv || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, cvv: e.target.value },
                    })
                  }
                  disabled={!isEditing && showViewModal}
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Cardholder Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.data.cardholderName || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data: { ...formData.data, cardholderName: e.target.value },
                  })
                }
                disabled={!isEditing && showViewModal}
              />
            </div>
          </>
        );
      default:
        return (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Content</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={formData.data.content || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data: { ...formData.data, content: e.target.value },
                })
              }
              disabled={!isEditing && showViewModal}
            ></textarea>
          </div>
        );
    }
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Vault Manager</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="form-control flex-grow">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search vault..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-square">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <div className="badge badge-outline">
                      {item.type === 'password' && (
                        <Key className="h-4 w-4 mr-1" />
                      )}
                      {item.type === 'note' && (
                        <FileText className="h-4 w-4 mr-1" />
                      )}
                      {item.type}
                    </div>
                  </td>
                  <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => openViewModal(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No items found</h2>
            <p>
              {searchTerm
                ? 'No items match your search criteria'
                : 'Your vault is empty. Add your first item to get started.'}
            </p>
            <div className="card-actions mt-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowAddModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg mb-4">Add New Item</h3>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Item Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter item name"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Item Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as ItemType,
                    data:
                      e.target.value === 'password'
                        ? { username: '', password: '', url: '', notes: '' }
                        : e.target.value === 'note'
                        ? { notes: '' }
                        : e.target.value === 'card'
                        ? {
                            cardNumber: '',
                            expiryDate: '',
                            cvv: '',
                            cardholderName: '',
                          }
                        : { content: '' },
                  })
                }
              >
                <option value="password">Password</option>
                <option value="note">Secure Note</option>
                <option value="card">Payment Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            {renderFormFields()}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddItem}>
                <Save className="h-5 w-5 mr-2" />
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Item Modal */}
      {showViewModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowViewModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg mb-4">
              {isEditing ? 'Edit Item' : 'View Item'}
            </h3>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Item Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Item Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as ItemType,
                  })
                }
                disabled={!isEditing}
              >
                <option value="password">Password</option>
                <option value="note">Secure Note</option>
                <option value="card">Payment Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            {renderFormFields()}
            <div className="modal-action">
              {isEditing ? (
                <>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateItem}
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-error"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete "{currentItem?.name}"? This action
              cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteItem}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultManager;