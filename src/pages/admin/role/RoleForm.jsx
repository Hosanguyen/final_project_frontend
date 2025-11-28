import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import RoleService from '../../../services/RoleService';
import PermissionService from '../../../services/PermissionService';
import './RoleForm.css';
import notification from '../../../utils/notification';

const RoleForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [permissionsByCategory, setPermissionsByCategory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadPermissions();
        if (isEditMode) {
            loadRoleData();
        }
    }, [id]);

    const loadPermissions = async () => {
        try {
            const data = await PermissionService.getAllGroupedByCategory();
            setPermissionsByCategory(data);
        } catch (error) {
            console.error('Failed to load permissions:', error);
            notification.error('Không thể tải danh sách phân quyền');
        }
    };

    const loadRoleData = async () => {
        setLoading(true);
        try {
            const data = await RoleService.getById(id);
            setFormData({
                name: data.name,
                description: data.description || '',
            });
            const permissionIds = data.permissions.map((p) => p.id);
            setSelectedPermissions(permissionIds);
        } catch (error) {
            console.error('Failed to load role:', error);
            notification.error('Không thể tải thông tin vai trò');
            navigate('/admin/roles');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên vai trò là bắt buộc';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Tên vai trò phải có ít nhất 3 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const submitData = {
            name: formData.name,
            description: formData.description,
            permission_ids: selectedPermissions,
        };

        try {
            let response;
            if (isEditMode) {
                response = await RoleService.update(id, submitData);
            } else {
                response = await RoleService.create(submitData);
            }

            notification.success(response.detail);
            navigate('/admin/roles');
        } catch (error) {
            console.error('Error saving role:', error);

            if (error.response?.data) {
                const serverErrors = error.response.data;
                if (typeof serverErrors === 'object' && !serverErrors.detail) {
                    setErrors(serverErrors);
                } else if (serverErrors.detail) {
                    notification.error(serverErrors.detail);
                } else {
                    notification.error('Lưu vai trò thất bại');
                }
            } else {
                notification.error('Lưu vai trò thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissions((prev) => {
            if (prev.includes(permissionId)) {
                return prev.filter((id) => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleCategoryToggle = (categoryPermissions) => {
        const categoryPermissionIds = categoryPermissions.map((p) => p.id);
        const allSelected = categoryPermissionIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((id) => !categoryPermissionIds.includes(id)));
        } else {
            setSelectedPermissions((prev) => {
                const newSelected = [...prev];
                categoryPermissionIds.forEach((id) => {
                    if (!newSelected.includes(id)) {
                        newSelected.push(id);
                    }
                });
                return newSelected;
            });
        }
    };

    const isCategoryFullySelected = (categoryPermissions) => {
        return categoryPermissions.every((p) => selectedPermissions.includes(p.id));
    };

    if (loading && isEditMode) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="role-form">
            <div className="page-header">
                <div className="header-left">
                    <h1>{isEditMode ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}</h1>
                    <p className="subtitle">
                        {isEditMode ? 'Cập nhật thông tin vai trò và phân quyền' : 'Thêm vai trò mới vào hệ thống'}
                    </p>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {/* Thông tin cơ bản */}
                    <div className="form-section">
                        <h3 className="section-title">Thông tin cơ bản</h3>

                        <div className="form-group">
                            <label htmlFor="name">
                                Tên vai trò <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                                placeholder="Ví dụ: Admin, Teacher, Student..."
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Mô tả</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Mô tả chi tiết về vai trò này..."
                            />
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>
                    </div>

                    {/* Phân quyền */}
                    <div className="form-section permissions-section">
                        <div className="section-header">
                            <h3 className="section-title">Quyền</h3>
                            <p className="section-subtitle">
                                Chọn các quyền mà bạn muốn gán cho vai trò này. Bạn có thể chọn toàn bộ quyền trong một
                                nhóm bằng cách tick vào checkbox của nhóm.
                            </p>
                        </div>

                        {permissionsByCategory.length === 0 ? (
                            <div className="no-permissions">Không có phân quyền nào để hiển thị</div>
                        ) : (
                            <div className="permissions-grid">
                                {permissionsByCategory.map((category) => (
                                    <div key={category.category_id} className="permission-category-card">
                                        <div className="category-header">
                                            <label className="category-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={isCategoryFullySelected(category.permissions)}
                                                    onChange={() => handleCategoryToggle(category.permissions)}
                                                />
                                                <span className="category-name">{category.category_name}</span>
                                            </label>
                                        </div>

                                        <div className="permissions-list">
                                            {category.permissions.map((permission) => (
                                                <label key={permission.id} className="permission-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.includes(permission.id)}
                                                        onChange={() => handlePermissionToggle(permission.id)}
                                                    />
                                                    <span className="permission-label">
                                                        <span className="permission-desc">
                                                            {permission.description || permission.code}
                                                        </span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="selected-count">
                            Đã chọn: <strong>{selectedPermissions.length}</strong> quyền
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/admin/roles')}>
                            <FaTimes /> Hủy
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <FaSave /> {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleForm;
