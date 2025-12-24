import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../../services/PaymentService';
import CourseService from '../../services/CourseService';
import Swal from 'sweetalert2';
import './CourseEnrollButton.css';

const CourseEnrollButton = ({ course, onEnrollSuccess }) => {
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkEnrollmentStatus();
  }, [course.id]);

  const checkEnrollmentStatus = async () => {
    try {
      const result = await CourseService.checkEnrollment(course.id);
      setIsEnrolled(result.is_enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      // Nếu không có token, user chưa đăng nhập
      if (error.response?.status === 401) {
        setIsEnrolled(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Chưa đăng nhập',
        text: 'Bạn cần đăng nhập để đăng ký khóa học',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        navigate('/login', { state: { from: `/courses/${course.slug}` } });
      }
      return;
    }

    if (processing) return;

    try {
      setProcessing(true);

      // Tạo URL return để VNPay redirect về sau khi thanh toán
      const returnUrl = `${window.location.origin}/payment-result`;

      const result = await PaymentService.createPayment(course.id, returnUrl);

      if (result.is_free) {
        // Khóa học miễn phí - đã tạo enrollment
        await Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Bạn đã đăng ký khóa học miễn phí thành công.',
          confirmButtonText: 'Bắt đầu học',
          timer: 3000
        });
        setIsEnrolled(true);
        if (onEnrollSuccess) {
          onEnrollSuccess();
        }
      } else {
        // Khóa học có phí - redirect đến VNPay
        const confirmResult = await Swal.fire({
          icon: 'info',
          title: 'Chuyển đến trang thanh toán',
          html: `
            <p>Bạn sẽ được chuyển đến VNPay để thanh toán</p>
            <p class="payment-amount"><strong>${Number(result.amount).toLocaleString('vi-VN')} VND</strong></p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Tiếp tục thanh toán',
          cancelButtonText: 'Hủy',
          customClass: {
            popup: 'payment-popup'
          }
        });

        if (confirmResult.isConfirmed) {
          // Redirect đến trang thanh toán VNPay
          PaymentService.redirectToPayment(result.payment_url);
        }
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đăng ký khóa học';
      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        setTimeout(() => {
          navigate('/login', { state: { from: `/courses/${course.slug}` } });
        }, 2000);
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: errorMessage
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleGoToLearn = () => {
    navigate(`/courses/${course.slug}/learn`);
  };

  if (loading) {
    return (
      <button className="enroll-btn loading" disabled>
        <span className="spinner"></span>
        Đang kiểm tra...
      </button>
    );
  }

  if (isEnrolled) {
    return (
      <button className="enroll-btn enrolled" onClick={handleGoToLearn}>
        <span className="icon">✓</span>
        Vào học
      </button>
    );
  }

  const isFree = !course.price || Number(course.price) === 0;

  return (
    <button
      className={`enroll-btn ${isFree ? 'free' : 'paid'}`}
      onClick={handleEnroll}
      disabled={processing}
    >
      {processing ? (
        <>
          <span className="spinner"></span>
          Đang xử lý...
        </>
      ) : (
        <>
          {isFree ? (
            <>
              <span className="icon">🎓</span>
              Đăng ký miễn phí
            </>
          ) : (
            <>
              <span className="icon">💳</span>
              Mua khóa học - {Number(course.price).toLocaleString('vi-VN')} VND
            </>
          )}
        </>
      )}
    </button>
  );
};

export default CourseEnrollButton;
