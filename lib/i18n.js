"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            HomePage: 'Home Page',
            Home: 'Home',
            Users: 'Users',
            User: 'User',
            Category: 'Category',
            Products: 'Products',
            Orders: 'Orders',
            Chat: 'Chat Support',
            Delivery: 'Delivery',
            Setting: 'Setting',
            Analytics: 'Analytics',
            VisitorMap: 'Visitor Map',
            Tags: 'Tags',
            SaleOverTime: 'Sales Over Time',
            Create: 'Create',
            Update: 'Update',
            Upload: 'Upload',
            Product: 'Product',
            Admin: 'Administrator',
            Role: 'Role',
            Filter: 'Filter',
            Save: 'Save',
            CreateUser: 'Create User',
            EditUser: 'Edit User',
            Username: 'Username',
            Email: 'Email',
            Password: 'Password',
            ConfirmPassword: 'Confirm Password',
            PleaseInputUsername: 'Please input the username',
            UsernameMinLength: 'Username must be at least 3 characters',
            PleaseInputEmail: 'Please input the email',
            InvalidEmail: 'Invalid email address',
            PleaseInputPassword: 'Please input the password',
            PasswordMinLength: 'Password must be at least 6 characters',
            PleaseConfirmPassword: 'Please confirm the password',
            PasswordsDoNotMatch: 'Passwords do not match',
            PleaseSelectRole: 'Please select a role',
            CreateSuccess: 'Created successfully',
            CreateFailed: 'Create failed',
            UpdateSuccess: 'Updated successfully',
            UpdateFailed: 'Update failed',
            ConfirmDelete: 'Confirm Delete',
            ConfirmDeleteSelected: 'Are you sure you want to delete {{count}} selected item(s)?',
            DeleteSelected: 'Delete Selected',
        },
    },
    vi: {
        translation: {
            HomePage: 'Trang chủ',
            Home: 'Trang chủ',
            Users: 'Người dùng',
            User: 'Người dùng',
            Category: 'Danh mục',
            Products: 'Sản phẩm',
            Orders: 'Đơn hàng',
            Chat: 'Chat Hỗ trợ',
            Delivery: 'Vận chuyển',
            Setting: 'Cài đặt',
            Analytics: 'Phân tích',
            VisitorMap: 'Bản đồ truy cập',
            Tags: 'Thẻ sản phẩm',
            SaleOverTime: 'Doanh thu bán hàng theo thời gian',
            Create: 'Thêm mới',
            Update: 'Chỉnh sửa',
            Upload: 'Tải lên',
            Product: 'Sản phẩm',
            Admin: 'Quản trị viên',
            Role: 'Vai trò',
            Filter: 'Lọc',
            Save: 'Lưu',
            CreateUser: 'Tạo người dùng',
            EditUser: 'Sửa người dùng',
            Username: 'Tên đăng nhập',
            Email: 'Email',
            Password: 'Mật khẩu',
            ConfirmPassword: 'Xác nhận mật khẩu',
            PleaseInputUsername: 'Vui lòng nhập tên đăng nhập',
            UsernameMinLength: 'Tên đăng nhập phải có ít nhất 3 ký tự',
            PleaseInputEmail: 'Vui lòng nhập email',
            InvalidEmail: 'Địa chỉ email không hợp lệ',
            PleaseInputPassword: 'Vui lòng nhập mật khẩu',
            PasswordMinLength: 'Mật khẩu phải có ít nhất 6 ký tự',
            PleaseConfirmPassword: 'Vui lòng xác nhận mật khẩu',
            PasswordsDoNotMatch: 'Mật khẩu xác nhận không khớp',
            PleaseSelectRole: 'Vui lòng chọn vai trò',
            CreateSuccess: 'Tạo thành công',
            CreateFailed: 'Tạo thất bại',
            UpdateSuccess: 'Cập nhật thành công',
            UpdateFailed: 'Cập nhật thất bại',
            ConfirmDelete: 'Xác nhận xoá',
            ConfirmDeleteSelected: 'Bạn có chắc muốn xoá {{count}} mục đã chọn?',
            DeleteSelected: 'Xoá đã chọn',
        },
    },
};

// Only initialize on client side
if (typeof window !== 'undefined') {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
        });
}

export default i18n;
