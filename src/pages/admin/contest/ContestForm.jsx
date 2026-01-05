import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaTrophy,
    FaCalendarAlt,
    FaClock,
    FaEye,
    FaEyeSlash,
    FaSave,
    FaTimes,
    FaExclamationCircle,
    FaCheckCircle,
    FaArrowLeft,
} from 'react-icons/fa';
import './ContestForm.css';
import ContestService from '../../../services/ContestService';
import ContestProblemManager from './ContestProblemManager';
import notification from '../../../utils/notification';

const ContestForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        description: '',
        start_at: '',
        end_at: '',
        visibility: 'private',
        contest_mode: 'ICPC',
        is_show_result: true,
        penalty_time: 20,
        penalty_mode: 'standard',
        freeze_rankings_at: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [contestData, setContestData] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            loadContest();
        }
    }, [id]);

    const loadContest = async () => {
        setLoading(true);
        try {
            const data = await ContestService.getById(id);
            setContestData(data);
            setFormData({
                slug: data.slug || '',
                title: data.title || '',
                description: data.description || '',
                start_at: data.start_at ? formatDateTimeLocal(data.start_at) : '',
                end_at: data.end_at ? formatDateTimeLocal(data.end_at) : '',
                visibility: data.visibility || 'private',
                contest_mode: data.contest_mode || 'ICPC',
                is_show_result: data.is_show_result !== undefined ? data.is_show_result : true,
                penalty_time: data.penalty_time || 20,
                penalty_mode: data.penalty_mode || 'standard',
                freeze_rankings_at: data.freeze_rankings_at ? formatDateTimeLocal(data.freeze_rankings_at) : '',
            });
        } catch (error) {
            console.error('Error loading contest:', error);
            setErrorMessage('Không thể tải thông tin contest');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTimeLocal = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug là bắt buộc';
        } else if (!/^[a-z0-9-_]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug chỉ được chứa chữ thường, số, gạch ngang và gạch dưới';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        }

        if (!formData.start_at) {
            newErrors.start_at = 'Thời gian bắt đầu là bắt buộc';
        }

        if (!formData.end_at) {
            newErrors.end_at = 'Thời gian kết thúc là bắt buộc';
        }

        if (formData.start_at && formData.end_at) {
            const startDate = new Date(formData.start_at);
            const endDate = new Date(formData.end_at);
            if (endDate <= startDate) {
                newErrors.end_at = 'Thời gian kết thúc phải sau thời gian bắt đầu';
            }
        }

        if (formData.freeze_rankings_at) {
            const freezeDate = new Date(formData.freeze_rankings_at);
            const endDate = new Date(formData.end_at);
            if (freezeDate >= endDate) {
                newErrors.freeze_rankings_at = 'Thời gian đóng băng phải trước thời gian kết thúc';
            }
        }

        setErrors(newErrors);

        // Show notification for first error
        const errorKeys = Object.keys(newErrors);
        if (errorKeys.length > 0) {
            const firstError = newErrors[errorKeys[0]];
            notification.error(firstError, 'Validation Error');
        }

        return errorKeys.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Format dates to ISO 8601
            const submitData = {
                ...formData,
                start_at: new Date(formData.start_at).toISOString(),
                end_at: new Date(formData.end_at).toISOString(),
                freeze_rankings_at: formData.freeze_rankings_at
                    ? new Date(formData.freeze_rankings_at).toISOString()
                    : null,
                penalty_time: parseInt(formData.penalty_time),
            };

            let response;
            if (isEditMode) {
                response = await ContestService.update(id, submitData);
                notification.success('Contest đã được cập nhật thành công!');
            } else {
                response = await ContestService.create(submitData);
                notification.success(`Contest đã được tạo thành công! DOMjudge ID: ${response.domjudge_contest_id}`);
            }

            setTimeout(() => {
                navigate('/admin/contests');
            }, 1500);
        } catch (error) {
            console.error('Error saving contest:', error);
            notification.error(error.details || error.error || 'Failed to save contest');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="contest-form-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin contest...</p>
            </div>
        );
    }

    return (
        <div className="contest-form">
            <div className="contest-form-page-header">
                <div className="contest-form-header-left">
                    <h1>{isEditMode ? 'Chỉnh sửa Contest' : 'Tạo Contest mới'}</h1>
                    <p className="contest-form-subtitle">
                        {isEditMode ? 'Cập nhật thông tin contest' : 'Điền thông tin để tạo contest mới'}
                    </p>
                </div>
            </div>

            <div className="contest-form-container">
                <form onSubmit={handleSubmit} className="contest-form-inner">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="contest-form-message success">
                            <FaCheckCircle /> {successMessage}
                        </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="contest-form-message error">
                            <FaExclamationCircle /> {errorMessage}
                        </div>
                    )}

                    {/* Slug */}
                    <div className="contest-form-group">
                        <label htmlFor="slug">
                            Slug Contest <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="my-contest-2025"
                            disabled={isEditMode}
                            className={errors.slug ? 'error' : ''}
                        />
                        {errors.slug && <span className="contest-error-message">{errors.slug}</span>}
                        <small>Định danh duy nhất (chỉ chữ thường, số, gạch ngang, gạch dưới)</small>
                    </div>

                    {/* Title */}
                    <div className="contest-form-group">
                        <label htmlFor="title">
                            Tiêu đề Contest <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Cuộc thi lập trình 2025"
                            className={errors.title ? 'error' : ''}
                        />
                        {errors.title && <span className="contest-error-message">{errors.title}</span>}
                    </div>

                    {/* Description */}
                    <div className="contest-form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Mô tả contest..."
                        />
                    </div>

                    {/* Date Time Row */}
                    <div className="contest-form-row">
                        <div className="contest-form-group">
                            <label htmlFor="start_at">
                                <FaCalendarAlt /> Thời gian bắt đầu <span className="required">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                id="start_at"
                                name="start_at"
                                value={formData.start_at}
                                onChange={handleChange}
                                className={errors.start_at ? 'error' : ''}
                            />
                            {errors.start_at && <span className="contest-error-message">{errors.start_at}</span>}
                        </div>

                        <div className="contest-form-group">
                            <label htmlFor="end_at">
                                <FaClock /> Thời gian kết thúc <span className="required">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                id="end_at"
                                name="end_at"
                                value={formData.end_at}
                                onChange={handleChange}
                                className={errors.end_at ? 'error' : ''}
                            />
                            {errors.end_at && <span className="contest-error-message">{errors.end_at}</span>}
                        </div>
                    </div>

                    {/* Settings Row */}
                    <div className="contest-form-row">
                        <div className="contest-form-group">
                            <label htmlFor="visibility">
                                {formData.visibility === 'public' ? <FaEye /> : <FaEyeSlash />} Hiển thị
                            </label>
                            <select
                                id="visibility"
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleChange}
                            >
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                            </select>
                        </div>

                        <div className="contest-form-group">
                            <label htmlFor="contest_mode">
                                <FaTrophy /> Chế độ Contest
                            </label>
                            <select
                                id="contest_mode"
                                name="contest_mode"
                                value={formData.contest_mode}
                                onChange={handleChange}
                            >
                                <option value="ICPC">ICPC Mode (chỉ AC/WA)</option>
                                <option value="OI">OI Mode (hiển thị test cases đạt)</option>
                            </select>
                            <small>ICPC: Chỉ hiện AC/WA, OI: Hiện kết quả test (VD: 17/18)</small>
                        </div>

                        <div className="contest-form-group">
                            <label htmlFor="is_show_result">
                                <input
                                    type="checkbox"
                                    id="is_show_result"
                                    name="is_show_result"
                                    checked={formData.is_show_result}
                                    onChange={handleChange}
                                    style={{ width: 'auto', marginRight: '8px' }}
                                />
                                Hiển thị kết quả chi tiết
                            </label>
                            <small>Cho phép thí sinh xem chi tiết test case và thông báo lỗi</small>
                        </div>
                    </div>

                    {/* Penalty Settings Row */}
                    <div className="contest-form-row">
                        <div className="contest-form-group">
                            <label htmlFor="penalty_time">Thời gian phạt (phút)</label>
                            <input
                                type="number"
                                id="penalty_time"
                                name="penalty_time"
                                value={formData.penalty_time}
                                onChange={handleChange}
                                min="0"
                                step="1"
                            />
                            <small>Phạt thêm cho mỗi lần nộp sai (ICPC: 20 phút)</small>
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="contest-form-row">
                        <div className="contest-form-group">
                            <label htmlFor="penalty_mode">Chế độ phạt</label>
                            <select
                                id="penalty_mode"
                                name="penalty_mode"
                                value={formData.penalty_mode}
                                onChange={handleChange}
                            >
                                <option value="none">Không phạt</option>
                                <option value="standard">Phạt chuẩn</option>
                            </select>
                        </div>

                        <div className="contest-form-group">
                            <label htmlFor="freeze_rankings_at">Đóng băng xếp hạng lúc</label>
                            <input
                                type="datetime-local"
                                id="freeze_rankings_at"
                                name="freeze_rankings_at"
                                value={formData.freeze_rankings_at}
                                onChange={handleChange}
                                className={errors.freeze_rankings_at ? 'error' : ''}
                            />
                            {errors.freeze_rankings_at && (
                                <span className="contest-error-message">{errors.freeze_rankings_at}</span>
                            )}
                            <small>Tùy chọn: Thời gian đóng băng bảng xếp hạng</small>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="contest-form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/contests')}
                            className="contest-btn-cancel"
                            disabled={isSubmitting}
                        >
                            <FaTimes /> Hủy
                        </button>
                        <button type="submit" className="contest-btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>Đang xử lý...</>
                            ) : (
                                <>
                                    <FaSave /> {isEditMode ? 'Cập nhật Contest' : 'Tạo Contest'}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Problem Manager - Only show in edit mode */}
                {isEditMode && contestData && (
                    <ContestProblemManager
                        contestId={id}
                        contestProblems={contestData.problems || []}
                        onUpdate={loadContest}
                    />
                )}
            </div>
        </div>
    );
};

export default ContestForm;
