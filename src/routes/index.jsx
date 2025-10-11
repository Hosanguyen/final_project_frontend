import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../pages/login/Login';
import Home from '../pages/home/Home';
import NotFound from '../pages/notFound/NotFound';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Register from '../pages/register/Register';
import UserProfile from '../layouts/components/UserProfile/UserProfile';
import PrivateRoute from './PrivateRoute';
import PermissionCategoryList from '../pages/admin/permissionCategory/PermissionCategoryList';
import PermissionCategoryForm from '../pages/admin/permissionCategory/PermissionCategoryForm';
import PermissionForm from '../pages/admin/permission/PermissionForm';
import PermissionList from '../pages/admin/permission/PermissionList';
import RoleForm from '../pages/admin/role/RoleForm';
import RoleList from '../pages/admin/role/RoleList';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes - Không có Layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes với MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <UserProfile />
                            </PrivateRoute>
                        }
                    />
                </Route>

                {/* Routes với AdminLayout */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<div>Tổng quan</div>} />
                    <Route
                        path="/admin/permission-categories"
                        element={
                            <PrivateRoute>
                                <PermissionCategoryList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/permission-categories/create"
                        element={
                            <PrivateRoute>
                                <PermissionCategoryForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/permission-categories/edit/:id"
                        element={
                            <PrivateRoute>
                                <PermissionCategoryForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/permissions"
                        element={
                            <PrivateRoute>
                                <PermissionList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/permissions/create"
                        element={
                            <PrivateRoute>
                                <PermissionForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/permissions/edit/:id"
                        element={
                            <PrivateRoute>
                                <PermissionForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/roles"
                        element={
                            <PrivateRoute>
                                <RoleList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/roles/create"
                        element={
                            <PrivateRoute>
                                <RoleForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/roles/edit/:id"
                        element={
                            <PrivateRoute>
                                <RoleForm />
                            </PrivateRoute>
                        }
                    />
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
