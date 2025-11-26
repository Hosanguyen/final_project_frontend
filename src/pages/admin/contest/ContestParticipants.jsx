import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserCheck, FaUserTimes, FaSpinner, FaSearch, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import ContestService from '../../../services/ContestService';
import './ContestParticipants.css';

const ContestParticipants = ({ contestId }) => {
    const [participants, setParticipants] = useState([]);
    const [statistics, setStatistics] = useState({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        loadParticipants();
    }, [contestId]);

    const loadParticipants = async () => {
        setLoading(true);
        try {
            const data = await ContestService.getParticipants(contestId);
            setParticipants(data.participants || []);
            setStatistics(data.statistics || { total: 0, active: 0, inactive: 0 });
        } catch (error) {
            console.error('Error loading participants:', error);
            alert('Không thể tải danh sách người tham gia');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (participantId, currentStatus) => {
        if (!currentStatus) {
            alert('Không thể activate lại người dùng đã tự hủy đăng ký');
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn deactivate người tham gia này?')) {
            return;
        }

        setTogglingId(participantId);
        try {
            await ContestService.toggleParticipantStatus(contestId, participantId);
            await loadParticipants(); // Reload to update statistics
            alert('Deactivate thành công!');
        } catch (error) {
            console.error('Error toggling participant status:', error);
            alert(error.error || 'Không thể thay đổi trạng thái');
        } finally {
            setTogglingId(null);
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredParticipants = participants.filter(participant => {
        const matchesSearch = participant.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && participant.is_active) ||
            (filterStatus === 'inactive' && !participant.is_active);
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="participants-loading">
                <FaSpinner className="spinner" />
                <p>Đang tải danh sách người tham gia...</p>
            </div>
        );
    }

    return (
        <div className="contest-participants">
            <div className="participants-header">
                <h3>
                    <FaUsers /> Danh sách người tham gia
                </h3>
            </div>

            {/* Statistics */}
            <div className="participants-statistics">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <FaUsers />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Tổng số</div>
                        <div className="stat-value">{statistics.total}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <FaUserCheck />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Đang tham gia</div>
                        <div className="stat-value">{statistics.active}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon inactive">
                        <FaUserTimes />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Đã hủy</div>
                        <div className="stat-value">{statistics.inactive}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="participants-filters">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filters">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('active')}
                    >
                        Đang tham gia
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('inactive')}
                    >
                        Đã hủy
                    </button>
                </div>
            </div>

            {/* Participants Table */}
            {filteredParticipants.length === 0 ? (
                <div className="no-participants">
                    <FaUsers className="empty-icon" />
                    <p>
                        {searchTerm || filterStatus !== 'all'
                            ? 'Không tìm thấy người tham gia phù hợp'
                            : 'Chưa có người tham gia nào'}
                    </p>
                </div>
            ) : (
                <div className="participants-table-container">
                    <table className="participants-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Username</th>
                                <th>Thời gian đăng ký</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParticipants.map((participant, index) => (
                                <tr key={participant.id}>
                                    <td>{index + 1}</td>
                                    <td className="username-cell">
                                        <strong>{participant.username}</strong>
                                    </td>
                                    <td>{formatDateTime(participant.registered_at)}</td>
                                    <td>
                                        {participant.is_active ? (
                                            <span className="status-badge active">
                                                <FaUserCheck /> Đang tham gia
                                            </span>
                                        ) : (
                                            <span className="status-badge inactive">
                                                <FaUserTimes /> Đã hủy
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {participant.is_active ? (
                                            <button
                                                className="toggle-btn deactivate"
                                                onClick={() => handleToggleStatus(participant.id, participant.is_active)}
                                                disabled={togglingId === participant.id}
                                                title="Deactivate người tham gia"
                                            >
                                                {togglingId === participant.id ? (
                                                    <FaSpinner className="spinner-icon" />
                                                ) : (
                                                    <>
                                                        <FaToggleOff /> Deactivate
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <span className="cancelled-text">Đã hủy đăng ký</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ContestParticipants;
