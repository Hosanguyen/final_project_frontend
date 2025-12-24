# Course Management System

## Tổng quan
Hệ thống quản lý khóa học được xây dựng với ReactJS và Django REST Framework, cung cấp đầy đủ tính năng CRUD cho courses và lessons.

## Cấu trúc thư mục

### Frontend (ReactJS)
```
src/
├── pages/
│   ├── courses/                    # Trang khóa học cho người dùng
│   │   ├── Courses.jsx            # Trang danh sách khóa học
│   │   ├── CourseCard.jsx         # Card hiển thị khóa học
│   │   ├── CourseFilters.jsx      # Bộ lọc khóa học
│   │   └── *.css                  # Styles
│   └── admin/
│       ├── course/                # Quản lý khóa học (Admin)
│       │   ├── CourseManagement.jsx
│       │   ├── CourseCard.jsx
│       │   ├── CourseForm.jsx
│       │   ├── CourseFilters.jsx
│       │   └── *.css
│       ├── lesson/                # Quản lý bài học (Admin)
│       │   ├── LessonManagement.jsx
│       │   ├── LessonCard.jsx
│       │   ├── LessonForm.jsx
│       │   ├── LessonFilters.jsx
│       │   └── *.css
│       └── dashboard/             # Dashboard admin
│           ├── AdminDashboard.jsx
│           └── *.css
├── services/
│   ├── CourseService.js           # API service cho courses
│   └── LessonService.js           # API service cho lessons
└── routes/
    └── index.jsx                  # Cấu hình routes
```

### Backend (Django)
```
backend/
├── course/
│   ├── models.py                  # Models: Course, Lesson, LessonResource, etc.
│   ├── serializers.py            # Serializers cho API
│   ├── views.py                  # API Views (CRUD operations)
│   └── urls.py                   # URL patterns
```

## Tính năng chính

### 1. Course Management (Admin)
- ✅ CRUD operations đầy đủ
- ✅ Tìm kiếm và lọc theo nhiều tiêu chí
- ✅ Quản lý languages và tags
- ✅ Hiển thị thống kê
- ✅ UI/UX hiện đại, responsive

### 2. Lesson Management (Admin)
- ✅ CRUD operations đầy đủ
- ✅ Quản lý tài nguyên bài học (video, PDF, slide, text, link, file)
- ✅ Sắp xếp theo thứ tự
- ✅ Liên kết với courses
- ✅ UI/UX hiện đại, responsive

### 3. Course Display (User)
- ✅ Hiển thị danh sách khóa học công khai
- ✅ Tìm kiếm và lọc
- ✅ Card hiển thị đẹp mắt
- ✅ Responsive design

### 4. Admin Dashboard
- ✅ Thống kê tổng quan
- ✅ Khóa học gần đây
- ✅ Thao tác nhanh

## API Endpoints

### Courses
- `GET /api/course/courses/` - Lấy danh sách courses
- `POST /api/course/courses/` - Tạo course mới
- `GET /api/course/courses/{id}/` - Lấy chi tiết course
- `PUT /api/course/courses/{id}/` - Cập nhật course
- `PATCH /api/course/courses/{id}/` - Cập nhật một phần course
- `DELETE /api/course/courses/{id}/` - Xóa course

### Lessons
- `GET /api/course/lessons/` - Lấy danh sách lessons
- `POST /api/course/lessons/` - Tạo lesson mới
- `GET /api/course/lessons/{id}/` - Lấy chi tiết lesson
- `PUT /api/course/lessons/{id}/` - Cập nhật lesson
- `PATCH /api/course/lessons/{id}/` - Cập nhật một phần lesson
- `DELETE /api/course/lessons/{id}/` - Xóa lesson

### Lesson Resources
- `GET /api/course/lesson-resources/` - Lấy danh sách resources
- `POST /api/course/lesson-resources/` - Tạo resource mới
- `GET /api/course/lesson-resources/{id}/` - Lấy chi tiết resource
- `PUT /api/course/lesson-resources/{id}/` - Cập nhật resource
- `PATCH /api/course/lesson-resources/{id}/` - Cập nhật một phần resource
- `DELETE /api/course/lesson-resources/{id}/` - Xóa resource

### Supporting APIs
- `GET /api/course/languages/` - Lấy danh sách languages
- `GET /api/course/tags/` - Lấy danh sách tags

## Routes

### Public Routes
- `/courses` - Trang khóa học cho người dùng

### Admin Routes
- `/admin/dashboard` - Dashboard quản trị
- `/admin/courses` - Quản lý khóa học
- `/admin/lessons` - Quản lý bài học

## Cách sử dụng

### 1. Khởi chạy Backend
```bash
cd backend
python manage.py runserver
```

### 2. Khởi chạy Frontend
```bash
cd frontend
npm start
```

### 3. Truy cập ứng dụng
- Trang chủ: `http://localhost:3000`
- Khóa học: `http://localhost:3000/courses`
- Admin: `http://localhost:3000/admin/dashboard`

## Công nghệ sử dụng

### Frontend
- React 19
- TailwindCSS
- Lucide React Icons
- Axios
- React Router DOM

### Backend
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Tính năng nâng cao

### Filtering & Search
- Tìm kiếm theo tên, mô tả
- Lọc theo cấp độ, ngôn ngữ, thẻ
- Sắp xếp theo nhiều tiêu chí

### Responsive Design
- Mobile-first approach
- Breakpoints cho tablet và desktop
- Touch-friendly interface

### Error Handling
- Loading states
- Error messages
- Form validation

### Performance
- Lazy loading
- Optimized API calls
- Efficient state management
