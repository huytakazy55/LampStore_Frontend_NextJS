"use client";

import axiosInstance from "./axiosConfig";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
class ProfileService {
    GetCurrentProfile() {
        return axiosInstance.get("/api/Account/profile");
    }

    UpdateUserProfile(id, fullName, userId, email, phoneNumber, address, shippingInfo = {}) {
        return axiosInstance.put(`/api/UserProfiles/UpdateUserProfile/${id}`, {
            Id: id,
            fullName: fullName,
            userId: userId,
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            city: shippingInfo.city || '',
            cityName: shippingInfo.cityName || '',
            district: shippingInfo.district || '',
            districtName: shippingInfo.districtName || '',
            ward: shippingInfo.ward || '',
            wardName: shippingInfo.wardName || ''
        });
    }

    CreateUserProfile(fullName, userId, email, phoneNumber, address, shippingInfo = {}) {
        return axiosInstance.post("/api/UserProfiles/CreateUserProfile", {
            fullName: fullName,
            userId: userId,
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            city: shippingInfo.city || '',
            cityName: shippingInfo.cityName || '',
            district: shippingInfo.district || '',
            districtName: shippingInfo.districtName || '',
            ward: shippingInfo.ward || '',
            wardName: shippingInfo.wardName || ''
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
