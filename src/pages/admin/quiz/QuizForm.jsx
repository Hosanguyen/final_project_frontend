import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import QuizService from '../../../services/QuizService';
import LessonService from '../../../services/LessonService';
import notification from '../../../utils/notification';
import CKEditorComponent from '../../../components/CKEditor';
import './QuizForm.css';

const QuizForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        time_limit_seconds: 3600,
        is_published: false,
        lesson_ids: [],
    });

    const [questions, setQuestions] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadLessons();
        if (isEditMode) {
            loadQuizData();
        } else {
            // Add default question for new quiz
            addQuestion();
        }
    }, [id]);

    const loadLessons = async () => {
        try {
            const response = await LessonService.getAll({ page_size: 1000 });
            setLessons(response.results || []);
        } catch (error) {
            console.error('Error loading lessons:', error);
        }
    };

    const loadQuizData = async () => {
        setLoading(true);
        try {
            const data = await QuizService.getById(id);
            setFormData({
                title: data.title || '',
                description: data.description || '',
                time_limit_seconds: data.time_limit_seconds || 3600,
                is_published: data.is_published || false,
                lesson_ids: data.lessons?.map((l) => l.id) || [],
            });

            if (data.questions && data.questions.length > 0) {
                setQuestions(
                    data.questions.map((q) => ({
                        id: q.id,
                        content: q.content,
                        question_type: q.question_type,
                        points: q.points,
                        sequence: q.sequence,
                        options: (q.options || []).map((opt) => ({
                            id: opt.id,
                            content: opt.option_text || opt.content || '',
                            is_correct: opt.is_correct,
                            sequence: opt.sequence,
                        })),
                    })),
                );
            } else {
                addQuestion();
            }
        } catch (error) {
            notification.error('Không thể tải dữ liệu quiz');
            console.error('Error loading quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề';
        }

        if (formData.time_limit_seconds <= 0) {
            newErrors.time_limit_seconds = 'Thời gian phải lớn hơn 0';
        }

        if (questions.length === 0) {
            newErrors.questions = 'Phải có ít nhất 1 câu hỏi';
        }

        questions.forEach((q, index) => {
            if (!q.content.trim()) {
                newErrors[`question_${index}_content`] = 'Vui lòng nhập nội dung câu hỏi';
            }

            if (q.points <= 0) {
                newErrors[`question_${index}_points`] = 'Điểm phải lớn hơn 0';
            }

            const validOptions = q.options.filter((opt) => opt.content && opt.content.trim());
            if (validOptions.length < 2) {
                newErrors[`question_${index}_options`] = 'Phải có ít nhất 2 đáp án';
            }

            const correctOptions = q.options.filter((opt) => opt.is_correct);
            if (correctOptions.length === 0) {
                newErrors[`question_${index}_correct`] = 'Phải có ít nhất 1 đáp án đúng';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            notification.warning('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                questions: questions.map((q, index) => ({
                    id: q.id || null,
                    content: q.content,
                    question_type: q.question_type,
                    points: parseFloat(q.points),
                    sequence: index + 1,
                    options: q.options
                        .filter((opt) => opt.content && opt.content.trim())
                        .map((opt, optIndex) => ({
                            id: opt.id || null,
                            option_text: opt.content,
                            is_correct: opt.is_correct,
                            sequence: optIndex + 1,
                        })),
                })),
            };

            if (isEditMode) {
                await QuizService.update(id, dataToSubmit);
                notification.success('Cập nhật quiz thành công');
            } else {
                await QuizService.create(dataToSubmit);
                notification.success('Tạo quiz thành công');
            }

            navigate('/admin/quizzes');
        } catch (error) {
            notification.error(isEditMode ? 'Không thể cập nhật quiz' : 'Không thể tạo quiz');
            console.error('Error saving quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleLessonToggle = (lessonId) => {
        const newLessonIds = formData.lesson_ids.includes(lessonId)
            ? formData.lesson_ids.filter((id) => id !== lessonId)
            : [...formData.lesson_ids, lessonId];

        setFormData({ ...formData, lesson_ids: newLessonIds });
    };

    const addQuestion = () => {
        const newQuestion = {
            id: null,
            content: '',
            question_type: 1, // Single choice
            points: 10,
            sequence: questions.length + 1,
            options: [
                { id: null, content: '', is_correct: false, sequence: 1 },
                { id: null, content: '', is_correct: false, sequence: 2 },
            ],
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);

        // Clear errors
        if (errors[`question_${index}_${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`question_${index}_${field}`];
            setErrors(newErrors);
        }
    };

    const addOption = (questionIndex) => {
        const newQuestions = [...questions];
        const newOption = {
            id: null,
            content: '',
            is_correct: false,
            sequence: newQuestions[questionIndex].options.length + 1,
        };
        newQuestions[questionIndex].options.push(newOption);
        setQuestions(newQuestions);
    };

    const removeOption = (questionIndex, optionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
        setQuestions(newQuestions);
    };

    const updateOption = (questionIndex, optionIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex] = {
            ...newQuestions[questionIndex].options[optionIndex],
            [field]: value,
        };

        // If single choice and this option is set to correct, uncheck others
        if (field === 'is_correct' && value && newQuestions[questionIndex].question_type === 1) {
            newQuestions[questionIndex].options.forEach((opt, i) => {
                if (i !== optionIndex) {
                    opt.is_correct = false;
                }
            });
        }

        setQuestions(newQuestions);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(questions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setQuestions(items);
    };

    if (loading && isEditMode) {
        return (
            <div className="quiz-form-loading">
                <div className="quiz-form-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="quiz-form">
            {/* Header */}
            <div className="quiz-form-page-header">
                <div className="quiz-form-header-left">
                    <h1>{isEditMode ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}</h1>
                    <p className="quiz-form-subtitle">
                        {isEditMode ? 'Cập nhật thông tin quiz' : 'Điền thông tin để tạo quiz mới'}
                    </p>
                </div>
                <button type="button" className="quiz-form-btn-back" onClick={() => navigate('/admin/quizzes')}>
                    <FaArrowLeft /> Quay lại
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="quiz-form-container">
                {/* Basic Information */}
                <div className="quiz-form-section">
                    <h2 className="quiz-form-section-title">Thông tin cơ bản</h2>

                    <div className="quiz-form-group">
                        <label>
                            Tiêu đề <span className="quiz-form-required">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Nhập tiêu đề quiz"
                            className={errors.title ? 'quiz-form-error' : ''}
                        />
                        {errors.title && <span className="quiz-form-error-message">{errors.title}</span>}
                    </div>

                    <div className="quiz-form-group">
                        <label>Mô tả</label>
                        <CKEditorComponent
                            value={formData.description}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            placeholder="Nhập mô tả quiz..."
                        />
                    </div>

                    <div className="quiz-form-row">
                        <div className="quiz-form-group">
                            <label>
                                Thời gian (giây) <span className="quiz-form-required">*</span>
                            </label>
                            <input
                                type="number"
                                name="time_limit_seconds"
                                value={formData.time_limit_seconds}
                                onChange={handleChange}
                                min="1"
                                className={errors.time_limit_seconds ? 'quiz-form-error' : ''}
                            />
                            <span className="quiz-form-input-hint">
                                {Math.floor(formData.time_limit_seconds / 60)} phút {formData.time_limit_seconds % 60}{' '}
                                giây
                            </span>
                            {errors.time_limit_seconds && (
                                <span className="quiz-form-error-message">{errors.time_limit_seconds}</span>
                            )}
                        </div>

                        <div className="quiz-form-group">
                            <label>Trạng thái</label>
                            <div className="quiz-form-checkbox-group">
                                <input
                                    type="checkbox"
                                    name="is_published"
                                    id="is_published"
                                    checked={formData.is_published}
                                    onChange={handleChange}
                                />
                                <label htmlFor="is_published">Công khai quiz</label>
                            </div>
                        </div>
                    </div>

                    {/* Lessons */}
                    <div className="quiz-form-group">
                        <label>Bài học liên quan</label>
                        <div className="quiz-form-lessons-grid">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="quiz-form-lesson-item">
                                    <input
                                        type="checkbox"
                                        id={`lesson-${lesson.id}`}
                                        checked={formData.lesson_ids.includes(lesson.id)}
                                        onChange={() => handleLessonToggle(lesson.id)}
                                    />
                                    <label htmlFor={`lesson-${lesson.id}`}>{lesson.title}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="quiz-form-section">
                    <div className="quiz-form-section-header">
                        <h2 className="quiz-form-section-title">Câu hỏi ({questions.length})</h2>
                        <button type="button" className="quiz-form-btn-add-question" onClick={addQuestion}>
                            <FaPlus /> Thêm câu hỏi
                        </button>
                    </div>

                    {errors.questions && <span className="quiz-form-error-message">{errors.questions}</span>}

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="questions">
                            {(provided) => (
                                <div
                                    className="quiz-form-questions-list"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {questions.map((question, qIndex) => (
                                        <Draggable key={qIndex} draggableId={`question-${qIndex}`} index={qIndex}>
                                            {(provided) => (
                                                <div
                                                    className="quiz-form-question-item"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                >
                                                    <div className="quiz-form-question-header">
                                                        <div
                                                            className="quiz-form-drag-handle"
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <FaGripVertical />
                                                        </div>
                                                        <h3>Câu hỏi {qIndex + 1}</h3>
                                                        <button
                                                            type="button"
                                                            className="quiz-form-btn-remove-question"
                                                            onClick={() => removeQuestion(qIndex)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>

                                                    <div className="quiz-form-question-body">
                                                        <div className="quiz-form-group">
                                                            <label>
                                                                Nội dung câu hỏi{' '}
                                                                <span className="quiz-form-required">*</span>
                                                            </label>
                                                            <textarea
                                                                value={question.content}
                                                                onChange={(e) =>
                                                                    updateQuestion(qIndex, 'content', e.target.value)
                                                                }
                                                                placeholder="Nhập nội dung câu hỏi"
                                                                rows="3"
                                                                className={
                                                                    errors[`question_${qIndex}_content`]
                                                                        ? 'quiz-form-error'
                                                                        : ''
                                                                }
                                                            />
                                                            {errors[`question_${qIndex}_content`] && (
                                                                <span className="quiz-form-error-message">
                                                                    {errors[`question_${qIndex}_content`]}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="quiz-form-row">
                                                            <div className="quiz-form-group">
                                                                <label>Loại câu hỏi</label>
                                                                <select
                                                                    value={question.question_type}
                                                                    onChange={(e) =>
                                                                        updateQuestion(
                                                                            qIndex,
                                                                            'question_type',
                                                                            parseInt(e.target.value),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value={1}>Một đáp án đúng</option>
                                                                    <option value={2}>Nhiều đáp án đúng</option>
                                                                </select>
                                                            </div>

                                                            <div className="quiz-form-group">
                                                                <label>
                                                                    Điểm <span className="quiz-form-required">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={question.points}
                                                                    onChange={(e) =>
                                                                        updateQuestion(qIndex, 'points', e.target.value)
                                                                    }
                                                                    min="0"
                                                                    step="0.5"
                                                                    className={
                                                                        errors[`question_${qIndex}_points`]
                                                                            ? 'quiz-form-error'
                                                                            : ''
                                                                    }
                                                                />
                                                                {errors[`question_${qIndex}_points`] && (
                                                                    <span className="quiz-form-error-message">
                                                                        {errors[`question_${qIndex}_points`]}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Options */}
                                                        <div className="quiz-form-options-section">
                                                            <div className="quiz-form-options-header">
                                                                <label>
                                                                    Các đáp án{' '}
                                                                    <span className="quiz-form-required">*</span>
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    className="quiz-form-btn-add-option"
                                                                    onClick={() => addOption(qIndex)}
                                                                >
                                                                    <FaPlus /> Thêm đáp án
                                                                </button>
                                                            </div>

                                                            {errors[`question_${qIndex}_options`] && (
                                                                <span className="quiz-form-error-message">
                                                                    {errors[`question_${qIndex}_options`]}
                                                                </span>
                                                            )}

                                                            {errors[`question_${qIndex}_correct`] && (
                                                                <span className="quiz-form-error-message">
                                                                    {errors[`question_${qIndex}_correct`]}
                                                                </span>
                                                            )}

                                                            <div className="quiz-form-options-list">
                                                                {question.options.map((option, oIndex) => (
                                                                    <div key={oIndex} className="quiz-form-option-item">
                                                                        <input
                                                                            type={
                                                                                question.question_type === 1
                                                                                    ? 'radio'
                                                                                    : 'checkbox'
                                                                            }
                                                                            checked={option.is_correct}
                                                                            onChange={(e) =>
                                                                                updateOption(
                                                                                    qIndex,
                                                                                    oIndex,
                                                                                    'is_correct',
                                                                                    e.target.checked,
                                                                                )
                                                                            }
                                                                            name={`question-${qIndex}-correct`}
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={option.content}
                                                                            onChange={(e) =>
                                                                                updateOption(
                                                                                    qIndex,
                                                                                    oIndex,
                                                                                    'content',
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                            placeholder={`Đáp án ${oIndex + 1}`}
                                                                            className="quiz-form-option-input"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="quiz-form-btn-remove-option"
                                                                            onClick={() => removeOption(qIndex, oIndex)}
                                                                            disabled={question.options.length <= 2}
                                                                        >
                                                                            <FaTrash />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Submit Buttons */}
                <div className="quiz-form-actions">
                    <button type="button" className="quiz-form-btn-cancel" onClick={() => navigate('/admin/quizzes')}>
                        Hủy
                    </button>
                    <button type="submit" className="quiz-form-btn-submit" disabled={loading}>
                        {loading ? (
                            'Đang xử lý...'
                        ) : (
                            <>
                                <FaSave /> {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizForm;
