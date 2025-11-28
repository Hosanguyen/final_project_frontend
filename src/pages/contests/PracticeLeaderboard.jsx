import React, { useEffect, useState } from 'react';
import ContestService from '../../services/ContestService';
import './PracticeLeaderboard.css';

const PracticeLeaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const SERVER_URL = process.env.REACT_APP_API_URL || '';
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get practice contest to retrieve id
        const practice = await ContestService.getPracticeContest();
        setContest(practice);
        if (practice?.id) {
          const data = await ContestService.getLeaderboard(practice.id);
          setLeaderboard(Array.isArray(data?.leaderboard) ? data.leaderboard : []);
        } else {
          setLeaderboard([]);
        }
      } catch (e) {
        setError(typeof e === 'string' ? e : (e?.error || 'Đã xảy ra lỗi'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topThree = leaderboard.slice(0, 3);

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

      {loading && <div className="pl-loading">Đang tải...</div>}
      {error && <div className="pl-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="pl-topcards">
            {topThree.map((u, idx) => (
              <div key={u.user_id || idx} className={`pl-card rank-${idx + 1}`}>
                <div className="pl-rank">#{u.rank}</div>
                <div className="pl-user">
                  <img
                    className="pl-avatar"
                    src={u.avatar_url ? SERVER_URL + u.avatar_url : 'https://placehold.co/48'}
                    alt={u.username}
                  />
                  <div className="pl-user-info">
                    <div className="pl-name">{u.full_name || u.username}</div>
                  </div>
                </div>
                <div className="pl-metrics">
                  <div className="pl-metric">
                    <div className="pl-metric-label">AC</div>
                    <div className="pl-metric-value">{u.solved_count ?? 0}</div>
                  </div>
                  <div className="pl-metric">
                    <div className="pl-metric-label">Đã submit</div>
                    <div className="pl-metric-value">{u.attempted_count ?? 0}</div>
                  </div>
                </div>
              </div>
            ))}
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
