"use client";

import axiosInstance from "./axiosConfig";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

class TagManage {
    GetTag() {
        return axiosInstance.get("/api/Tags");
        
    }

    GetTagById(id) {
        return axiosInstance.get(`/api/Tags/${id}`);
    }

    UpdateTag(id, name, description) {
        return axiosInstance.put(`/api/Tags/${id}`, {
            id: id,
            name: name,
            description: description
        });
    }

    CreateTag(tag) {
        return axiosInstance.post("/api/Tags", tag);
    }

    DeleteTag(id) {
        return axiosInstance.delete(`/api/Tags/${id}`);
    }

    BulkDeleteTags(ids) {
        return axiosInstance.delete("/api/tags/bulk", {
            data: ids
        });
    }
}

export default new TagManage