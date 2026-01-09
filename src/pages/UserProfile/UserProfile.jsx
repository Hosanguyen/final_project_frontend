import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { FaTrophy, FaCode, FaChartLine, FaCalendar } from 'react-icons/fa';
import './UserProfile.css';
import api from '../../services/api';
import { updateUserProfile } from '../../services/UserService';
import CourseService from '../../services/CourseService';
import SubmissionService from '../../services/SubmissionService';
import ContestService from '../../services/ContestService';
import PaymentService from '../../services/PaymentService';
import notification from '../../utils/notification';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const UserProfile = () => {
  useDocumentTitle('Hồ sơ cá nhân');
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Statistics state
  const [statistics, setStatistics] = useState({
    total_submissions: 0,
    accepted_submissions: 0,
    problems_solved: 0,
    contests_participated: 0,
    acceptance_rate: 0
  });

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

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
    loadStatistics();
  }, []);

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === 'problems' && problems.length === 0) {
      loadProblems(1);
    } else if (activeTab === 'submissions' && submissions.length === 0) {
      loadSubmissions(1);
    } else if (activeTab === 'contests' && userContests.length === 0) {
      loadUserContests(1);
    } else if (activeTab === 'orders' && orders.length === 0) {
      loadOrders();
    }
  }, [activeTab]);

  const loadStatistics = async () => {
    try {
      // Gọi API statistics mới từ backend - đã tính toán sẵn
      const response = await api.get('/api/problems/user/statistics/');
      
      setStatistics({
        total_submissions: response.data.total_submissions || 0,
        accepted_submissions: response.data.accepted_submissions || 0,
        problems_solved: response.data.problems_solved || 0,
        contests_participated: response.data.contests_participated || 0,
        acceptance_rate: response.data.acceptance_rate || 0
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

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

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await PaymentService.getOrderHistory();
      setOrders(Array.isArray(response) ? response : (response.orders || []));
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
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

  const getRankColor = (rankTitle) => {
    const colorMap = {
      'newbie': '#808080',
      'pupil': '#008000',
      'specialist': '#03A89E',
      'expert': '#0000FF',
      'candidate_master': '#AA00AA',
      'master': '#FF8C00',
      'grandmaster': '#FF0000',
    };
    return colorMap[rankTitle] || '#808080';
  };

  const getRankDisplay = (rankTitle) => {
    const nameMap = {
      'newbie': 'Newbie',
      'pupil': 'Pupil',
      'specialist': 'Specialist',
      'expert': 'Expert',
      'candidate_master': 'Candidate Master',
      'master': 'Master',
      'grandmaster': 'Grandmaster',
    };
    return nameMap[rankTitle] || 'Unrated';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-section">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Thông tin cá nhân</h3>
                <div className="info-row">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{user.username}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Họ tên:</span>
                  <span className="info-value">{user.full_name || 'Chưa cập nhật'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Giới tính:</span>
                  <span className="info-value">{user.gender || 'Chưa cập nhật'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ngày sinh:</span>
                  <span className="info-value">{user.dob || 'Chưa cập nhật'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{user.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Địa chỉ:</span>
                  <span className="info-value">{user.address || 'Chưa cập nhật'}</span>
                </div>
              </div>

              {user.current_rating !== undefined && (
                <div className="overview-card">
                  <h3>Rating & Thành tích</h3>
                  <div className="info-row">
                    <span className="info-label">Rating hiện tại:</span>
                    <span className="info-value rating-value">{user.current_rating || 1000}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Rating cao nhất:</span>
                    <span className="info-value">{user.max_rating || 1000}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Rank:</span>
                    <span className="info-value">{user.rank || 'newbie'}</span>
                  </div>
                </div>
              )}

              <div className="overview-card">
                <h3>Thống kê chi tiết</h3>
                <div className="info-row">
                  <span className="info-label">Tổng số lần nộp:</span>
                  <span className="info-value">{statistics.total_submissions}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Số bài AC:</span>
                  <span className="info-value">{statistics.accepted_submissions}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Bài đã giải:</span>
                  <span className="info-value">{statistics.problems_solved}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contest tham gia:</span>
                  <span className="info-value">{statistics.contests_participated}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Tỷ lệ AC:</span>
                  <span className="info-value">{statistics.acceptance_rate}%</span>
                </div>
              </div>
            </div>

            <div className="overview-actions">
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Chỉnh sửa thông tin
              </button>
              <button className="change-password-btn" onClick={() => setShowChangePassword(true)}>
                Đổi mật khẩu
              </button>
            </div>
          </div>
        );
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
      case 'orders':
        return (
          <div className="profile-tab-content">
            {loadingOrders ? (
              <div className="profile-loading-message">Đang tải đơn hàng...</div>
            ) : orders.length === 0 ? (
              <div className="profile-empty-message">
                <p>Bạn chưa có đơn hàng nào</p>
                <button 
                  className="profile-browse-btn"
                  onClick={() => navigate('/courses')}
                >
                  Khám phá khóa học
                </button>
              </div>
            ) : (
              <div className="profile-table-container">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã đơn hàng</th>
                      <th>Khóa học</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order.id}>
                        <td>{index + 1}</td>
                        <td>
                          <code className="profile-order-code">{order.order_code}</code>
                        </td>
                        <td 
                          className="profile-course-cell"
                          onClick={() => order.course_slug && navigate(`/courses/${order.course_slug}`)}
                          style={{ cursor: order.course_slug ? 'pointer' : 'default' }}
                        >
                          {order.course_title}
                        </td>
                        <td className="profile-order-amount">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(order.amount)}
                        </td>
                        <td>
                          <span className={`profile-order-status profile-order-status-${order.status}`}>
                            {order.status === 'pending' ? 'Chờ xử lý' :
                             order.status === 'completed' ? 'Hoàn thành' :
                             order.status === 'failed' ? 'Thất bại' :
                             order.status === 'cancelled' ? 'Đã hủy' : order.status}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleString('vi-VN')}</td>
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

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="profile-avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user.full_name
                ? user.full_name?.charAt(0).toUpperCase()
                : user.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-info-section">
          <h1 className="profile-username">{user.username}</h1>
          {user.full_name && <p className="profile-fullname">{user.full_name}</p>}
          
          {user.current_rating !== undefined && (
            <div className="rating-info">
              <span 
                className="rank-badge" 
                style={{ backgroundColor: getRankColor(user.rank || 'newbie') }}
              >
                {getRankDisplay(user.rank || 'newbie')}
              </span>
              <span className="rating-value">Rating: {user.current_rating || 1000}</span>
            </div>
          )}

          {user.description && (
            <p className="profile-bio">{user.description}</p>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="user-profile-edit-modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="user-profile-edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chỉnh sửa thông tin</h2>
            <div className="user-profile-edit-form">
              <div className="user-profile-edit-form-avatar-section">
                <label htmlFor="avatarInput" style={{ cursor: 'pointer' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="user-profile-edit-form-avatar-preview" />
                  ) : (
                    <div className="user-profile-edit-form-avatar-placeholder">
                      {formData.full_name
                        ? formData.full_name?.charAt(0).toUpperCase()
                        : formData.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </label>
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
              </div>

              <div className="user-profile-edit-form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="edit-input"
                />
              </div>

              <div className="user-profile-edit-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  className="edit-input"
                />
              </div>

              <div className="user-profile-edit-form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn về bạn"
                  className="edit-textarea"
                />
              </div>

              <div className="user-profile-edit-form-details-grid">
                <div className="user-profile-edit-form-group">
                  <label>Giới tính</label>
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
                </div>

                <div className="user-profile-edit-form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob || ''}
                    onChange={handleChange}
                    className="edit-input"
                  />
                </div>

                <div className="user-profile-edit-form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="edit-input"
                  />
                </div>

                <div className="user-profile-edit-form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                    className="edit-input"
                  />
                </div>
              </div>

              <div className="user-profile-edit-modal-actions">
                <button onClick={handleSave} className="save-btn">Lưu thay đổi</button>
                <button onClick={() => {
                  setFormData(user);
                  setAvatarPreview(user.avatar_url ? `${API_URL}${user.avatar_url}` : null);
                  setIsEditing(false);
                }} className="cancel-btn">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
          <div className="stat-card">
            <FaCode className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{statistics.problems_solved}</div>
              <div className="stat-label">Bài đã giải</div>
            </div>
          </div>

          <div className="stat-card">
            <FaTrophy className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{statistics.contests_participated}</div>
              <div className="stat-label">Contest tham gia</div>
            </div>
          </div>

          <div className="stat-card">
            <FaChartLine className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{statistics.acceptance_rate}%</div>
              <div className="stat-label">Tỷ lệ AC</div>
            </div>
          </div>

          <div className="stat-card">
            <FaCalendar className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{statistics.total_submissions}</div>
              <div className="stat-label">Lượt nộp bài</div>
            </div>
          </div>
        </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {['overview', 'courses', 'orders', 'problems', 'submissions', 'contests'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? 'Tổng quan' : 
             tab === 'courses' ? 'Khóa học' :
             tab === 'orders' ? 'Đơn hàng' :
             tab === 'problems' ? 'Bài tập' :
             tab === 'submissions' ? 'Lịch sử nộp' :
             'Contest'}
          </button>
        ))}
      </div>

      <div className="profile-content">{renderTabContent()}</div>
    </div>
  );
};

export default UserProfile;
