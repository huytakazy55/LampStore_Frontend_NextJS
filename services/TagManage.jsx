"use client";

import axiosInstance from "./axiosConfig";
import { getTotalCount } from "@/lib/pagination";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

class TagManage {
    GetTag() {
        return axiosInstance.get("/api/Tags");

    }

    // Server-driven pagination and search for the admin Tags screen.
    async GetTagsPaged(page = 1, pageSize = 20, search = '') {
        const response = await axiosInstance.get('/api/Tags', {
            params: { page, pageSize, search: search || undefined }
        });
        const items = response.data?.$values || response.data || [];
        const total = getTotalCount(response, items);
        return { items, total };
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
