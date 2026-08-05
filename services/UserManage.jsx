"use client";

import axiosInstance from "./axiosConfig";
import { getTotalCount } from "@/lib/pagination";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

class UserManage {
    async GetUserAccount() {
        try {
            const response = await axiosInstance.get("/api/Account/GetAllUserLogin");
            return response.data;
        } catch (error) {
            console.error("Error fetching user accounts:", error);
            throw error;
        }
    }

    // Server-driven paginated fetch for the admin Users screen (Roles-manage keeps using
    // GetUserAccount() above, which still returns the full list). NOTE:
    // /api/Account/GetAllUserLogin does not currently accept a search/keyword query
    // param — only page/pageSize (+ X-Total-Count header) are being added by the
    // backend. `search` is still forwarded defensively so this becomes true
    // server-side search the moment the backend adds support.
    async GetUserAccountPaged(page = 1, pageSize = 20, search = '') {
        try {
            const response = await axiosInstance.get("/api/Account/GetAllUserLogin", {
                params: { page, pageSize, search: search || undefined }
            });
            const items = response.data?.$values || response.data || [];
            const total = getTotalCount(response, items);
            return { items, total };
        } catch (error) {
            console.error("Error fetching user accounts:", error);
            throw error;
        }
    }

    async GetRoleById(userId) {
        try {
            const response = await axiosInstance.get(`/api/Account/role/${userId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching role for user ${userId}:`, error);
            throw error;
        }
    }

    async GetAvailableRoles() {
        try {
            const response = await axiosInstance.get(`/api/Account/AvailableRoles`);
            return response.data;
        } catch (error) {
            console.error("Error fetching available roles:", error);
            throw error;
        }
    }

    async AssignRoles(userId, roles) {
        try {
            const response = await axiosInstance.post(`/api/Account/AssignRoles`, {
                userId,
                roles,
            });
            return response.data;
        } catch (error) {
            console.error(`Error assigning roles for user ${userId}:`, error);
            throw error;
        }
    }

    async AddRole(roleName) {
        try {
            const response = await axiosInstance.post(`/api/Account/Roles`, { roleName });
            return response.data;
        } catch (error) {
            console.error("Error creating role:", error);
            throw error;
        }
    }

    async GetAvailableMenus() {
        try {
            const response = await axiosInstance.get(`/api/Account/AvailableMenus`);
            return response.data;
        } catch (error) {
            console.error("Error fetching available menus:", error);
            throw error;
        }
    }

    async GetRoleMenus(roleName) {
        try {
            const response = await axiosInstance.get(`/api/Account/RoleMenus/${roleName}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching menus for role ${roleName}:`, error);
            throw error;
        }
    }

    async SetRoleMenus(roleName, menus) {
        try {
            const response = await axiosInstance.post(`/api/Account/RoleMenus/${roleName}`, { menus });
            return response.data;
        } catch (error) {
            console.error(`Error setting menus for role ${roleName}:`, error);
            throw error;
        }
    }

    async GetUserMenus() {
        try {
            const response = await axiosInstance.get(`/api/Account/UserMenus`);
            return response.data;
        } catch (error) {
            console.error("Error fetching user menus:", error);
            throw error;
        }
    }
    
    async LockUser(userId) {
        try {
            const response = await axiosInstance.post(`/api/Account/LockUser/${userId}`, {});
            return response;
        } catch (error) {
            console.error(`Error locking user ${userId}:`, error);
            throw error;
        }
    }

    async UnLockUser(userId) {
        try {
            const response = await axiosInstance.post(`/api/Account/UnLockUser/${userId}`, {});
            return response;
        } catch (error) {
            console.error(`Error unlocking user ${userId}:`, error);
            throw error;
        }
    }
}

export default new UserManage