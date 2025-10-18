# Tag Management

## Tổng quan
Trang quản lý thẻ (tags) cho phép admin tạo, chỉnh sửa và xóa các thẻ phân loại cho khóa học.

## Tính năng

### ✅ CRUD Operations
- **Tạo thẻ mới**: Thêm thẻ với tên và slug
- **Xem danh sách**: Hiển thị tất cả thẻ trong bảng
- **Chỉnh sửa**: Cập nhật thông tin thẻ trực tiếp trong bảng
- **Xóa**: Xóa thẻ với xác nhận

### ✅ Giao diện người dùng
- **Form thêm mới**: Input cho tên và slug
- **Bảng dữ liệu**: Hiển thị ID, tên, slug, ngày tạo
- **Inline editing**: Chỉnh sửa trực tiếp trong bảng
- **Responsive design**: Tương thích mobile và desktop
- **SweetAlert2**: Thông báo đẹp mắt

### ✅ Validation
- **Required fields**: Tên và slug bắt buộc
- **Error handling**: Xử lý lỗi API
- **Success feedback**: Thông báo thành công

## Cấu trúc file

```
src/pages/admin/tag/
├── TagManagement.jsx      # Component chính
├── TagManagement.css      # Styles
└── README.md             # Hướng dẫn này
```

## API Endpoints

Sử dụng `TagService` để gọi các API:
- `GET /api/course/tags/` - Lấy danh sách thẻ
- `POST /api/course/tags/` - Tạo thẻ mới
- `PUT /api/course/tags/{id}/` - Cập nhật thẻ
- `DELETE /api/course/tags/{id}/` - Xóa thẻ

## Cách sử dụng

### 1. Truy cập trang
- URL: `/admin/tags`
- Yêu cầu: Đăng nhập với quyền admin

### 2. Thêm thẻ mới
1. Nhập tên thẻ (ví dụ: "Programming")
2. Nhập slug (ví dụ: "programming")
3. Click "Add Tag"

### 3. Chỉnh sửa thẻ
1. Click icon edit (✏️) trong bảng
2. Chỉnh sửa thông tin
3. Click "Save" (✓) hoặc "Cancel" (✗)

### 4. Xóa thẻ
1. Click icon delete (🗑️) trong bảng
2. Xác nhận trong popup
3. Thẻ sẽ bị xóa vĩnh viễn

## Styling

### CSS Classes chính
- `.tag-manager` - Container chính
- `.tag-form` - Form thêm mới
- `.tag-table` - Bảng dữ liệu
- `.tag-name` - Badge hiển thị tên thẻ
- `.tag-slug` - Badge hiển thị slug

### Responsive Breakpoints
- **Desktop**: > 992px - Layout đầy đủ
- **Tablet**: 600px - 992px - Form dọc
- **Mobile**: < 600px - Bảng cuộn ngang

## Dependencies

### React Icons
- `FaEdit` - Icon chỉnh sửa
- `FaTrash` - Icon xóa
- `FaCheck` - Icon lưu
- `FaTimes` - Icon hủy

### External Libraries
- `sweetalert2` - Popup thông báo
- `TagService` - API service

## Tương thích

- ✅ React 19
- ✅ Modern browsers
- ✅ Mobile responsive
- ✅ Screen readers
- ✅ Keyboard navigation

## Lưu ý

1. **Slug tự động**: Nên tạo slug từ tên thẻ (lowercase, kebab-case)
2. **Unique constraint**: Tên và slug phải duy nhất
3. **Cascade delete**: Xóa thẻ có thể ảnh hưởng đến khóa học liên quan
4. **Backup**: Nên backup dữ liệu trước khi xóa hàng loạt
