import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import PermissionCategoryService from '../../../services/PermissionCategoryService';
import './PermissionCategoryForm.css';
import notification from '../../../utils/notification';

const PermissionCategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            loadCategoryData();
        }
    }, [id]);

    const loadCategoryData = async () => {
        setLoading(true);
        try {
            const data = await PermissionCategoryService.getById(id);
            setFormData({
                name: data.name,
                description: data.description || '',
            });
        } catch (error) {
            console.error('Failed to load permission category:', error);
            notification.error('Không thể tải thông tin loại phân quyền');
            navigate('/admin/permission-categories');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên loại phân quyền là bắt buộc';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Tên loại phân quyền phải có ít nhất 3 ký tự';
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

        try {
            let response;
            if (isEditMode) {
                response = await PermissionCategoryService.update(id, formData);
            } else {
                response = await PermissionCategoryService.create(formData);
            }

            notification.success(response.detail);
            navigate('/admin/permission-categories');
        } catch (error) {
            console.error('Error saving permission category:', error);

            if (error.response?.data) {
                const serverErrors = error.response.data;
                if (typeof serverErrors === 'object' && !serverErrors.detail) {
                    setErrors(serverErrors);
                } else if (serverErrors.detail) {
                    notification.error(serverErrors.detail);
                } else {
                    notification.error('Lưu loại phân quyền thất bại');
                }
            } else {
                notification.error('Lưu loại phân quyền thất bại');
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
        // Clear error khi user nhập
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
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
        <div className="permission-category-form">
            <div className="page-header">
                <div className="header-left">
                    <h1>{isEditMode ? 'Chỉnh sửa loại phân quyền' : 'Tạo loại phân quyền mới'}</h1>
                    <p className="subtitle">
                        {isEditMode ? 'Cập nhật thông tin loại phân quyền' : 'Thêm loại phân quyền mới vào hệ thống'}
                    </p>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">
                            Tên loại phân quyền <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? 'error' : ''}
                            placeholder="Ví dụ: User Management, Course Management..."
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
                            rows="4"
                            placeholder="Mô tả chi tiết về loại phân quyền này..."
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/admin/permission-categories')}
                        >
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

export default PermissionCategoryForm;
