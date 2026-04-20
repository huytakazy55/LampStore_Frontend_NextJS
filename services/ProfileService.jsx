"use client";

import axiosInstance from "./axiosConfig";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
class ProfileService {
    UpdateUserProfile(id, fullName, userId, email, phoneNumber,address) {
        return axiosInstance.put(`/api/UserProfiles/UpdateUserProfile/${id}`, {
            Id: id,
            fullName: fullName,
            userId: userId,
            email: email,
            phoneNumber: phoneNumber,
            address: address
        });
    }

    CreateUserProfile(fullName, userId, email, phoneNumber, address) {
        return axiosInstance.post("/api/UserProfiles/CreateUserProfile", {
            fullName: fullName,
            userId: userId,
            email: email,
            phoneNumber: phoneNumber,
            address: address
        });
    }

    UploadAvatar(id, formData) {
        return axiosInstance.post(`/api/UserProfiles/${id}/UploadAvatar`, formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    DeleteAvatar(id){
        return axiosInstance.delete(`/api/UserProfiles/DeleteAvatar/${id}`);
    }
}

export default new ProfileService()