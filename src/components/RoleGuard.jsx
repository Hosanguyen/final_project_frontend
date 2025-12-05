import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

/**
 * Component bảo vệ route dựa trên roles
 * @param {string|string[]} roles - Role name hoặc mảng role names
 * @param {boolean} requireAll - Nếu true, yêu cầu tất cả roles. Nếu false, chỉ cần 1 role
 * @param {string} fallback - Đường dẫn redirect khi không có role
 * @param {React.ReactNode} children - Component con
 */
const RoleGuard = ({ 
  roles, 
  requireAll = false, 
  fallback = '/', 
  children,
  showMessage = true
}) => {
  const { user, hasRole, hasAnyRole } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  let hasAccess = false;
  
  if (requireAll) {
    hasAccess = roleArray.every(roleName => hasRole(roleName));
  } else {
    hasAccess = hasAnyRole(roleArray);
  }

  if (!hasAccess) {
    if (showMessage) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '16px' }}>
            ⛔ Không có quyền truy cập
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '24px' }}>
            Bạn không có role phù hợp để truy cập trang này.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 24px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Quay lại
          </button>
        </div>
      );
    }
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default RoleGuard;
