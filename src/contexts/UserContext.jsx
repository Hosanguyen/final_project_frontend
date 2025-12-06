import React, { createContext, useContext, useState, useEffect } from 'react';
import { logoutUser as logoutAPI } from '../services/AuthService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage on mount
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setRoles(userData.roles || []);
        setPermissions(userData.permissions || []);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setRoles(userData.roles || []);
    setPermissions(userData.permissions || []);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    // Gọi API logout để revoke token
    await logoutAPI();
    
    // Clear state
    setUser(null);
    setRoles([]);
    setPermissions([]);
    
    // localStorage đã được xóa trong logoutAPI
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    if (userData.roles !== undefined) {
      setRoles(userData.roles);
    }
    if (userData.permissions !== undefined) {
      setPermissions(userData.permissions);
    }
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check if user has specific permission
  const hasPermission = (permissionCode) => {
    return permissions.includes(permissionCode);
  };

  // Check if user has any of the permissions
  const hasAnyPermission = (permissionCodes) => {
    return permissionCodes.some(code => permissions.includes(code));
  };

  // Check if user has all of the permissions
  const hasAllPermissions = (permissionCodes) => {
    return permissionCodes.every(code => permissions.includes(code));
  };

  // Check if user has specific role
  const hasRole = (roleName) => {
    return roles.some(role => role.name === roleName);
  };

  // Check if user has any of the roles
  const hasAnyRole = (roleNames) => {
    return roleNames.some(roleName => roles.some(role => role.name === roleName));
  };

  const value = {
    user,
    roles,
    permissions,
    loading,
    login,
    logout,
    updateUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
