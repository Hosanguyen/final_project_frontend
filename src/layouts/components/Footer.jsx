import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaYoutube, FaGithub } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-logo">CodeLearn</h3>
          <p className="footer-description">
            Nền tảng học lập trình trực tuyến hàng đầu Việt Nam. 
            Học - Thực hành - Thi đấu cùng hàng nghìn lập trình viên.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><FaFacebook /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
            <a href="#" className="social-icon"><FaYoutube /></a>
            <a href="#" className="social-icon"><FaGithub /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Khóa học</h4>
          <ul className="footer-links">
            <li><Link to="/courses/python">Python cơ bản</Link></li>
            <li><Link to="/courses/javascript">JavaScript nâng cao</Link></li>
            <li><Link to="/courses/java">Lập trình Java</Link></li>
            <li><Link to="/courses/cpp">C/C++ từ A-Z</Link></li>
            <li><Link to="/courses">Xem tất cả khóa học</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Tính năng</h4>
          <ul className="footer-links">
            <li><Link to="/practice">Thực hành code</Link></li>
            <li><Link to="/contests">Thi đấu lập trình</Link></li>
            <li><Link to="/leaderboard">Bảng xếp hạng</Link></li>
            <li><Link to="/ai-tutor">AI Chatbot hỗ trợ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Hỗ trợ</h4>
          <ul className="footer-links">
            <li><Link to="/about">Về chúng tôi</Link></li>
            <li><Link to="/help">Trung tâm trợ giúp</Link></li>
            <li><Link to="/terms">Điều khoản sử dụng</Link></li>
            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <ul className="footer-contact">
            <li>
              <MdEmail className="contact-icon" />
              <span>support@codelearn.vn</span>
            </li>
            <li>
              <MdPhone className="contact-icon" />
              <span>1900 xxxx</span>
            </li>
            <li>
              <MdLocationOn className="contact-icon" />
              <span>Hà Nội, Việt Nam</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 CodeLearn. All rights reserved.</p>
        <p>Made with ❤️ in Vietnam</p>
      </div>
    </footer>
  );
};

export default Footer;