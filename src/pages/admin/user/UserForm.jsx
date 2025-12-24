import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import UserService from '../../../services/UserService';
import RoleService from '../../../services/RoleService';
import './UserForm.css';
import notification from '../../../utils/notification';

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        full_name: '',
        phone: '',
        address: '',
        dob: '',
        gender: '',
        description: '',
        active: true,
        role_ids: [],
    });

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadRoles();
        if (isEditMode) {
            loadUserData();
        }
    }, [id]);

    const loadRoles = async () => {
        try {
            const data = await RoleService.getAll();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles:', error);
        }
    };

    const loadUserData = async () => {
        setLoading(true);
        try {
            const data = await UserService.getById(id);
            setFormData({
                username: data.username,
                email: data.email,
                password: '',
                password_confirm: '',
                full_name: data.full_name || '',
                phone: data.phone || '',
                address: data.address || '',
                dob: data.dob || '',
                gender: data.gender || '',
                description: data.description || '',
                active: data.active,
                role_ids: data.roles ? data.roles.map((role) => role.id) : [],
            });
        } catch (error) {
            console.error('Failed to load user:', error);
            notification.error('Không thể tải thông tin người dùng');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username là bắt buộc';
        } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username chỉ được chứa chữ thường, số và gạch dưới';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!isEditMode) {
            if (!formData.password) {
                newErrors.password = 'Mật khẩu là bắt buộc';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            }

            if (formData.password !== formData.password_confirm) {
                newErrors.password_confirm = 'Mật khẩu xác nhận không khớp';
            }
        } else {
            if (formData.password && formData.password.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            }

            if (formData.password && formData.password !== formData.password_confirm) {
                newErrors.password_confirm = 'Mật khẩu xác nhận không khớp';
            }
        }

        setErrors(newErrors);
        const errorKeys = Object.keys(newErrors);
        if (errorKeys.length > 0) {
            const firstError = newErrors[errorKeys[0]];
            notification.error(firstError, 'Lỗi validation');
        }
        return errorKeys.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const submitData = {
            username: formData.username,
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
            dob: formData.dob || null,
            gender: formData.gender || null,
            description: formData.description,
            active: formData.active,
        };

        if (!isEditMode || formData.password) {
            submitData.password = formData.password;
        }

        try {
            let response;
            if (isEditMode) {
                response = await UserService.update(id, submitData);

                // Cập nhật roles nếu có thay đổi
                if (formData.role_ids.length > 0) {
                    await UserService.assignRoles(id, formData.role_ids);
                }
            } else {
                response = await UserService.create(submitData);

                // Gán roles cho user mới
                if (formData.role_ids.length > 0) {
                    await UserService.assignRoles(response.user.id, formData.role_ids);
                }
            }

            notification.success(response.detail || 'Lưu người dùng thành công');
            navigate('/admin/users');
        } catch (error) {
            console.error('Error saving user:', error);

            if (error.response?.data) {
                const serverErrors = error.response.data;
                if (typeof serverErrors === 'object' && !serverErrors.detail) {
                    setErrors(serverErrors);
                } else if (serverErrors.detail) {
                    notification.error(serverErrors.detail);
                } else {
                    notification.error('Lưu người dùng thất bại');
                }
            } else {
                notification.error('Lưu người dùng thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleRoleToggle = (roleId) => {
        setFormData((prev) => ({
            ...prev,
            role_ids: prev.role_ids.includes(roleId)
                ? prev.role_ids.filter((id) => id !== roleId)
                : [...prev.role_ids, roleId],
        }));
    };

    if (loading && isEditMode) {
        return (
            <div className="user-form-loading-container">
                <div className="user-form-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="user-form">
            <div className="user-form-page-header">
                <div className="user-form-header-left">
                    <h1>{isEditMode ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}</h1>
                    <p className="user-form-subtitle">
                        {isEditMode ? 'Cập nhật thông tin người dùng' : 'Thêm người dùng mới vào hệ thống'}
                    </p>
                </div>
            </div>

            <div className="user-form-container">
                <form onSubmit={handleSubmit}>
                    {/* Account Info */}
                    <div className="user-form-section">
                        <h3 className="user-form-section-title">Thông tin tài khoản</h3>

                        <div className="user-form-row">
                            <div className="user-form-group">
                                <label htmlFor="username">
                                    Username <span className="user-form-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={errors.username ? 'user-form-error' : ''}
                                    placeholder="johndoe"
                                    disabled={isEditMode}
                                />
                                {errors.username && <span className="user-form-error-message">{errors.username}</span>}
                                <span className="user-form-input-hint">Chỉ sử dụng chữ thường, số và gạch dưới</span>
                            </div>

                            <div className="user-form-group">
                                <label htmlFor="email">
                                    Email <span className="user-form-required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'user-form-error' : ''}
                                    placeholder="john@example.com"
                                />
                                {errors.email && <span className="user-form-error-message">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="user-form-row">
                            <div className="user-form-group">
                                <label htmlFor="password">
                                    {isEditMode ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}{' '}
                                    {!isEditMode && <span className="user-form-required">*</span>}
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={errors.password ? 'user-form-error' : ''}
                                    placeholder="••••••••"
                                />
                                {errors.password && <span className="user-form-error-message">{errors.password}</span>}
                                <span className="user-form-input-hint">Tối thiểu 6 ký tự</span>
                            </div>

                            <div className="user-form-group">
                                <label htmlFor="password_confirm">
                                    Xác nhận mật khẩu {!isEditMode && <span className="user-form-required">*</span>}
                                </label>
                                <input
                                    type="password"
                                    id="password_confirm"
                                    name="password_confirm"
                                    value={formData.password_confirm}
                                    onChange={handleChange}
                                    className={errors.password_confirm ? 'user-form-error' : ''}
                                    placeholder="••••••••"
                                />
                                {errors.password_confirm && (
                                    <span className="user-form-error-message">{errors.password_confirm}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="user-form-section">
                        <h3 className="user-form-section-title">Thông tin cá nhân</h3>

                        <div className="user-form-group">
                            <label htmlFor="full_name">Họ và tên</label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        <div className="user-form-row">
                            <div className="user-form-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0123456789"
                                />
                            </div>

                            <div className="user-form-group">
                                <label htmlFor="dob">Ngày sinh</label>
                                <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="user-form-row">
                            <div className="user-form-group">
                                <label htmlFor="gender">Giới tính</label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">-- Chọn giới tính --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div className="user-form-group">
                                <label htmlFor="address">Địa chỉ</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Hà Nội, Việt Nam"
                                />
                            </div>
                        </div>

                        <div className="user-form-group">
                            <label htmlFor="description">Giới thiệu bản thân</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Mô tả ngắn về bản thân..."
                            />
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="user-form-section">
                        <h3 className="user-form-section-title">Vai trò (Roles)</h3>
                        <div className="user-form-checkbox-group">
                            {roles.map((role) => (
                                <label key={role.id} className="user-form-checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.role_ids.includes(role.id)}
                                        onChange={() => handleRoleToggle(role.id)}
                                    />
                                    <span>{role.name}</span>
                                    {role.description && (
                                        <span className="user-form-role-desc">{role.description}</span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="user-form-section">
                        <h3 className="user-form-section-title">Trạng thái</h3>
                        <label className="user-form-checkbox-item">
                            <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
                            <span>Kích hoạt tài khoản</span>
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="user-form-actions">
                        <button type="button" className="user-form-btn-cancel" onClick={() => navigate('/admin/users')}>
                            <FaTimes /> Hủy
                        </button>
                        <button type="submit" className="user-form-btn-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="user-form-btn-spinner"></div>
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

export default UserForm;
