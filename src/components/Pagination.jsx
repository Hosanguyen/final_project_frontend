import React from 'react';
import './Pagination.css';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    itemsPerPage,
    showItemCount = true,
    showFirstLast = true,
    className = '',
}) => {
    if (totalPages <= 1) return null;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            onPageChange(newPage);
        }
    };

    // Tạo danh sách các trang để hiển thị
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Số trang tối đa hiển thị

        if (totalPages <= maxVisible) {
            // Nếu tổng số trang ít, hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Luôn hiển thị trang đầu
            pages.push(1);

            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Điều chỉnh nếu ở đầu hoặc cuối
            if (currentPage <= 3) {
                endPage = 4;
            }
            if (currentPage >= totalPages - 2) {
                startPage = totalPages - 3;
            }

            // Thêm dấu ... nếu cần
            if (startPage > 2) {
                pages.push('...');
            }

            // Thêm các trang ở giữa
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Thêm dấu ... nếu cần
            if (endPage < totalPages - 1) {
                pages.push('...');
            }

            // Luôn hiển thị trang cuối
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`custom-pagination ${className}`}>
            {showFirstLast && (
                <button
                    className="custom-pagination-btn custom-pagination-btn-nav"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                    title="Trang đầu"
                >
                    ««
                </button>
            )}

            <button
                className="custom-pagination-btn custom-pagination-btn-nav"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                title="Trang trước"
            >
                ‹
            </button>

            <div className="custom-pagination-numbers">
                {pageNumbers.map((page, index) =>
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="custom-pagination-ellipsis">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            className={`custom-pagination-btn custom-pagination-btn-number ${
                                currentPage === page ? 'active' : ''
                            }`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ),
                )}
            </div>

            <button
                className="custom-pagination-btn custom-pagination-btn-nav"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                title="Trang sau"
            >
                ›
            </button>

            {showFirstLast && (
                <button
                    className="custom-pagination-btn custom-pagination-btn-nav"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    title="Trang cuối"
                >
                    »»
                </button>
            )}

            {showItemCount && totalItems !== undefined && (
                <span className="custom-pagination-info">({totalItems} mục)</span>
            )}
        </div>
    );
};

export default Pagination;
