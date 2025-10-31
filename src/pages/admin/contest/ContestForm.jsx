import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FaTrophy, FaCalendarAlt, FaClock, FaEye, FaEyeSlash, 
    FaSave, FaTimes, FaExclamationCircle, FaCheckCircle, FaArrowLeft 
} from 'react-icons/fa';
import './ContestForm.css';
import ContestService from '../../../services/ContestService';
import ContestProblemManager from './ContestProblemManager';

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
        penalty_time: 20,
        penalty_mode: 'standard',
        freeze_rankings_at: ''
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
                penalty_time: data.penalty_time || 20,
                penalty_mode: data.penalty_mode || 'standard',
                freeze_rankings_at: data.freeze_rankings_at ? formatDateTimeLocal(data.freeze_rankings_at) : ''
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
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug is required';
        } else if (!/^[a-z0-9-_]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug can only contain lowercase letters, numbers, hyphens, and underscores';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.start_at) {
            newErrors.start_at = 'Start time is required';
        }

        if (!formData.end_at) {
            newErrors.end_at = 'End time is required';
        }

        if (formData.start_at && formData.end_at) {
            const startDate = new Date(formData.start_at);
            const endDate = new Date(formData.end_at);
            if (endDate <= startDate) {
                newErrors.end_at = 'End time must be after start time';
            }
        }

        if (formData.freeze_rankings_at) {
            const freezeDate = new Date(formData.freeze_rankings_at);
            const endDate = new Date(formData.end_at);
            if (freezeDate >= endDate) {
                newErrors.freeze_rankings_at = 'Freeze time must be before end time';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Format dates to ISO 8601
            const submitData = {
                ...formData,
                start_at: new Date(formData.start_at).toISOString(),
                end_at: new Date(formData.end_at).toISOString(),
                freeze_rankings_at: formData.freeze_rankings_at 
                    ? new Date(formData.freeze_rankings_at).toISOString() 
                    : null,
                penalty_time: parseInt(formData.penalty_time)
            };

            let response;
            if (isEditMode) {
                response = await ContestService.update(id, submitData);
                setSuccessMessage('Contest đã được cập nhật thành công!');
            } else {
                response = await ContestService.create(submitData);
                setSuccessMessage(`Contest đã được tạo thành công! DOMjudge ID: ${response.domjudge_contest_id}`);
            }

            setTimeout(() => {
                navigate('/admin/contests');
            }, 1500);

        } catch (error) {
            console.error('Error saving contest:', error);
            setErrorMessage(error.details || error.error || 'Failed to save contest');
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
                    <h1>{isEditMode ? 'Edit Contest' : 'Create New Contest'}</h1>
                    <p className="contest-form-subtitle">
                        {isEditMode ? 'Update contest information' : 'Fill in the details to create a new contest'}
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
                        Contest Slug <span className="required">*</span>
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
                    {errors.slug && <span className="error-message">{errors.slug}</span>}
                    <small>Unique identifier (lowercase, numbers, hyphens, underscores only)</small>
                </div>

                {/* Title */}
                <div className="contest-form-group">
                    <label htmlFor="title">
                        Contest Title <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Programming Contest 2025"
                        className={errors.title ? 'error' : ''}
                    />
                    {errors.title && <span className="error-message">{errors.title}</span>}
                </div>

                {/* Description */}
                <div className="contest-form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Contest description..."
                    />
                </div>

                {/* Date Time Row */}
                <div className="contest-form-row">
                    <div className="contest-form-group">
                        <label htmlFor="start_at">
                            <FaCalendarAlt /> Start Time <span className="required">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            id="start_at"
                            name="start_at"
                            value={formData.start_at}
                            onChange={handleChange}
                            className={errors.start_at ? 'error' : ''}
                        />
                        {errors.start_at && <span className="error-message">{errors.start_at}</span>}
                    </div>

                    <div className="contest-form-group">
                        <label htmlFor="end_at">
                            <FaClock /> End Time <span className="required">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            id="end_at"
                            name="end_at"
                            value={formData.end_at}
                            onChange={handleChange}
                            className={errors.end_at ? 'error' : ''}
                        />
                        {errors.end_at && <span className="error-message">{errors.end_at}</span>}
                    </div>
                </div>

                {/* Settings Row */}
                <div className="contest-form-row">
                    <div className="contest-form-group">
                        <label htmlFor="visibility">
                            {formData.visibility === 'public' ? <FaEye /> : <FaEyeSlash />} Visibility
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
                        <label htmlFor="penalty_time">Penalty Time (minutes)</label>
                        <input
                            type="number"
                            id="penalty_time"
                            name="penalty_time"
                            value={formData.penalty_time}
                            onChange={handleChange}
                            min="0"
                            step="1"
                        />
                        <small>Penalty added per wrong submission (ICPC: 20 min)</small>
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="contest-form-row">
                    <div className="contest-form-group">
                        <label htmlFor="penalty_mode">Penalty Mode</label>
                        <select
                            id="penalty_mode"
                            name="penalty_mode"
                            value={formData.penalty_mode}
                            onChange={handleChange}
                        >
                            <option value="none">No Penalty</option>
                            <option value="standard">Standard Penalty</option>
                        </select>
                    </div>

                    <div className="contest-form-group">
                        <label htmlFor="freeze_rankings_at">Freeze Rankings At</label>
                        <input
                            type="datetime-local"
                            id="freeze_rankings_at"
                            name="freeze_rankings_at"
                            value={formData.freeze_rankings_at}
                            onChange={handleChange}
                            className={errors.freeze_rankings_at ? 'error' : ''}
                        />
                        {errors.freeze_rankings_at && <span className="error-message">{errors.freeze_rankings_at}</span>}
                        <small>Optional: Time to freeze the scoreboard</small>
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
                    <button 
                        type="submit" 
                        className="contest-btn-submit"
                        disabled={isSubmitting}
                    >
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
