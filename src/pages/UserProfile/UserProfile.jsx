import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import './UserProfile.css';
import { updateUserProfile } from '../../services/UserService';
import CourseService from '../../services/CourseService';
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

  // Cropper states
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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
        return <div className="tab-content">Các bài tập đã giải</div>;
      case 'submissions':
        return <div className="tab-content">Lịch sử nộp bài</div>;
      case 'contests':
        return <div className="tab-content">Các cuộc thi đã tham gia</div>;
      default:
        return null;
    }
  };

  return (
    <div className="user-profile">
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
