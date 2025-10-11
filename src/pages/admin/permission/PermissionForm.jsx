import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import PermissionService from '../../../services/PermissionService';
import PermissionCategoryService from '../../../services/PermissionCategoryService';
import './PermissionForm.css';

const PermissionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        category_id: '',
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadCategories();
        if (isEditMode) {
            loadPermissionData();
        }
    }, [id]);

    const loadCategories = async () => {
        try {
            const data = await PermissionCategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadPermissionData = async () => {
        setLoading(true);
        try {
            const data = await PermissionService.getById(id);
            setFormData({
                code: data.code,
                description: data.description || '',
                category_id: data.category?.id || '',
            });
        } catch (error) {
            console.error('Failed to load permission:', error);
            alert('Không thể tải thông tin phân quyền');
            navigate('/admin/permissions');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Mã phân quyền là bắt buộc';
        } else if (!/^[a-z0-9_.]+$/.test(formData.code)) {
            newErrors.code = 'Mã phân quyền chỉ được chứa chữ thường, số, dấu chấm và gạch dưới';
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

        // Chuẩn bị data để gửi
        const submitData = {
            code: formData.code,
            description: formData.description,
            category_id: formData.category_id || null,
        };

        try {
            let response;
            if (isEditMode) {
                response = await PermissionService.update(id, submitData);
            } else {
                response = await PermissionService.create(submitData);
            }

            alert(response.detail);
            navigate('/admin/permissions');
        } catch (error) {
            console.error('Error saving permission:', error);

            if (error.response?.data) {
                const serverErrors = error.response.data;
                if (typeof serverErrors === 'object' && !serverErrors.detail) {
                    setErrors(serverErrors);
                } else if (serverErrors.detail) {
                    alert(serverErrors.detail);
                } else {
                    alert('Lưu phân quyền thất bại');
                }
            } else {
                alert('Lưu phân quyền thất bại');
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

    if (loading && isEditMode) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="permission-form">
            <div className="page-header">
                <div className="header-left">
                    <h1>{isEditMode ? 'Chỉnh sửa phân quyền' : 'Tạo phân quyền mới'}</h1>
                    <p className="subtitle">
                        {isEditMode ? 'Cập nhật thông tin phân quyền' : 'Thêm phân quyền mới vào hệ thống'}
                    </p>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="code">
                            Mã phân quyền <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className={errors.code ? 'error' : ''}
                            placeholder="Ví dụ: user.create, course.update..."
                        />
                        {errors.code && <span className="error-message">{errors.code}</span>}
                        <span className="input-hint">Chỉ sử dụng chữ thường, số, dấu chấm (.) và gạch dưới (_)</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Mô tả chi tiết về phân quyền này..."
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category_id">Loại phân quyền</label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className={errors.category_id ? 'error' : ''}
                        >
                            <option value="">-- Chọn loại phân quyền (tùy chọn) --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && <span className="error-message">{errors.category_id}</span>}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/admin/permissions')}>
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

export default PermissionForm;
