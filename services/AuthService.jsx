"use client";

import axiosInstance from "./axiosConfig";
import { toast } from 'react-toastify';
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

class AuthService
{
    async signin(username, password, rememberme)
    {
        const response = await axiosInstance.post("/api/Account/SignIn", {
            username: username,
            password: password,
            rememberme: rememberme
        });

        // Lưu cả access token và refresh token
        if (response.data && response.data.accessToken)
        {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('tokenExpiry', Date.now() + (response.data.expiresIn * 1000));
        }

        return response;
    }
    signup(username, email, password)
    {
        return axiosInstance.post("/api/Account/SignUp", {
            username: username,
            email: email,
            password: password
        });
    }

    async googleSignIn(googleUserData)
    {
        const response = await axiosInstance.post("/api/Account/GoogleSignIn", {
            email: googleUserData.email,
            name: googleUserData.name,
            picture: googleUserData.picture,
            googleUserId: googleUserData.sub,
            token: googleUserData.token
        });

        // Lưu cả access token và refresh token
        if (response.data && response.data.accessToken)
        {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('tokenExpiry', Date.now() + (response.data.expiresIn * 1000));
        }

        return response;
    }

    async logout()
    {
        try
        {
            await axiosInstance.post("/api/Account/Logout");
            // Xóa tokens
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiry');
            // Xóa giỏ hàng
            localStorage.removeItem('lamp_store_cart');
            await toast.success("Đã đăng xuất tài khoản!");
            window.location.reload();
            return true;
        } catch (error)
        {
            // Vẫn xóa tokens ngay cả khi API call thất bại
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiry');
            // Xóa giỏ hàng
            localStorage.removeItem('lamp_store_cart');
            toast.error("Đã xảy ra lỗi khi đăng xuất!");
            return false;
        }
    }

    async profile()
    {
        try
        {
            const response = await axiosInstance.get("/api/Account/profile");
            return response.data;
        } catch (error)
        {
            return null;
        }
    }

    async changePassword(currentPassword, newPassword)
    {
        const response = await axiosInstance.post("/api/Account/ChangePassword", {
            currentPassword,
            newPassword
        });
        return response.data;
    }

    ForgotPassword(emailOrUsername)
    {
        return axiosInstance.post("/api/Account/ForgotPassword", {
            emailOrUsername: emailOrUsername
        });
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AuthService()