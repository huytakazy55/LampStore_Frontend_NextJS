/**
 * Helper để đọc thông báo lỗi từ API response theo format mới.
 * 
 * Backend response format:
 * - Error: { errorCode: "AUTH_001", message: "...", detail: "...", errors: [...] }
 * - Success: { message: "...", data: {...} }
 * 
 * Hàm này hỗ trợ cả format cũ (plain string, { Message: "..." }) để đảm bảo backward compatibility.
 */

/**
 * Lấy thông báo lỗi từ API error response.
 * @param {Error} error - Axios error object
 * @param {string} fallback - Thông báo mặc định nếu không tìm thấy
 * @returns {string} Thông báo lỗi tiếng Việt
 */
export function getApiErrorMessage(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
    const data = error?.response?.data;
    if (!data) return fallback;

    // New format: { message: "..." }
    if (typeof data === 'object' && data.message) return data.message;

    // Old format: { Message: "..." }
    if (typeof data === 'object' && data.Message) return data.Message;

    // Plain string
    if (typeof data === 'string' && data.length > 0 && data.length < 500) return data;

    return fallback;
}

/**
 * Lấy chi tiết lỗi (detail) từ API error response.
 * @param {Error} error - Axios error object
 * @returns {string|null}
 */
export function getApiErrorDetail(error) {
    const data = error?.response?.data;
    if (!data || typeof data !== 'object') return null;
    return data.detail || data.Detail || null;
}

/**
 * Lấy mã lỗi (errorCode) từ API error response.
 * @param {Error} error - Axios error object
 * @returns {string|null}
 */
export function getApiErrorCode(error) {
    const data = error?.response?.data;
    if (!data || typeof data !== 'object') return null;
    return data.errorCode || data.ErrorCode || null;
}

/**
 * Lấy danh sách lỗi validation từ API error response.
 * @param {Error} error - Axios error object
 * @returns {Array|null}
 */
export function getApiValidationErrors(error) {
    const data = error?.response?.data;
    if (!data || typeof data !== 'object') return null;

    // New format: { errors: [...] } hoặc { errors: { $values: [...] } }
    if (data.errors) {
        if (Array.isArray(data.errors)) return data.errors;
        if (data.errors.$values) return data.errors.$values;
        // ASP.NET ModelState format: { "FieldName": ["Error1", "Error2"] }
        if (typeof data.errors === 'object') {
            return Object.values(data.errors).flat();
        }
    }

    // Old format: { Errors: [...] }
    if (data.Errors) {
        if (Array.isArray(data.Errors)) return data.Errors;
        if (data.Errors.$values) return data.Errors.$values;
    }

    return null;
}

/**
 * Lấy thông báo thành công từ API success response.
 * @param {object} responseData - Axios response.data
 * @param {string} fallback - Thông báo mặc định
 * @returns {string}
 */
export function getApiSuccessMessage(responseData, fallback = 'Thao tác thành công!') {
    if (!responseData) return fallback;
    return responseData.message || responseData.Message || fallback;
}
