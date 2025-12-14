import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../pages/login/Login';
import Home from '../pages/home/Home';
import NotFound from '../pages/notFound/NotFound';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Register from '../pages/register/Register';
import UserProfile from '../pages/UserProfile/UserProfile';
import PrivateRoute from './PrivateRoute';
import RoleGuard from '../components/RoleGuard';
import PermissionCategoryList from '../pages/admin/permissionCategory/PermissionCategoryList';
import PermissionCategoryForm from '../pages/admin/permissionCategory/PermissionCategoryForm';
import PermissionForm from '../pages/admin/permission/PermissionForm';
import PermissionList from '../pages/admin/permission/PermissionList';
import RoleForm from '../pages/admin/role/RoleForm';
import RoleList from '../pages/admin/role/RoleList';
import LanguageManager from '../pages/admin/language/LanguageManagement';
import TagManager from '../pages/admin/tag/TagManagement';
import CourseManagement from '../pages/admin/course/CourseManagement';
import CourseFormPage from '../pages/admin/course/CourseFormPage';
import CourseDetailPage from '../pages/admin/course/CourseDetailPage';
import CourseLessonLinker from '../pages/admin/course/CourseLessonLinker';
import LessonManagement from '../pages/admin/lesson/LessonManagement';
import LessonFormPage from '../pages/admin/lesson/LessonFormPage';
import LessonDetailPage from '../pages/admin/lesson/LessonDetailPage';
import AdminDashboard from '../pages/admin/dashboard/AdminDashboard';
import Courses from '../pages/courses/Courses';
import CourseDetail from '../pages/courses/CourseDetail';
import CourseLearning from '../pages/courses/CourseLearning';
import ProblemForm from '../pages/admin/problem/ProblemForm';
import ProblemDetail from '../pages/admin/problem/ProblemDetail';
import ProblemList from '../pages/admin/problem/ProblemList';
import ContestManagement from '../pages/admin/contest/ContestManagement';
import ContestForm from '../pages/admin/contest/ContestForm';
import ContestDetail from '../pages/admin/contest/ContestDetail';
import ContestDetailStatistics from '../pages/admin/contest/ContestDetailStatistics';
import Practice from '../pages/practice/Practice';
import PracticeLeaderboard from '../pages/contests/PracticeLeaderboard';
import UserForm from '../pages/admin/user/UserForm';
import UserList from '../pages/admin/user/UserList';
import ProblemDetailUser from '../pages/problem/ProblemDetailUser';
import Contests from '../pages/contests/Contests';
import ContestDetailUser from '../pages/contests/ContestDetailUser';
import QuizList from '../pages/admin/quiz/QuizList';
import QuizForm from '../pages/admin/quiz/QuizForm';
import QuizDetail from '../pages/admin/quiz/QuizDetail';
import GlobalRanking from '../pages/GlobalRanking/GlobalRanking';
import PaymentResult from '../pages/PaymentResult';
import OrderHistory from '../pages/OrderHistory';
import UserReports from '../pages/admin/statistic/UserReports';
import CourseReports from '../pages/admin/statistic/CourseReports';
import ContestStatistics from '../pages/admin/statistic/ContestStatistics';
import ProblemStatistics from '../pages/admin/statistic/ProblemStatistics';
import RevenueStatistics from '../pages/admin/statistic/RevenueStatistics';

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
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:slug" element={<CourseDetail />} />
                    <Route
                        path="/courses/:slug/learn"
                        element={
                            <PrivateRoute>
                                <CourseLearning />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/payment-result" element={<PaymentResult />} />
                    <Route
                        path="/order-history"
                        element={
                            <PrivateRoute>
                                <OrderHistory />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/practice" element={<Practice />} />
                    <Route path="/practice/ranking" element={<PracticeLeaderboard />} />
                    <Route path="/global-ranking" element={<GlobalRanking />} />
                    <Route path="/contests" element={<Contests />} />
                    <Route path="/contests/:id" element={<ContestDetailUser />} />
                    <Route path="/problems/:id" element={<ProblemDetailUser />} />
                    <Route path="/contest-problems/:contestProblemId" element={<ProblemDetailUser />} />
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
                    <Route
                        path="/admin/dashboard"
                        element={
                            <RoleGuard roles="admin">
                                <AdminDashboard />
                            </RoleGuard>
                        }
                    />
                    <Route
                        path="/admin/permission-categories"
                        element={
                            <RoleGuard roles="admin">
                                <PermissionCategoryList />
                            </RoleGuard>
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

                    {/* Users */}
                    <Route
                        path="/admin/users"
                        element={
                            <PrivateRoute>
                                <UserList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/users/create"
                        element={
                            <PrivateRoute>
                                <UserForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/users/edit/:id"
                        element={
                            <PrivateRoute>
                                <UserForm />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/languages"
                        element={
                            <PrivateRoute>
                                <LanguageManager />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/tags"
                        element={
                            <PrivateRoute>
                                <TagManager />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/courses"
                        element={
                            <PrivateRoute>
                                <CourseManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/create"
                        element={
                            <PrivateRoute>
                                <CourseFormPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/edit/:id"
                        element={
                            <PrivateRoute>
                                <CourseFormPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/:id"
                        element={
                            <PrivateRoute>
                                <CourseDetailPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/:courseId/add-lessons"
                        element={
                            <PrivateRoute>
                                <CourseLessonLinker />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/lessons"
                        element={
                            <PrivateRoute>
                                <LessonManagement />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/:courseId/lessons/create"
                        element={
                            <PrivateRoute>
                                <LessonFormPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/:courseId/lessons/edit/:id"
                        element={
                            <PrivateRoute>
                                <LessonFormPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/lessons/:id"
                        element={
                            <PrivateRoute>
                                <LessonDetailPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/lessons/create"
                        element={
                            <PrivateRoute>
                                <LessonFormPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/lessons/edit/:id"
                        element={
                            <PrivateRoute>
                                <LessonFormPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/problems"
                        element={
                            <PrivateRoute>
                                <ProblemList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/problems/create"
                        element={
                            <PrivateRoute>
                                <ProblemForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/problems/edit/:id"
                        element={
                            <PrivateRoute>
                                <ProblemForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/problems/:id"
                        element={
                            <PrivateRoute>
                                <ProblemDetail />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/contest-problems/:contestProblemId"
                        element={
                            <PrivateRoute>
                                <ProblemDetail />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/contests"
                        element={
                            <PrivateRoute>
                                <ContestManagement />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/contests/:id/statistics"
                        element={
                            <PrivateRoute>
                                <ContestDetailStatistics />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/contests/create"
                        element={
                            <PrivateRoute>
                                <ContestForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/contests/edit/:id"
                        element={
                            <PrivateRoute>
                                <ContestForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/contests/:id"
                        element={
                            <PrivateRoute>
                                <ContestDetail />
                            </PrivateRoute>
                        }
                    />

                    {/* Quiz Routes */}
                    <Route
                        path="/admin/quizzes"
                        element={
                            <PrivateRoute>
                                <QuizList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/quizzes/create"
                        element={
                            <PrivateRoute>
                                <QuizForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/quizzes/:id/edit"
                        element={
                            <PrivateRoute>
                                <QuizForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/quizzes/:id"
                        element={
                            <PrivateRoute>
                                <QuizDetail />
                            </PrivateRoute>
                        }
                    />

                    {/* Statistics Routes */}
                    <Route
                        path="/admin/statistics/user-reports"
                        element={
                            <PrivateRoute>
                                <UserReports />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/statistics/course-reports"
                        element={
                            <PrivateRoute>
                                <CourseReports />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/statistics/contest-reports"
                        element={
                            <PrivateRoute>
                                <ContestStatistics />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/statistics/problem/:id"
                        element={
                            <PrivateRoute>
                                <ProblemStatistics />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/statistics/revenue-reports"
                        element={
                            <PrivateRoute>
                                <RevenueStatistics />
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
