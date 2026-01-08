import React, { useEffect, useState } from 'react';
import { FaSync, FaExclamationTriangle } from 'react-icons/fa';
import ContestService from '../../services/ContestService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './PracticeLeaderboard.css';

const PracticeLeaderboard = () => {
  useDocumentTitle('Bảng xếp hạng luyện tập');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const SERVER_URL = process.env.REACT_APP_API_URL || '';
  
  const loadLeaderboard = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Set timeout for API calls
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Request took too long')), 15000); // 15 second timeout
      });
      
      // Get practice contest to retrieve id
      const practice = await Promise.race([
        ContestService.getPracticeContest(),
        timeoutPromise
      ]);
      
      setContest(practice);
      if (practice?.id) {
        const data = await Promise.race([
          ContestService.getLeaderboard(practice.id),
          timeoutPromise
        ]);
        setLeaderboard(Array.isArray(data?.leaderboard) ? data.leaderboard : []);
      } else {
        setLeaderboard([]);
      }
    } catch (e) {
      console.error('Error loading practice leaderboard:', e);
      setError(typeof e === 'string' ? e : (e?.error || e?.message || 'Đã xảy ra lỗi khi tải bảng xếp hạng'));
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };
  useEffect(() => {
    loadLeaderboard();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  // Arrange podium visually as [2,1,3] with 1 in the center
  const podium = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="practice-leaderboard">
      <div className="pl-header">
        <h2>Bảng xếp hạng Thực hành</h2>
        {contest && (
          <div className="pl-subtitle">
            {contest.title} · {contest.slug}
          </div>
        )}
      </div>

      {loading && (
        <div className="pl-loading">
          <div className="pl-loading-skeleton">
            <div className="pl-skeleton-header"></div>
            <div className="pl-skeleton-podium">
              <div className="pl-skeleton-card"></div>
              <div className="pl-skeleton-card"></div>
              <div className="pl-skeleton-card"></div>
            </div>
            <div className="pl-skeleton-table">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="pl-skeleton-row"></div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="pl-error">
          <FaExclamationTriangle className="pl-error-icon" />
          <p>{error}</p>
          <button 
            onClick={() => loadLeaderboard(true)} 
            className="pl-retry-btn"
            disabled={retrying}
          >
            {retrying ? (
              <>
                <FaSync className="pl-spinning" />
                Đang thử lại...
              </>
            ) : (
              'Thử lại'
            )}
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="pl-topcards pl-podium">
            {podium.length > 0 && podium.map((u, idx) => {
              // u.rank determines 1/2/3; compute position class
              const posClass = u.rank === 1 ? 'first' : (u.rank === 2 ? 'second' : 'third');
              return (
                <div key={u.user_id || idx} className={`pl-podium-card ${posClass}`}>
                  <div className={`pl-card ${u.rank ? `rank-${u.rank}` : ''}`}>
                    <div className="pl-rank-number">{u.rank}</div>
                    {u.rank === 1 && <div className="pl-topline" />}
                    <div className="pl-user">
                      <div className="pl-avatar-wrap">
                        {u.rank === 1 && <span className="pl-crown" aria-hidden>👑</span>}
                        <img
                          className={`pl-avatar ${posClass}`}
                          src={u.avatar_url ? SERVER_URL + u.avatar_url : (posClass === 'first' ? 'https://placehold.co/72' : 'https://placehold.co/64')}
                          alt={u.username}
                        />
                      </div>
                      <div className="pl-user-info">
                        <div className="pl-name">{u.full_name || u.username}</div>
                        <div className="pl-username">{u.username}</div>
                        {contest?.title && (
                          <div className="pl-courseline">{contest.title}</div>
                        )}
                      </div>
                    </div>
                    <div className={`pl-kpis ${posClass}`}>
                      <div className="pl-kpi">
                        <div className="pl-kpi-value ac">{u.solved_count ?? 0}</div>
                        <div className="pl-kpi-label">Làm đúng</div>
                      </div>
                      <div className="pl-kpi">
                        <div className="pl-kpi-value submit">{u.attempted_count ?? 0}</div>
                        <div className="pl-kpi-label">Đã thử</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {topThree.length === 0 && (
              <div className="pl-empty">Chưa có dữ liệu xếp hạng.</div>
            )}
          </div>

          <div className="pl-tablewrap">
            <table className="pl-table">
              <thead>
                <tr>
                  <th style={{width: 80}}>Top</th>
                  <th>Người dùng</th>
                  <th style={{width: 140}}>AC</th>
                  <th style={{width: 220}}>Đã thử</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u) => (
                  <tr key={u.user_id}>
                    <td>#{u.rank}</td>
                    <td>
                      <div className="pl-cell-user">
                        <div>
                          <div className="pl-name">{u.full_name || u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.solved_count ?? 0}</td>
                    <td>{u.attempted_count ?? 0}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} className="pl-empty">Chưa có dữ liệu xếp hạng.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PracticeLeaderboard;
