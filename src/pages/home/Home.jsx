import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaChevronLeft,
    FaChevronRight,
    FaBook,
    FaCode,
    FaTrophy,
    FaUsers,
    FaArrowRight,
    FaClock,
    FaLaptopCode,
    FaChartLine,
} from 'react-icons/fa';
import CourseService from '../../services/CourseService';
import ContestService from '../../services/ContestService';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [contests, setContests] = useState({ upcoming: [], running: [] });
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.REACT_APP_API_URL;

    const bannerSlides = [
        {
            image: 'https://aptechvietnam.com.vn/wp-content/uploads/banner-pc_48.png',
            title: 'Học Lập Trình Cùng Chuyên Gia',
            subtitle: 'Nâng cao kỹ năng với các khóa học chất lượng cao',
            buttonText: 'Khám phá ngay',
            buttonLink: '/courses',
        },
        {
            image: 'https://iviettech.vn/wp-content/uploads/2013/12/Banner-ITExpert.png',
            title: 'Thử Thách Bản Thân',
            subtitle: 'Tham gia các cuộc thi lập trình hấp dẫn',
            buttonText: 'Xem cuộc thi',
            buttonLink: '/contests',
        },
        {
            image: 'https://iviettech.vn/wp-content/uploads/2024/12/C-Banner.png',
            title: 'Luyện Tập Mỗi Ngày',
            subtitle: 'Hàng trăm bài tập từ cơ bản đến nâng cao',
            buttonText: 'Bắt đầu luyện tập',
            buttonLink: '/practice',
        },
    ];

    const features = [
        {
            icon: <FaBook />,
            title: 'Khóa học đa dạng',
            description: 'Các khóa học từ cơ bản đến nâng cao, phù hợp mọi trình độ',
        },
        {
            icon: <FaCode />,
            title: 'Thực hành trực tiếp',
            description: 'Code trực tiếp trên trình duyệt với hệ thống chấm tự động',
        },
        {
            icon: <FaTrophy />,
            title: 'Cuộc thi hấp dẫn',
            description: 'Tham gia các cuộc thi để thử thách và nâng cao kỹ năng',
        },
        {
            icon: <FaUsers />,
            title: 'Cộng đồng lớn mạnh',
            description: 'Kết nối với cộng đồng lập trình viên đam mê học hỏi',
        },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, [bannerSlides.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [coursesResponse, contestsData] = await Promise.all([
                CourseService.getCoursesByFilter({
                    is_published: 'true',
                    ordering: '-created_at',
                    page: 1,
                    page_size: 8,
                }),
                ContestService.getUserContests(),
            ]);

            setFeaturedCourses(coursesResponse.results || []);
            setContests(contestsData);
        } catch (error) {
            console.error('Error loading home data:', error);
        } finally {
            setLoading(false);
        }
    };

    const defaultBannerUrl = `${API_URL}/media/files/uploads/banner_default.jpg`;

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeRemaining = (startDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const diff = start - now;

        if (diff <= 0) return 'Đã bắt đầu';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `Còn ${days} ngày`;
        return `Còn ${hours} giờ`;
    };

    return (
        <div className="home-page">
            {/* Banner Slider */}
            <section className="home-banner-slider">
                <div className="home-slides-container">
                    {bannerSlides.map((slide, index) => (
                        <div key={index} className={`home-slide ${index === currentSlide ? 'home-slide-active' : ''}`}>
                            <img src={slide.image} alt={slide.title} className="home-slide-image" />
                            <div className="home-slide-overlay">
                                <div className="home-slide-content">
                                    <h1 className="home-slide-title">{slide.title}</h1>
                                    <p className="home-slide-subtitle">{slide.subtitle}</p>
                                    <button className="home-slide-button" onClick={() => navigate(slide.buttonLink)}>
                                        {slide.buttonText}
                                        <FaArrowRight className="home-button-icon" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="home-slider-nav home-slider-prev" onClick={prevSlide}>
                    <FaChevronLeft />
                </button>
                <button className="home-slider-nav home-slider-next" onClick={nextSlide}>
                    <FaChevronRight />
                </button>

                <div className="home-slider-dots">
                    {bannerSlides.map((_, index) => (
                        <button
                            key={index}
                            className={`home-slider-dot ${index === currentSlide ? 'home-dot-active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="home-features-section">
                <div className="home-section-container">
                    <h2 className="home-section-title">Tại sao chọn chúng tôi?</h2>
                    <p className="home-section-subtitle">
                        Nền tảng học lập trình trực tuyến hàng đầu với đầy đủ tính năng
                    </p>
                    <div className="home-features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="home-feature-card">
                                <div className="home-feature-icon">{feature.icon}</div>
                                <h3 className="home-feature-title">{feature.title}</h3>
                                <p className="home-feature-desc">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section className="home-courses-section">
                <div className="home-section-container">
                    <div className="home-section-header">
                        <div>
                            <h2 className="home-section-title">Khóa học nổi bật</h2>
                            <p className="home-section-subtitle">Các khóa học được yêu thích nhất</p>
                        </div>
                        <Link to="/courses" className="home-view-all-link">
                            Xem tất cả <FaArrowRight />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="home-loading">
                            <div className="home-spinner"></div>
                            <p>Đang tải...</p>
                        </div>
                    ) : (
                        <div className="home-courses-grid">
                            {featuredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="home-course-card"
                                    onClick={() => navigate(`/courses/${course.slug}`)}
                                >
                                    <div className="home-course-banner">
                                        <img
                                            src={
                                                course.banner_url ? `${API_URL}${course.banner_url}` : defaultBannerUrl
                                            }
                                            alt={course.title}
                                        />
                                        <span className={`home-course-level home-level-${course.level}`}>
                                            {course.level}
                                        </span>
                                    </div>
                                    <div className="home-course-body">
                                        <h3 className="home-course-title">{course.title}</h3>
                                        <p className="home-course-desc">{course.short_description}</p>
                                        <div className="home-course-meta">
                                            <span>📚 {course.lessons_count} bài học</span>
                                            <span>👤 {course.created_by_name}</span>
                                        </div>
                                    </div>
                                    <div className="home-course-footer">
                                        <div className="home-course-price">
                                            {Number(course.price) > 0 ? (
                                                <span className="home-price-amount">
                                                    {Number(course.price).toLocaleString('vi-VN')}₫
                                                </span>
                                            ) : (
                                                <span className="home-price-free">Miễn phí</span>
                                            )}
                                        </div>
                                        <button className="home-course-btn">Xem chi tiết</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Contests Section */}
            <section className="home-contests-section">
                <div className="home-section-container">
                    <div className="home-section-header">
                        <div>
                            <h2 className="home-section-title">Cuộc thi lập trình</h2>
                            <p className="home-section-subtitle">Thử thách bản thân với các cuộc thi hấp dẫn</p>
                        </div>
                        <Link to="/contests" className="home-view-all-link">
                            Xem tất cả <FaArrowRight />
                        </Link>
                    </div>

                    <div className="home-contests-grid">
                        {/* Running Contests */}
                        {contests.running?.slice(0, 2).map((contest) => (
                            <Link
                                key={contest.id}
                                to={`/contests/${contest.id}`}
                                className="home-contest-card home-contest-running"
                            >
                                <div className="home-contest-badge running">🔴 Đang diễn ra</div>
                                <h3 className="home-contest-title">
                                    <FaTrophy className="home-trophy-icon" />
                                    {contest.title}
                                </h3>
                                <p className="home-contest-desc">{contest.description}</p>
                                <div className="home-contest-info">
                                    <span>
                                        <FaClock /> Kết thúc: {formatDateTime(contest.end_time)}
                                    </span>
                                    <span>
                                        <FaUsers /> {contest.participant_count || 0} thí sinh
                                    </span>
                                </div>
                                <button className="home-contest-btn running">Tham gia ngay</button>
                            </Link>
                        ))}

                        {/* Upcoming Contests */}
                        {contests.upcoming?.slice(0, 2).map((contest) => (
                            <Link
                                key={contest.id}
                                to={`/contests/${contest.id}`}
                                className="home-contest-card home-contest-upcoming"
                            >
                                <div className="home-contest-badge upcoming">
                                    🟡 {getTimeRemaining(contest.start_time)}
                                </div>
                                <h3 className="home-contest-title">
                                    <FaTrophy className="home-trophy-icon" />
                                    {contest.title}
                                </h3>
                                <p className="home-contest-desc">{contest.description}</p>
                                <div className="home-contest-info">
                                    <span>
                                        <FaClock /> Bắt đầu: {formatDateTime(contest.start_time)}
                                    </span>
                                    <span>
                                        <FaUsers /> {contest.participant_count || 0} đăng ký
                                    </span>
                                </div>
                                <button className="home-contest-btn upcoming">Đăng ký</button>
                            </Link>
                        ))}

                        {!contests.running?.length && !contests.upcoming?.length && (
                            <div className="home-no-contests">
                                <FaTrophy className="home-no-contests-icon" />
                                <p>Hiện chưa có cuộc thi nào</p>
                                <Link to="/practice" className="home-practice-link">
                                    Luyện tập ngay <FaArrowRight />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Practice CTA Section */}
            <section className="home-cta-section">
                <div className="home-cta-container">
                    <div className="home-cta-content">
                        <h2 className="home-cta-title">
                            <FaChartLine className="home-cta-icon" />
                            Luyện tập mỗi ngày
                        </h2>
                        <p className="home-cta-desc">
                            Hàng trăm bài tập lập trình từ cơ bản đến nâng cao. Rèn luyện tư duy thuật toán và nâng cao
                            kỹ năng coding của bạn.
                        </p>
                        <div className="home-cta-features">
                            <span>✓ Nhiều ngôn ngữ lập trình</span>
                            <span>✓ Chấm điểm tự động</span>
                            <span>✓ Xếp hạng toàn cầu</span>
                        </div>
                        <button className="home-cta-button" onClick={() => navigate('/practice')}>
                            Bắt đầu luyện tập
                            <FaArrowRight />
                        </button>
                    </div>
                    <div className="home-cta-illustration">
                        <FaLaptopCode className="home-cta-laptop" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
