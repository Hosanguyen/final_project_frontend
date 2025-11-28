import React, { useState, useEffect } from 'react';
import notification from '../../../utils/notification';
import { FaUsers, FaUserCheck, FaUserTimes, FaSpinner, FaSearch, FaToggleOn, FaToggleOff, FaPlus, FaTimes } from 'react-icons/fa';
import ContestService from '../../../services/ContestService';
import './ContestParticipants.css';

const ContestParticipants = ({ contestId }) => {
    const [participants, setParticipants] = useState([]);
    const [statistics, setStatistics] = useState({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
    const [togglingId, setTogglingId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [candidateQuery, setCandidateQuery] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [candPage, setCandPage] = useState(1);
    const [candPageSize, setCandPageSize] = useState(20);
    const [candTotalPages, setCandTotalPages] = useState(1);
    const [candTotalItems, setCandTotalItems] = useState(0);
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());

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
            notification.error('Không thể tải danh sách người tham gia');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (participantId, currentStatus) => {
        if (currentStatus === 'withdrawn') {
            notification.warning('Không thể activate lại người dùng đã tự hủy đăng ký');
            return;
        }

        const result = await notification.confirm(
            'Bạn có chắc chắn muốn deactivate người tham gia này?',
            'Xác nhận'
        );
        
        if (!result.isConfirmed) {
            return;
        }

        setTogglingId(participantId);
        try {
            await ContestService.toggleParticipantStatus(contestId, participantId);
            await loadParticipants(); // Reload to update statistics
            notification.success('Deactivate thành công!');
        } catch (error) {
            console.error('Error toggling participant status:', error);
            notification.error(error.error || 'Không thể thay đổi trạng thái');
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

    // Load candidates when modal open, page or query changes (debounced on query)
    useEffect(() => {
        if (!showAddModal) return;

        let timer;
        const fetchCandidates = async () => {
            setLoadingCandidates(true);
            try {
                const params = {
                    q: candidateQuery.trim() || undefined,
                    page: candPage,
                    page_size: candPageSize,
                    exclude_participating: true
                };
                const data = await ContestService.getUserCandidates(contestId, params);
                setCandidates(data?.results || []);
                const pg = data?.pagination || {};
                setCandTotalPages(pg.total_pages || 1);
                setCandTotalItems(pg.total_items || 0);
            } catch (e) {
                setCandidates([]);
                setCandTotalPages(1);
                setCandTotalItems(0);
            } finally {
                setLoadingCandidates(false);
            }
        };

        // debounce only for query changes
        if (candidateQuery) {
            timer = setTimeout(fetchCandidates, 300);
        } else {
            fetchCandidates();
        }

        return () => { if (timer) clearTimeout(timer); };
    }, [showAddModal, candidateQuery, contestId, candPage, candPageSize]);

    // Reset pagination when query changes
    useEffect(() => {
        setCandPage(1);
        setSelectedUserIds(new Set());
    }, [candidateQuery]);

    const toggleUserSelect = (userId) => {
        setSelectedUserIds(prev => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId); else next.add(userId);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedUserIds.size === candidates.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(candidates.map(c => c.id)));
        }
    };

    const handleBulkAdd = async () => {
        if (selectedUserIds.size === 0) {
            notification.warning('Vui lòng chọn ít nhất một người dùng');
            return;
        }
        try {
            const ids = Array.from(selectedUserIds);
            const res = await ContestService.bulkAddParticipants(contestId, ids);
            notification.success(res?.message || 'Đã thêm người tham gia');
            setShowAddModal(false);
            setSelectedUserIds(new Set());
            setCandidateQuery('');
            setCandidates([]);
            await loadParticipants();
        } catch (e) {
            notification.error(e?.error || 'Không thể thêm người tham gia');
        }
    };

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
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <FaPlus /> Thêm người tham gia
                </button>
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

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Thêm người tham gia</h4>
                            <button className="icon-btn" onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <div className="candidate-search">
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="Tìm theo username, họ tên, email..."
                                    value={candidateQuery}
                                    onChange={(e) => setCandidateQuery(e.target.value)}
                                />
                                <button className="btn-secondary" onClick={toggleAll} disabled={candidates.length === 0}>
                                    {selectedUserIds.size === candidates.length && candidates.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                </button>
                            </div>
                            <div className="candidate-list">
                                {loadingCandidates ? (
                                    <div className="loading-row"><FaSpinner className="spinner" /> Đang tải...</div>
                                ) : candidates.length === 0 ? (
                                    <div className="empty-row">Không có người dùng phù hợp</div>
                                ) : (
                                    candidates.map(u => (
                                        <label key={u.id} className="candidate-row">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.has(u.id)}
                                                onChange={() => toggleUserSelect(u.id)}
                                            />
                                            <img className="cand-avatar" src={u.avatar_url || 'https://via.placeholder.com/28'} alt={u.username} />
                                            <div className="cand-info">
                                                <div className="cand-name">{u.full_name || u.username}</div>
                                                <div className="cand-sub">@{u.username} · {u.email}</div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            <div className="candidate-pagination">
                                <div className="cand-page-info">
                                    {candTotalItems} người dùng · Trang {candPage}/{candTotalPages}
                                </div>
                                <div className="cand-page-actions">
                                    <button
                                        className="btn-secondary"
                                        disabled={candPage <= 1 || loadingCandidates}
                                        onClick={() => setCandPage(p => Math.max(1, p - 1))}
                                    >
                                        Trang trước
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        disabled={candPage >= candTotalPages || loadingCandidates}
                                        onClick={() => setCandPage(p => Math.min(candTotalPages, p + 1))}
                                    >
                                        Trang sau
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={handleBulkAdd} disabled={selectedUserIds.size === 0}>Thêm đã chọn</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestParticipants;
