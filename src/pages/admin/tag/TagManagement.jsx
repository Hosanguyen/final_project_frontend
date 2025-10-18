import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './TagManagement.css';
import TagService from '../../../services/TagService';

const TagManager = () => {
  const [tags, setTags] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [newTag, setNewTag] = useState({
    name: '',
    slug: '',
  });

  const fetchTags = async () => {
    try {
      const data = await TagService.getTags();
      setTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewTag((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    try {
      await TagService.createTag(newTag);
      Swal.fire('Success', 'Tag added successfully!', 'success');
      setNewTag({ name: '', slug: '' });
      fetchTags();
    } catch (err) {
      console.error('Error adding tag:', err);
      Swal.fire('Error', 'Failed to add tag', 'error');
    }
  };

  const handleEdit = (tag) => {
    setEditId(tag.id);
    setEditData(tag);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await TagService.updateTag(editId, editData);
      Swal.fire('Updated', 'Tag updated successfully!', 'success');
      setEditId(null);
      fetchTags();
    } catch (err) {
      console.error('Error updating tag:', err);
      Swal.fire('Error', 'Failed to update tag', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the tag.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await TagService.deleteTag(id);
        Swal.fire('Deleted!', 'Tag has been deleted.', 'success');
        fetchTags();
      } catch (err) {
        console.error('Error deleting tag:', err);
        Swal.fire('Error', 'Failed to delete tag', 'error');
      }
    }
  };

  return (
    <div className="tag-manager">
      <h2>Tag Management</h2>

      {/* Add New Form */}
      <form className="tag-form" onSubmit={handleAddTag}>
        <input
          type="text"
          name="name"
          value={newTag.name}
          onChange={handleNewChange}
          placeholder="Tag Name (e.g. 'Programming')"
          required
        />
        <input
          type="text"
          name="slug"
          value={newTag.slug}
          onChange={handleNewChange}
          placeholder="Slug (e.g. 'programming')"
          required
        />
        <button type="submit">Add Tag</button>
      </form>

      {/* Table */}
      <table className="tag-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id}>
              <td>{tag.id}</td>

              {editId === tag.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="slug"
                      value={editData.slug}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    {new Date(tag.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="save"
                      onClick={handleSaveEdit}
                      title="Save"
                    >
                      <FaCheck />
                    </button>
                    <button
                      className="cancel"
                      onClick={handleCancelEdit}
                      title="Cancel"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{tag.name}</td>
                  <td>{tag.slug}</td>
                  <td>
                    {new Date(tag.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="edit"
                      onClick={() => handleEdit(tag)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDelete(tag.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TagManager;
