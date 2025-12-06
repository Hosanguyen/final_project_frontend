import Swal from 'sweetalert2';

/**
 * Modern notification utility using SweetAlert2
 * Replaces traditional browser alerts with beautiful, customizable notifications
 */

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const notification = {
  /**
   * Display success notification
   * @param {string} message - Success message to display
   * @param {string} title - Optional title (default: 'Thành công!')
   */
  success: (message, title = 'Thành công!') => {
    return Toast.fire({
      icon: 'success',
      title: title,
      text: message
    });
  },

  /**
   * Display error notification
   * @param {string} message - Error message to display
   * @param {string} title - Optional title (default: 'Lỗi!')
   */
  error: (message, title = 'Lỗi!') => {
    return Toast.fire({
      icon: 'error',
      title: title,
      text: message
    });
  },

  /**
   * Display warning notification
   * @param {string} message - Warning message to display
   * @param {string} title - Optional title (default: 'Cảnh báo!')
   */
  warning: (message, title = 'Cảnh báo!') => {
    return Toast.fire({
      icon: 'warning',
      title: title,
      text: message
    });
  },

  /**
   * Display info notification
   * @param {string} message - Info message to display
   * @param {string} title - Optional title (default: 'Thông báo!')
   */
  info: (message, title = 'Thông báo!') => {
    return Toast.fire({
      icon: 'info',
      title: title,
      text: message
    });
  },

  /**
   * Display confirmation dialog
   * @param {string} message - Confirmation message
   * @param {string} title - Dialog title (default: 'Xác nhận')
   * @param {object} options - Additional options
   * @returns {Promise} Promise resolving to user's choice
   */
  confirm: (message, title = 'Xác nhận', options = {}) => {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: options.confirmText || 'Đồng ý',
      cancelButtonText: options.cancelText || 'Hủy',
      ...options
    });
  },

  /**
   * Display alert dialog (for important messages that need user acknowledgment)
   * @param {string} message - Alert message
   * @param {string} title - Dialog title
   * @param {string} icon - Icon type (success, error, warning, info, question)
   */
  alert: (message, title = 'Thông báo', icon = 'info') => {
    return Swal.fire({
      title: title,
      text: message,
      icon: icon,
      confirmButtonText: 'Đóng'
    });
  }
};

export default notification;
