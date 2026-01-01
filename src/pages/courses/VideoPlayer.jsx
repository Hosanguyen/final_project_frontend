import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import LessonService from '../../services/LessonService';
import './VideoPlayer.css';

const VideoPlayer = ({ resourceId, title }) => {
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const streamUrl = LessonService.getVideoStreamUrl(resourceId);

    useEffect(() => {
        // Lấy thông tin video (optional - để hiển thị metadata)
        const fetchVideoInfo = async () => {
            try {
                const info = await LessonService.getVideoInfo(resourceId);
                setVideoInfo(info);
            } catch (err) {
                console.warn('Could not fetch video info:', err);
                // Không cần set error vì video vẫn có thể phát được
            }
        };

        fetchVideoInfo();
    }, [resourceId]);

    const handleLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    const handleCanPlay = () => {
        setLoading(false);
        setIsReady(true);
    };

    const handleError = (e) => {
        setLoading(false);
        setError('Không thể tải video. Vui lòng thử lại sau.');
        console.error('Video error:', e);
    };

    const handleWaiting = () => {
        setLoading(true);
    };

    const handlePlaying = () => {
        setLoading(false);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const mb = (bytes / (1024 * 1024)).toFixed(2);
        return `${mb} MB`;
    };

    return (
        <div className="video-player-container">
            <div className="video-wrapper">
                {loading && !error && (
                    <div className="video-loading-overlay">
                        <FaSpinner className="spinner" />
                        <p>Đang tải video...</p>
                    </div>
                )}

                {error && (
                    <div className="video-error-overlay">
                        <FaExclamationTriangle size={48} />
                        <p>{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                if (videoRef.current) {
                                    videoRef.current.load();
                                }
                            }}
                            className="retry-btn"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                <video
                    ref={videoRef}
                    controls
                    controlsList="nodownload"
                    preload="metadata"
                    onLoadStart={handleLoadStart}
                    onCanPlay={handleCanPlay}
                    onError={handleError}
                    onWaiting={handleWaiting}
                    onPlaying={handlePlaying}
                    style={{
                        width: '100%',
                        height: '100%',
                        display: error ? 'none' : 'block',
                    }}
                >
                    <source src={streamUrl} type="video/mp4" />
                    <source src={streamUrl} type="video/webm" />
                    <source src={streamUrl} type="video/ogg" />
                    Trình duyệt của bạn không hỗ trợ video HTML5.
                </video>
            </div>

            {/* Video Info */}
            <div className="video-meta">
                <div className="video-meta-hint">
                    <span className="hint-icon">💡</span>
                    <span>Video hỗ trợ streaming - bạn có thể tua đến bất kỳ vị trí nào</span>
                </div>

                {videoInfo && (
                    <div className="video-meta-details">
                        {videoInfo.size && <span className="meta-item">📦 {formatFileSize(videoInfo.size)}</span>}
                        {videoInfo.content_type && <span className="meta-item">🎬 {videoInfo.content_type}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
