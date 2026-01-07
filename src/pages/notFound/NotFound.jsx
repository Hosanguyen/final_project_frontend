import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './NotFound.css';

const NotFound = () => {
    useDocumentTitle('Không tìm thấy trang');
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1 className="error-code">404</h1>
                <h2 className="error-title">Trang không tìm thấy</h2>
                <p className="notfound-error-message">
                    Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </p>
                <Link to="/" className="back-home-btn">
                    Quay về trang chủ
                </Link>
            </div>
        </div>
    );
};

export default NotFound;