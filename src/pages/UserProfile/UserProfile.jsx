import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import './UserProfile.css';
import api from '../../services/api';
import { updateUserProfile } from '../../services/UserService';
import CourseService from '../../services/CourseService';
import SubmissionService from '../../services/SubmissionService';
import ContestService from '../../services/ContestService';
import notification from '../../utils/notification';

const UserProfile = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Enrolled courses state
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Problems state (từ submissions)
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemsPage, setProblemsPage] = useState(1);
  const [problemsTotalPages, setProblemsTotalPages] = useState(1);

  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(1);

  // Contests state (đã đăng ký)
  const [userContests, setUserContests] = useState([]);
  const [loadingContests, setLoadingContests] = useState(false);
  const [contestsPage, setContestsPage] = useState(1);
  const [contestsTotalPages, setContestsTotalPages] = useState(1);

  // Cropper states
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFormData(parsed);
      setAvatarPreview(parsed.avatar_url ? `${API_URL}${parsed.avatar_url}` : null);
    }
    loadEnrolledCourses();
  }, []);

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'problems' && problems.length === 0) {
      loadProblems(1);
    } else if (activeTab === 'submissions' && submissions.length === 0) {
      loadSubmissions(1);
    } else if (activeTab === 'contests' && userContests.length === 0) {
      loadUserContests(1);
    }
  }, [activeTab]);

  const loadEnrolledCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await CourseService.getMyEnrollments();
      console.log('Enrolled courses response:', response);
      // API trả về array trực tiếp, không phải object với key enrollments
      const courses = Array.isArray(response) ? response : (response.enrollments || []);
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      setEnrolledCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadProblems = async (page = 1) => {
    try {
      setLoadingProblems(true);
      const pageSize = 20;
      // Gọi API mới cho user problems
      const response = await api.get('/api/problems/user/problems/', {
        params: { page, page_size: pageSize }
      });
      
      setProblems(response.data.problems || []);
      setProblemsPage(page);
      setProblemsTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Error loading problems:', error);
      setProblems([]);
    } finally {
      setLoadingProblems(false);
    }
  };

  const loadSubmissions = async (page = 1) => {
    try {
      setLoadingSubmissions(true);
      const pageSize = 20;
      // Gọi API mới cho user submissions
      const response = await api.get('/api/problems/user/submissions/', {
        params: { page, page_size: pageSize }
      });
      
      setSubmissions(response.data.submissions || []);
      setSubmissionsPage(page);
      setSubmissionsTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadUserContests = async (page = 1) => {
    try {
      setLoadingContests(true);
      const pageSize = 20;
      // Gọi API mới cho user contests
      const response = await api.get('/api/problems/user/contests/', {
        params: { page, page_size: pageSize }
      });
      
      setUserContests(response.data.contests || []);
      setContestsPage(page);
      setContestsTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Error loading user contests:', error);
      setUserContests([]);
    } finally {
      setLoadingContests(false);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, crop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        blob.name = 'avatar.jpg';
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setAvatarFile(file);
      setAvatarPreview(previewURL);
      setCropMode(true);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedBlob = await getCroppedImg(avatarPreview, croppedAreaPixels);
      setAvatarFile(croppedBlob);
      setAvatarPreview(URL.createObjectURL(croppedBlob));
      setCropMode(false);
    } catch (err) {
      console.error('Crop failed', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateUserProfile(formData, avatarFile);
      setUser(updatedUser.user);
      localStorage.setItem('user', JSON.stringify(updatedUser.user));
      setIsEditing(false);
      notification.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error(error);
      notification.error('Cập nhật thất bại hoặc lỗi kết nối máy chủ.');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ''
      });
    }
  };

  const handleChangePassword = async () => {
    // Validate
    const errors = {};
    if (!passwordData.current_password) {
      errors.current_password = 'Vui lòng nhập mật khẩu hiện tại';
    }
    if (!passwordData.new_password) {
      errors.new_password = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordData.new_password.length < 6) {
      errors.new_password = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    if (!passwordData.confirm_password) {
      errors.confirm_password = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      const response = await api.put('/api/users/profile/reset-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      notification.success('Đổi mật khẩu thành công!');
      setShowChangePassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordErrors({});
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.error || 'Đổi mật khẩu thất bại';
      notification.error(errorMessage);
    }
  };

    const handleDeleteAvatar = async () => {
        const result = await notification.confirm(
            'Bạn có chắc muốn xóa ảnh đại diện?',
            'Xác nhận xóa'
        );
        
        if (!result.isConfirmed) return;

        try {
            setFormData({
            ...formData,
            is_delete_avatar: true,
            });
            setAvatarPreview(null);
            setAvatarFile(null);
        } catch (error) {
            console.error(error);
            notification.error('Xóa ảnh đại diện thất bại hoặc lỗi máy chủ.');
        }
    };
  
  if (!user)
    return <p style={{ textAlign: 'center' }}>Không tìm thấy thông tin người dùng</p>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <div className="tab-content">
            {loadingCourses ? (
              <div className="loading-message">Đang tải khóa học...</div>
            ) : enrolledCourses.length === 0 ? (
              <div className="empty-message">
                <p>Bạn chưa đăng ký khóa học nào</p>
                <button 
                  className="browse-courses-btn"
                  onClick={() => navigate('/courses')}
                >
                  Khám phá khóa học
                </button>
              </div>
            ) : (
              <div className="courses-table-container">
                <table className="courses-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên khóa học</th>
                      <th>Cấp độ</th>
                      <th>Ngày đăng ký</th>
                      <th>Tiến độ</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledCourses.map((enrollment, index) => (
                      <tr key={enrollment.id}>
                        <td>{index + 1}</td>
                        <td 
                          className="course-name-cell"
                          onClick={() => navigate(`/courses/${enrollment.course.slug}`)}
                        >
                          <div className="course-name">
                            {enrollment.course.title}
                          </div>
                          {enrollment.course.short_description && (
                            <div className="course-subtitle">
                              {enrollment.course.short_description}
                            </div>
                          )}
                        </td>
                        <td>
                          {enrollment.course.level ? (
                            <span className={`level-badge ${enrollment.course.level}`}>
                              {enrollment.course.level}
                            </span>
                          ) : (
                            <span className="level-badge">-</span>
                          )}
                        </td>
                        <td>
                          {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${enrollment.progress_percent || 0}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">
                              {Number(enrollment.progress_percent || 0).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="action-btn learn-btn"
                            onClick={() => navigate(`/courses/${enrollment.course.slug}/learn`)}
                          >
                            Vào học
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'problems':
        return (
          <div className="profile-tab-content">
            {loadingProblems ? (
              <div className="profile-loading-message">Đang tải danh sách bài tập...</div>
            ) : problems.length === 0 ? (
              <div className="profile-empty-message">
                <p>Bạn chưa nộp bài nào</p>
                <button 
                  className="profile-browse-btn"
                  onClick={() => navigate('/practice')}
                >
                  Bắt đầu luyện tập
                </button>
              </div>
            ) : (
              <>
                <div className="profile-table-container">
                  <table className="profile-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên bài</th>
                        <th>Số lần nộp</th>
                        <th>Trạng thái tốt nhất</th>
                        <th>Nộp lần cuối</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.map((problem, index) => (
                        <tr key={problem.problem_id}>
                          <td>{(problemsPage - 1) * 20 + index + 1}</td>
                          <td className="profile-problem-cell">
                            <div className="profile-problem-title">{problem.problem_title}</div>
                          </td>
                          <td>{problem.submission_count}</td>
                          <td>
                            <span className={`profile-status-badge profile-status-${problem.best_status?.toLowerCase()}`}>
                              {problem.best_status}
                            </span>
                          </td>
                          <td>{new Date(problem.last_submitted).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {problemsTotalPages > 1 && (
                  <div className="profile-pagination">
                    <button
                      className="profile-page-btn"
                      disabled={problemsPage === 1}
                      onClick={() => loadProblems(problemsPage - 1)}
                    >
                      ← Trước
                    </button>
                    <span className="profile-page-info">
                      Trang {problemsPage} / {problemsTotalPages}
                    </span>
                    <button
                      className="profile-page-btn"
                      disabled={problemsPage === problemsTotalPages}
                      onClick={() => loadProblems(problemsPage + 1)}
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case 'submissions':
        return (
          <div className="profile-tab-content">
            {loadingSubmissions ? (
              <div className="profile-loading-message">Đang tải lịch sử nộp bài...</div>
            ) : submissions.length === 0 ? (
              <div className="profile-empty-message">
                <p>Bạn chưa nộp bài nào</p>
                <button 
                  className="profile-browse-btn"
                  onClick={() => navigate('/practice')}
                >
                  Bắt đầu luyện tập
                </button>
              </div>
            ) : (
              <>
                <div className="profile-table-container">
                  <table className="profile-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Bài tập</th>
                        <th>Ngôn ngữ</th>
                        <th>Kết quả</th>
                        <th>Thời gian nộp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission, index) => (
                        <tr key={submission.id}>
                          <td>{(submissionsPage - 1) * 20 + index + 1}</td>
                          <td className="profile-problem-cell">
                            <div className="profile-problem-title">{submission.problem_title}</div>
                          </td>
                          <td>{submission.language_name}</td>
                          <td>
                            <span className={`profile-status-badge profile-status-${submission.status?.toLowerCase()}`}>
                              {submission.status}
                            </span>
                          </td>
                          <td>{new Date(submission.submitted_at).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {submissionsTotalPages > 1 && (
                  <div className="profile-pagination">
                    <button
                      className="profile-page-btn"
                      disabled={submissionsPage === 1}
                      onClick={() => loadSubmissions(submissionsPage - 1)}
                    >
                      ← Trước
                    </button>
                    <span className="profile-page-info">
                      Trang {submissionsPage} / {submissionsTotalPages}
                    </span>
                    <button
                      className="profile-page-btn"
                      disabled={submissionsPage === submissionsTotalPages}
                      onClick={() => loadSubmissions(submissionsPage + 1)}
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case 'contests':
        return (
          <div className="profile-tab-content">
            {loadingContests ? (
              <div className="profile-loading-message">Đang tải danh sách contest...</div>
            ) : userContests.length === 0 ? (
              <div className="profile-empty-message">
                <p>Bạn chưa tham gia contest nào</p>
                <button 
                  className="profile-browse-btn"
                  onClick={() => navigate('/contests')}
                >
                  Xem các contest
                </button>
              </div>
            ) : (
              <>
                <div className="profile-table-container">
                  <table className="profile-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên contest</th>
                        <th>Thời gian bắt đầu</th>
                        <th>Thời gian kết thúc</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userContests.map((contest, index) => {
                        const now = new Date();
                        const startTime = new Date(contest.start_at);
                        const endTime = new Date(contest.end_at);
                        let contestStatus = 'upcoming';
                        let statusText = 'Sắp diễn ra';
                        
                        if (now >= startTime && now <= endTime) {
                          contestStatus = 'running';
                          statusText = 'Đang diễn ra';
                        } else if (now > endTime) {
                          contestStatus = 'finished';
                          statusText = 'Đã kết thúc';
                        }
                        
                        return (
                          <tr key={contest.id}>
                            <td>{index + 1}</td>
                            <td className="profile-contest-cell">
                              <div className="profile-contest-title">{contest.title}</div>
                            </td>
                            <td>{startTime.toLocaleString('vi-VN')}</td>
                            <td>{endTime.toLocaleString('vi-VN')}</td>
                            <td>
                              <span className={`profile-contest-badge profile-contest-${contestStatus}`}>
                                {statusText}
                              </span>
                            </td>
                            <td>
                              <button
                                className="profile-action-btn"
                                onClick={() => navigate(`/contests/${contest.id}`)}
                              >
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {contestsTotalPages > 1 && (
                  <div className="profile-pagination">
                    <button
                      className="profile-page-btn"
                      disabled={contestsPage === 1}
                      onClick={() => loadUserContests(contestsPage - 1)}
                    >
                      ← Trước
                    </button>
                    <span className="profile-page-info">
                      Trang {contestsPage} / {contestsTotalPages}
                    </span>
                    <button
                      className="profile-page-btn"
                      disabled={contestsPage === contestsTotalPages}
                      onClick={() => loadUserContests(contestsPage + 1)}
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-profile">
      {/* Modal đổi mật khẩu */}
      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Đổi mật khẩu</h2>
            <div className="password-form">
              <div className="form-group">
                <label>Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className={passwordErrors.current_password ? 'error' : ''}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                {passwordErrors.current_password && (
                  <span className="error-text">{passwordErrors.current_password}</span>
                )}
              </div>
              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className={passwordErrors.new_password ? 'error' : ''}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                />
                {passwordErrors.new_password && (
                  <span className="error-text">{passwordErrors.new_password}</span>
                )}
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className={passwordErrors.confirm_password ? 'error' : ''}
                  placeholder="Nhập lại mật khẩu mới"
                />
                {passwordErrors.confirm_password && (
                  <span className="error-text">{passwordErrors.confirm_password}</span>
                )}
              </div>
              <div className="modal-actions">
                <button onClick={handleChangePassword} className="save-btn">
                  Lưu thay đổi
                </button>
                <button 
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      confirm_password: ''
                    });
                    setPasswordErrors({});
                  }} 
                  className="cancel-btn"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nếu đang crop ảnh */}
      {cropMode && (
        <div className="crop-modal">
          <div className="crop-container">
            <Cropper
              image={avatarPreview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="crop-controls">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
            />
            <div className="crop-buttons">
              <button onClick={handleCropSave} className="save-btn">Lưu ảnh</button>
              <button onClick={() => setCropMode(false)} className="cancel-btn">Hủy</button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-avatar">
          <label htmlFor="avatarInput">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="avatar-editable" />
            ) : (
              <div className="avatar-placeholder">
                {user.full_name
                  ? user.full_name?.charAt(0).toUpperCase()
                  : user.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </label>
          {isEditing && (
            <>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <p className="avatar-note">Nhấn vào ảnh để thay đổi</p>
              {avatarPreview && ( 
                <button onClick={handleDeleteAvatar} className="delete-avatar-btn">
                   Xóa ảnh đại diện
                </button>
              )}
            </>
          )}
        </div>

        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleChange}
                placeholder="Họ và tên"
                className="edit-input"
              />
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="Email"
                className="edit-input"
              />
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Mô tả ngắn về bạn"
                className="edit-textarea"
              />
              <div className="profile-details">
                <label>
                  Giới tính:
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                    className="edit-select"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </label>
                <label>
                  Ngày sinh:
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob || ''}
                    onChange={handleChange}
                    className="edit-input"
                  />
                </label>
                <label>
                  Số điện thoại:
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="edit-input"
                  />
                </label>
                <label>
                  Địa chỉ:
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="edit-input"
                  />
                </label>
              </div>
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn">💾 Lưu thay đổi</button>
                <button onClick={() => {
                    setFormData(user);
                    setAvatarPreview(user.avatar_url ? `${API_URL}${user.avatar_url}` : null);
                    setIsEditing(false)
                }} className="cancel-btn">❌ Hủy</button>
              </div>
            </>
          ) : (
            <>
              <h2 className="profile-name">{user.full_name || user.username}</h2>
              <p className="profile-email">{user.email}</p>
              {user.description && <p className="profile-desc">{user.description}</p>}
              <div className="profile-details">
                <p><strong>Giới tính:</strong> {user.gender || 'Chưa cập nhật'}</p>
                <p><strong>Ngày sinh:</strong> {user.dob || 'Chưa cập nhật'}</p>
                <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa cập nhật'}</p>
                <p><strong>Địa chỉ:</strong> {user.address || 'Chưa cập nhật'}</p>
              </div>
              <button className="edit-btn" onClick={() =>  setIsEditing(true)}>
                ✏️ Chỉnh sửa thông tin
              </button>
              <button className="change-password-btn" onClick={() => setShowChangePassword(true)}>
                🔒 Đổi mật khẩu
              </button>
            </>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        {['courses', 'problems', 'submissions', 'contests'].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="profile-tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default UserProfile;
