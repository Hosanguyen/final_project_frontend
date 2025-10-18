import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './LanguageManagement.css';
import api from '../../../services/api';

const LanguageManager = () => {
  const [languages, setLanguages] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [newLang, setNewLang] = useState({
    code: '',
    name: '',
    active: true,
  });

  const fetchLanguages = async () => {
    try {
      const res = await api.get('/api/languages/');
      setLanguages(res.data);
    } catch (err) {
      console.error('Error fetching languages:', err);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleNewChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewLang((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddLanguage = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/languages/', newLang);
      Swal.fire('Success', 'Language added successfully!', 'success');
      setNewLang({ code: '', name: '', active: true });
      fetchLanguages();
    } catch (err) {
      console.error('Error adding language:', err);
      Swal.fire('Error', 'Failed to add language', 'error');
    }
  };

  const handleEdit = (lang) => {
    setEditId(lang.id);
    setEditData(lang);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/api/languages/${editId}/`, editData);
      Swal.fire('Updated', 'Language updated successfully!', 'success');
      setEditId(null);
      fetchLanguages();
    } catch (err) {
      console.error('Error updating language:', err);
      Swal.fire('Error', 'Failed to update language', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the language.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/api/languages/${id}/`);
        Swal.fire('Deleted!', 'Language has been deleted.', 'success');
        fetchLanguages();
      } catch (err) {
        console.error('Error deleting language:', err);
        Swal.fire('Error', 'Failed to delete language', 'error');
      }
    }
  };

  return (
    <div className="language-manager">
      <h2>Language Management</h2>

      {/* Add New Form */}
      <form className="language-form" onSubmit={handleAddLanguage}>
        <input
          type="text"
          name="code"
          value={newLang.code}
          onChange={handleNewChange}
          placeholder="Code (e.g. 'py')"
          required
        />
        <input
          type="text"
          name="name"
          value={newLang.name}
          onChange={handleNewChange}
          placeholder="Name (e.g. 'Python')"
          required
        />
        <label>
          <input
            type="checkbox"
            name="active"
            checked={newLang.active}
            onChange={handleNewChange}
          />
          &nbsp;Active
        </label>
        <button type="submit">Add</button>
      </form>

      {/* Table */}
      <table className="language-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {languages.map((lang) => (
            <tr key={lang.id}>
              <td>{lang.id}</td>

              {editId === lang.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="code"
                      value={editData.code}
                      onChange={handleEditChange}
                    />
                  </td>
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
                      type="checkbox"
                      name="active"
                      checked={editData.active}
                      onChange={handleEditChange}
                    />
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
                  <td>{lang.code}</td>
                  <td>{lang.name}</td>
                  <td>
                    <input type="checkbox" checked={lang.active} readOnly />
                  </td>
                  <td>
                    <button
                      className="edit"
                      onClick={() => handleEdit(lang)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDelete(lang.id)}
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

export default LanguageManager;
