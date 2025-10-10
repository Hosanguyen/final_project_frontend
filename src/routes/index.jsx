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
                    <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>}/>
                </Route>

                {/* Routes với AdminLayout */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<div>Tổng quan</div>} />
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
