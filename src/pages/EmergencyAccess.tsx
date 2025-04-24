import React, { useState } from 'react';
import { Shield, Users, AlertTriangle, Plus, Trash2, Save, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import useWeb3Forms from '@web3forms/react';

interface TrustedContact {
  id: string;
  name: string;
  email: string;
  recoveryKey?: string;
  dateAdded: number;
}

const EmergencyAccess: React.FC = () => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentContact, setCurrentContact] = useState<TrustedContact | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
  });
  const { addNotification } = useNotification();

  const { submit } = useWeb3Forms({
    access_key: 'c4606a75-a3cb-4e95-976c-e01f6345091f',
    settings: {
      from_name: 'Secure Vault',
      subject: 'Emergency Access Request',
    },
    onSuccess: (message) => {
      addNotification({
        type: 'success',
        message: 'Emergency access request sent successfully',
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Failed to send emergency access request:', error);
    }
  });

  const generateRecoveryKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const randomValues = new Uint8Array(20);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(randomValues[i] % chars.length);
    }
    
    // Format as XXXXX-XXXXX-XXXXX-XXXXX
    return `${result.substring(0, 5)}-${result.substring(5, 10)}-${result.substring(10, 15)}-${result.substring(15, 20)}`;
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.email) {
      addNotification({
        type: 'error',
        message: 'Please fill in all fields',
        duration: 3000,
      });
      return;
    }

    const recoveryKey = generateRecoveryKey();
    
    const contact: TrustedContact = {
      id: `contact_${Date.now()}`,
      name: newContact.name,
      email: newContact.email,
      recoveryKey,
      dateAdded: Date.now(),
    };

    // Send emergency access request through Web3Forms
    try {
      await submit({
        email: newContact.email,
        message: `
Secure Vault - Emergency Access Request

Dear ${newContact.name},

You have been added as a trusted contact for emergency access to a Secure Vault account.

Your recovery key is: ${recoveryKey}

This key can be used to request emergency access to the vault. Please keep this key secure and do not share it with anyone.

If you did not expect this request, please ignore this message.

Best regards,
Secure Vault Team
        `,
      });

      setContacts([...contacts, contact]);
      setNewContact({ name: '', email: '' });
      setShowAddModal(false);
      
      addNotification({
        type: 'success',
        message: 'Trusted contact added and notified successfully',
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to send emergency access request',
        duration: 3000,
      });
    }
  };

  const handleDeleteContact = () => {
    if (!currentContact) return;
    
    setContacts(contacts.filter(contact => contact.id !== currentContact.id));
    setShowDeleteModal(false);
    
    addNotification({
      type: 'success',
      message: 'Trusted contact removed',
      duration: 3000,
    });
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-6">Emergency Access</h1>
      
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Emergency Access Setup
          </h2>
          <div className="divider mt-0"></div>
          
          <p className="mb-4">
            Emergency access allows trusted contacts to request access to your vault in case of an emergency.
            You can set up trusted contacts who can request access, which you can approve or deny.
          </p>
          
          <div className="alert alert-warning">
            <AlertTriangle className="h-5 w-5" />
            <span>
              Only add people you fully trust. They will be able to request access to your vault in emergencies.
            </span>
          </div>
          
          <div className="mt-4">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Trusted Contact
            </button>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Trusted Contacts
          </h2>
          <div className="divider mt-0"></div>
          
          {contacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date Added</th>
                    <th>Recovery Key</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(contact => (
                    <tr key={contact.id}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{new Date(contact.dateAdded).toLocaleDateString()}</td>
                      <td>
                        <span className="font-mono text-xs">{contact.recoveryKey}</span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-error"
                          onClick={() => {
                            setCurrentContact(contact);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-base-content/70">No trusted contacts added yet</p>
              <button 
                className="btn btn-primary btn-sm mt-4"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Contact
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowAddModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg">Add Trusted Contact</h3>
            <div className="py-4">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter contact name"
                  className="input input-bordered w-full"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter contact email"
                  className="input input-bordered w-full"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                />
              </div>
              <div className="alert alert-info">
                <span>
                  A recovery key will be generated for this contact. They will need this key to request access.
                </span>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddContact}
              >
                <Save className="h-5 w-5 mr-2" />
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Remove Trusted Contact</h3>
            <p className="py-4">
              Are you sure you want to remove {currentContact?.name} from your trusted contacts?
              They will no longer be able to request emergency access to your vault.
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
                onClick={handleDeleteContact}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Remove Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAccess;