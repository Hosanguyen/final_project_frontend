import React, { useState, useEffect } from 'react';
import notification from '../../../utils/notification';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FaSave, FaTimes, FaBookOpen, FaInfoCircle, FaPlus, FaTrash, 
    FaFileAlt, FaVideo, FaFilePdf, FaLink, FaFileUpload
} from 'react-icons/fa';
import LessonService from '../../../services/LessonService';
import CourseService from '../../../services/CourseService';
import './LessonFormPage.css';

const LessonFormPage = () => {
    const navigate = useNavigate();
    const { courseId, id } = useParams();
    const isEdit = Boolean(id);
    const isStandalone = !courseId; // Tạo lesson độc lập, không gắn với course cụ thể

    const [formData, setFormData] = useState({
        course: courseId || '',
        title: '',
        description: '',
        sequence: 0
    });

    const [courses, setCourses] = useState([]);
    const [resources, setResources] = useState([]);
    const [deletedResourceIds, setDeletedResourceIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const coursesData = await CourseService.getCourses();
            setCourses(coursesData);

            if (isEdit) {
                const lessonData = await LessonService.getLesson(id);
                setFormData({
                    course: lessonData.course || courseId || '',
                    title: lessonData.title || '',
                    description: lessonData.description || '',
                    sequence: lessonData.sequence || 0
                });

                // Load resources
                if (lessonData.resources && lessonData.resources.length > 0) {
                    const mappedResources = lessonData.resources.map(resource => ({
                        ...resource,
                        fileName: resource.filename || '',
                        isNew: false
                    }));
                    setResources(mappedResources);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            notification.error('Không thể tải dữ liệu');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const addResource = () => {
        setResources([...resources, {
            type: 'text',
            title: '',
            content: '',
            url: '',
            file: null,
            sequence: resources.length,
            isNew: true
        }]);
    };

    const removeResource = (index) => {
        const resource = resources[index];
        // Nếu resource đã tồn tại (có id), thêm vào danh sách xóa
        if (resource.id) {
            setDeletedResourceIds([...deletedResourceIds, resource.id]);
        }
        setResources(resources.filter((_, i) => i !== index));
    };

    const updateResource = (index, field, value) => {
        const newResources = [...resources];
        newResources[index] = {
            ...newResources[index],
            [field]: value,
            // Đánh dấu resource đã được sửa đổi nếu nó đã tồn tại
            isModified: newResources[index].id ? true : newResources[index].isModified
        };
        setResources(newResources);
    };

    const handleFileChange = (index, file) => {
        // Cập nhật cả file và fileName cùng lúc để tránh race condition
        const newResources = [...resources];
        newResources[index] = {
            ...newResources[index],
            file: file,
            fileName: file ? file.name : ''
        };
        setResources(newResources);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        }    

        // Chỉ bắt buộc course nếu đang tạo từ course detail page
        if (!isStandalone && !formData.course) {
            newErrors.course = 'Vui lòng chọn khóa học';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            let lessonId = id;

            // Save lesson
            if (isEdit) {
                await LessonService.updateLesson(id, formData);
                notification.success('Cập nhật bài học thành công!');
            } else {
                const newLesson = await LessonService.createLesson(formData);
                lessonId = newLesson.id;
                notification.success('Tạo bài học thành công!');
            }

            // Delete removed resources
            for (const resourceId of deletedResourceIds) {
                console.log('Deleting resource:', resourceId);
                await LessonService.deleteLessonResource(resourceId);
            }

            // Save resources
            for (const resource of resources) {
                if (resource.isNew || !resource.id) {
                    // Create new resource
                    console.log('=== Creating New Resource ===');
                    console.log('Resource type:', resource.type);
                    console.log('Resource file:', resource.file);
                    console.log('Has file?', Boolean(resource.file));
                    
                    const resourceFormData = new FormData();
                    resourceFormData.append('lesson', lessonId);
                    resourceFormData.append('type', resource.type);
                    resourceFormData.append('title', resource.title || '');
                    resourceFormData.append('sequence', resource.sequence);

                    // Handle file upload for file, video, and pdf types
                    if ((resource.type === 'file' || resource.type === 'video' || resource.type === 'pdf') && resource.file) {
                        console.log('Appending file to FormData:', resource.file.name);
                        resourceFormData.append('file', resource.file);
                    } else if (resource.type === 'link') {
                        resourceFormData.append('url', resource.url || '');
                    } else if (resource.type === 'text') {
                        resourceFormData.append('content', resource.content || '');
                    }

                    await LessonService.createLessonResource(resourceFormData);
                } else if (resource.isModified) {
                    // Update existing resource
                    console.log('=== Updating Resource ===', resource.id);
                    console.log('Resource type:', resource.type);
                    console.log('Resource file:', resource.file);
                    console.log('Has new file?', Boolean(resource.file));
                    
                    const resourceFormData = new FormData();
                    resourceFormData.append('lesson', lessonId);
                    resourceFormData.append('type', resource.type);
                    resourceFormData.append('title', resource.title || '');
                    resourceFormData.append('sequence', resource.sequence);

                    // Handle file upload - ch? append n?u c� file M?I du?c ch?n
                    if ((resource.type === 'file' || resource.type === 'video' || resource.type === 'pdf') && resource.file) {
                        console.log('Appending new file to FormData:', resource.file.name);
                        resourceFormData.append('file', resource.file);
                    } else if (resource.type === 'link') {
                        resourceFormData.append('url', resource.url || '');
                    } else if (resource.type === 'text') {
                        resourceFormData.append('content', resource.content || '');
                    }

                    await LessonService.updateLessonResource(resource.id, resourceFormData);
                }
            }

            // Navigate based on context
            if (courseId) {
                navigate(`/admin/courses/${courseId}`);
            } else if (formData.course) {
                navigate(`/admin/courses/${formData.course}`);
            } else {
                navigate('/admin/lessons');
            }
        } catch (error) {
            console.error('Error saving lesson:', error);
            if (error.response?.data) {
                const serverErrors = error.response.data;
                setErrors(serverErrors);
            }
            notification.error('Lưu bài học thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'video': return <FaVideo />;
            case 'pdf': return <FaFilePdf />;
            case 'file': return <FaFileAlt />;
            case 'link': return <FaLink />;
            default: return <FaFileAlt />;
        }
    };

    return (
        <div className="lesson-form-page">
            <div className="lesson-form-page-header">
                <div className="lesson-form-page-header-left">
                    <FaBookOpen className="lesson-form-page-header-icon" />
                    <h1>{isEdit ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}</h1>
                </div>
                <button 
                    className="lesson-form-page-btn-back" 
                    onClick={() => {
                        if (courseId) {
                            navigate(`/admin/courses/${courseId}`);
                        } else {
                            navigate('/admin/lessons');
                        }
                    }}
                >
                    <FaTimes /> Hủy
                </button>
            </div>

            <form onSubmit={handleSubmit} className="lesson-form-page-form">
                <div className="lesson-form-page-card">
                    <h2>Thông tin bài học</h2>
                    
                    <div className="lesson-form-page-form-group">
                        <label>
                            Khóa học {!isStandalone && <span className="lesson-form-page-required">*</span>}
                        </label>
                        <select
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            className={errors.course ? 'error' : ''}
                            disabled={Boolean(courseId)}
                        >
                            <option value="">-- Không gắn khóa học --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        {errors.course && (
                            <span className="lesson-form-page-error-text">
                                <FaInfoCircle /> {errors.course}
                            </span>
                        )}
                    </div>

                    <div className="lesson-form-page-form-group">
                        <label>
                            Tiêu đề <span className="lesson-form-page-required">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Nhập tiêu đề bài học"
                            className={errors.title ? 'error' : ''}
                        />
                        {errors.title && (
                            <span className="lesson-form-page-error-text">
                                <FaInfoCircle /> {errors.title}
                            </span>
                        )}
                    </div>

                    <div className="lesson-form-page-form-group">
                        <label>Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Mô tả nội dung bài học"
                            rows="4"
                        />
                    </div>

                    <div className="lesson-form-page-form-group">
                        <label>Thứ tự</label>
                        <input
                            type="number"
                            name="sequence"
                            value={formData.sequence}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>

                <div className="lesson-form-page-card">
                    <div className="lesson-form-page-resources-header">
                        <h2>Tài nguyên bài học</h2>
                        <button 
                            type="button"
                            className="lesson-form-page-btn-add-resource"
                            onClick={addResource}
                        >
                            <FaPlus /> Thêm tài nguyên
                        </button>
                    </div>

                    {resources.length === 0 ? (
                        <div className="lesson-form-page-empty-resources">
                            <FaFileUpload className="empty-icon" />
                            <p>Chưa có tài nguyên nào</p>
                        </div>
                    ) : (
                        <div className="lesson-form-page-resources-list">
                            {resources.map((resource, index) => (
                                <div key={index} className="lesson-form-page-resource-item">
                                    <div className="lesson-form-page-resource-header">
                                        <div className="resource-type-icon">
                                            {getResourceIcon(resource.type)}
                                        </div>
                                        <select
                                            value={resource.type}
                                            onChange={(e) => updateResource(index, 'type', e.target.value)}
                                            className="resource-type-select"
                                        >
                                            <option value="text">Văn bản</option>
                                            <option value="video">Video</option>
                                            <option value="pdf">PDF</option>
                                            <option value="file">File</option>
                                            <option value="link">Link</option>
                                        </select>
                                        <button
                                            type="button"
                                            className="lesson-form-page-btn-remove-resource"
                                            onClick={() => removeResource(index)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="lesson-form-page-resource-body">
                                        <div className="lesson-form-page-form-group">
                                            <label>Tiêu đề</label>
                                            <input
                                                type="text"
                                                value={resource.title || ''}
                                                onChange={(e) => updateResource(index, 'title', e.target.value)}
                                                placeholder="Tiêu đề tài nguyên"
                                            />
                                        </div>

                                        {resource.type === 'text' && (
                                            <div className="lesson-form-page-form-group">
                                                <label>Nội dung</label>
                                                <textarea
                                                    value={resource.content || ''}
                                                    onChange={(e) => updateResource(index, 'content', e.target.value)}
                                                    placeholder="Nhập nội dung văn bản"
                                                    rows="4"
                                                />
                                            </div>
                                        )}

                                        {resource.type === 'link' && (
                                            <div className="lesson-form-page-form-group">
                                                <label>URL</label>
                                                <input
                                                    type="url"
                                                    value={resource.url || ''}
                                                    onChange={(e) => updateResource(index, 'url', e.target.value)}
                                                    placeholder="https://example.com"
                                                />
                                            </div>
                                        )}

                                        {(resource.type === 'file' || resource.type === 'pdf' || resource.type === 'video') && (
                                            <div className="lesson-form-page-form-group">
                                                <label>Upload File</label>
                                                <div className="lesson-form-page-file-upload">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                                                        accept={
                                                            resource.type === 'pdf' ? '.pdf' :
                                                            resource.type === 'video' ? 'video/*' :
                                                            '*'
                                                        }
                                                    />
                                                    {resource.fileName && (
                                                        <div className="file-name">
                                                            <FaFileAlt /> {resource.fileName}
                                                        </div>
                                                    )}
                                                    {resource.file_url && !resource.file && (
                                                        <div className="file-name">
                                                            <FaFileAlt /> File đã tải lên
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lesson-form-page-actions">
                    <button 
                        type="button" 
                        className="lesson-form-page-btn-cancel"
                        onClick={() => {
                            if (courseId) {
                                navigate(`/admin/courses/${courseId}`);
                            } else {
                                navigate('/admin/lessons');
                            }
                        }}
                    >
                        <FaTimes /> Hủy
                    </button>
                    <button 
                        type="submit" 
                        className="lesson-form-page-btn-submit"
                        disabled={loading}
                    >
                        <FaSave /> {loading ? 'Đang lưu...' : 'Lưu bài học'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LessonFormPage;
