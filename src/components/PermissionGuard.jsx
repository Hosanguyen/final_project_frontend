import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

/**
 * Component bảo vệ route dựa trên permissions
 * @param {string|string[]} permissions - Permission code hoặc mảng permission codes
 * @param {boolean} requireAll - Nếu true, yêu cầu tất cả permissions. Nếu false, chỉ cần 1 permission
 * @param {string} fallback - Đường dẫn redirect khi không có permission
 * @param {React.ReactNode} children - Component con
 */
const PermissionGuard = ({ 
  permissions, 
  requireAll = false, 
  fallback = '/', 
  children,
  showMessage = true
}) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  let hasAccess = false;
  
  if (requireAll) {
    hasAccess = hasAllPermissions(permissionArray);
  } else {
    hasAccess = hasAnyPermission(permissionArray);
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
            Bạn không có quyền truy cập vào trang này.
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

export default PermissionGuard;
