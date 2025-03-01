import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Save, 
  X,
  AlertTriangle,
  Clock,
  Tag,
  Lock
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';

interface NoteFormData {
  title: string;
  content: string;
  tags: string[];
}

const SecureNotes: React.FC = () => {
  const { items, isLoading, error, createItem, updateItem, deleteItem, refreshItems } = useData();
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    tags: [],
  });

  // Get only note items
  const notes = items.filter(item => item.type === 'note');

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  // Filter notes based on search term
  const filteredNotes = notes.filter(
    (note) =>
      note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.data.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.data.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: [],
    });
    setTagInput('');
  };

  const handleAddNote = async () => {
    if (!formData.title.trim()) {
      addNotification({
        type: 'error',
        message: 'Please enter a title for your note',
        duration: 3000,
      });
      return;
    }

    const success = await createItem({
      name: formData.title,
      type: 'note',
      data: {
        content: formData.content,
        tags: formData.tags,
        createdAt: Date.now(),
      },
    });

    if (success) {
      resetForm();
      setShowAddModal(false);
      addNotification({
        type: 'success',
        message: 'Note created successfully',
        duration: 3000,
      });
    }
  };

  const handleUpdateNote = async () => {
    if (!currentNote || !formData.title.trim()) {
      addNotification({
        type: 'error',
        message: 'Please enter a title for your note',
        duration: 3000,
      });
      return;
    }

    const success = await updateItem(currentNote.id, {
      name: formData.title,
      type: 'note',
      data: {
        ...currentNote.data,
        content: formData.content,
        tags: formData.tags,
        updatedAt: Date.now(),
      },
    });

    if (success) {
      setShowViewModal(false);
      setIsEditing(false);
      addNotification({
        type: 'success',
        message: 'Note updated successfully',
        duration: 3000,
      });
    }
  };

  const handleDeleteNote = async () => {
    if (!currentNote) return;
    
    const success = await deleteItem(currentNote.id);
    if (success) {
      setShowDeleteModal(false);
      setShowViewModal(false);
      addNotification({
        type: 'success',
        message: 'Note deleted successfully',
        duration: 3000,
      });
    }
  };

  const openViewModal = (note: any) => {
    setCurrentNote(note);
    setFormData({
      title: note.name,
      content: note.data.content || '',
      tags: note.data.tags || [],
    });
    setIsEditing(false);
    setShowViewModal(true);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
    }
    
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Secure Notes</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="form-control flex-grow">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search notes..."
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
            New Note
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
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() => openViewModal(note)}
            >
              <div className="card-body">
                <h2 className="card-title">{note.name}</h2>
                <p className="line-clamp-3 text-base-content/70">
                  {note.data.content || 'No content'}
                </p>
                
                {note.data.tags && note.data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.data.tags.map((tag: string, index: number) => (
                      <div key={index} className="badge badge-outline">
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-4 text-xs text-base-content/50">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <FileText className="h-16 w-16 mb-4 opacity-30" />
            <h2 className="card-title">No notes found</h2>
            <p>
              {searchTerm
                ? 'No notes match your search criteria'
                : 'Your secure notes vault is empty. Create your first note to get started.'}
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
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowAddModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg mb-4">Create New Note</h3>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                placeholder="Enter note title"
                className="input input-bordered w-full"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Content</span>
              </label>
              <textarea
                placeholder="Enter your secure note content here..."
                className="textarea textarea-bordered h-48"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              ></textarea>
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Tags</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tags"
                  className="input input-bordered w-full"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  className="btn"
                  onClick={addTag}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="badge badge-primary gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddNote}>
                <Save className="h-5 w-5 mr-2" />
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Note Modal */}
      {showViewModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowViewModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg mb-4">
              {isEditing ? 'Edit Note' : 'View Note'}
            </h3>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Content</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-48"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                disabled={!isEditing}
              ></textarea>
            </div>
            {isEditing ? (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tags"
                    className="input input-bordered w-full"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <button
                    className="btn"
                    onClick={addTag}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="badge badge-primary gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              formData.tags.length > 0 && (
                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Tags</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="badge badge-outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
            
            {!isEditing && currentNote && (
              <div className="flex justify-between text-xs text-base-content/50 mb-4">
                <div>
                  <p>Created: {formatDate(currentNote.createdAt)}</p>
                  <p>Last updated: {formatDate(currentNote.updatedAt)}</p>
                </div>
              </div>
            )}
            
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
                    onClick={handleUpdateNote}
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
              Are you sure you want to delete "{currentNote?.name}"? This action
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
                onClick={handleDeleteNote}
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

export default SecureNotes;