import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrophy, FaCode, FaChartLine, FaCalendar } from 'react-icons/fa';
import api from '../../services/api';
import './PublicProfile.css';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [problemsPage, setProblemsPage] = useState(1);
  const [contestsPage, setContestsPage] = useState(1);
  const SERVER_URL = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'problems') {
      loadProblems(1);
    } else if (activeTab === 'contests') {
      loadContests(1);
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/${userId}/profile/`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async (page = 1) => {
    try {
      const response = await api.get(`/api/users/${userId}/problems/`, {
        params: { page, page_size: 20 }
      });
      setProblems(response.data.problems || []);
      setProblemsPage(page);
    } catch (error) {
      console.error('Error loading problems:', error);
    }
  };

  const loadContests = async (page = 1) => {
    try {
      const response = await api.get(`/api/users/${userId}/contests/`, {
        params: { page, page_size: 20 }
      });
      setContests(response.data.contests || []);
      setContestsPage(page);
    } catch (error) {
      console.error('Error loading contests:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="public-profile-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="public-profile-page">
        <div className="error-container">
          <p>Không tìm thấy thông tin người dùng</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Quay lại
      </button>

      <div className="profile-header">
        <div className="profile-avatar-section">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="profile-avatar" />
          ) : (
            <div className="avatar-placeholder">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-info-section">
          <h1 className="profile-username">{profile.username}</h1>
          {profile.full_name && <p className="profile-fullname">{profile.full_name}</p>}
          
          {profile.rating && (
            <div className="rating-info">
              <span 
                className="rank-badge" 
                style={{ backgroundColor: getRankColor(profile.rating.rank_title) }}
              >
                {getRankDisplay(profile.rating.rank_title)}
              </span>
              <span className="rating-value">Rating: {profile.rating.current_rating}</span>
              {profile.rating.global_rank && (
                <span className="global-rank">#{profile.rating.global_rank}</span>
              )}
            </div>
          )}

          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FaCode className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{profile.statistics.problems_solved}</div>
            <div className="stat-label">Bài đã giải</div>
          </div>
        </div>

        <div className="stat-card">
          <FaTrophy className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{profile.statistics.contests_participated}</div>
            <div className="stat-label">Contest tham gia</div>
          </div>
        </div>

        <div className="stat-card">
          <FaChartLine className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{profile.statistics.acceptance_rate}%</div>
            <div className="stat-label">Tỷ lệ AC</div>
          </div>
        </div>

        <div className="stat-card">
          <FaCalendar className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{profile.statistics.total_submissions}</div>
            <div className="stat-label">Lượt nộp bài</div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan
        </button>
        <button
          className={`tab-btn ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          Bài đã giải ({profile.statistics.problems_solved})
        </button>
        <button
          className={`tab-btn ${activeTab === 'contests' ? 'active' : ''}`}
          onClick={() => setActiveTab('contests')}
        >
          Contest ({profile.statistics.contests_participated})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h3>Thông tin chi tiết</h3>
            {profile.rating && (
              <div className="detail-group">
                <h4>Rating</h4>
                <p>Rating hiện tại: <strong>{profile.rating.current_rating}</strong></p>
                <p>Rating cao nhất: <strong>{profile.rating.max_rating}</strong></p>
                <p>Contest đã tham gia: <strong>{profile.rating.contests_participated}</strong></p>
              </div>
            )}

            <div className="detail-group">
              <h4>Thống kê</h4>
              <p>Tổng số lần nộp: <strong>{profile.statistics.total_submissions}</strong></p>
              <p>Số bài AC: <strong>{profile.statistics.accepted_submissions}</strong></p>
              <p>Tỷ lệ AC: <strong>{profile.statistics.acceptance_rate}%</strong></p>
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="problems-section">
            {problems.length === 0 ? (
              <p className="empty-message">Chưa giải bài nào</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên bài</th>
                    <th>Độ khó</th>
                    <th>Thời gian giải</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem, index) => (
                    <tr key={problem.problem_id}>
                      <td>{(problemsPage - 1) * 20 + index + 1}</td>
                      <td>{problem.problem_title}</td>
                      <td>
                        <span className={`difficulty-badge ${problem.difficulty}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td>{new Date(problem.solved_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'contests' && (
          <div className="contests-section">
            {contests.length === 0 ? (
              <p className="empty-message">Chưa tham gia contest nào</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên contest</th>
                    <th>Thời gian bắt đầu</th>
                    <th>Thời gian tham gia</th>
                  </tr>
                </thead>
                <tbody>
                  {contests.map((contest, index) => (
                    <tr key={contest.id}>
                      <td>{(contestsPage - 1) * 20 + index + 1}</td>
                      <td>{contest.title}</td>
                      <td>{new Date(contest.start_at).toLocaleString('vi-VN')}</td>
                      <td>{new Date(contest.participated_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
