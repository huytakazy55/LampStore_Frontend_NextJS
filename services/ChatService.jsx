"use client";

import axiosInstance from "./axiosConfig";
import * as signalR from "@microsoft/signalr";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

class ChatService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    // SignalR Connection (ENABLED)
    async startConnection() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("No token found, cannot start SignalR connection");
                return false;
            }

            console.log('🔗 Connecting to SignalR Hub:', `${API_ENDPOINT}/chathub`);
            
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_ENDPOINT}/chathub`, {
                    // Bug fix: đọc token dynamically mỗi lần gọi (tránh dùng token hết hạn khi reconnect)
                    accessTokenFactory: () => {
                        const currentToken = localStorage.getItem("token");
                        console.log('🔑 Providing access token for SignalR');
                        return currentToken;
                    },
                    // Use all available transports with fallback
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
                    skipNegotiation: false
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Debug) // More detailed logging
                .build();

            // Setup event handlers
            this.setupEventHandlers();

            await this.connection.start();
            this.isConnected = true;
            console.log("✅ SignalR Connected successfully");
            return true;
        } catch (error) {
            console.error("❌ SignalR Connection failed:", error);
            this.isConnected = false;
            return false;
        }
    }

    async initializeConnection() {
        // Nếu đã kết nối thành công, return true
        if (this.isConnected && this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            console.log('🔗 SignalR already connected');
            // Nếu là admin, join group admins
            this.joinAdminsGroupIfAdmin();
            return true;
        }

        // Nếu connection đang trong quá trình kết nối, đợi
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connecting) {
            console.log('🔄 SignalR connection in progress, waiting...');
            try {
                // Đợi tối đa 10 giây
                const timeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout')), 10000)
                );
                await Promise.race([
                    new Promise(resolve => {
                        const checkConnection = () => {
                            if (this.connection.state === signalR.HubConnectionState.Connected) {
                                this.isConnected = true;
                                resolve(true);
                            } else {
                                setTimeout(checkConnection, 100);
                            }
                        };
                        checkConnection();
                    }),
                    timeout
                ]);
                return this.isConnected;
            } catch (error) {
                console.warn('⚠️ SignalR connection timeout, force restart');
            }
        }

        // Disconnect connection cũ nếu có
        if (this.connection) {
            try {
                await this.connection.stop();
            } catch (error) {
                console.warn('Warning stopping old connection:', error);
            }
            this.connection = null;
            this.isConnected = false;
        }

        // Bắt đầu kết nối mới
        const connected = await this.startConnection();
        if (connected) {
            // Nếu là admin, join group admins
            await this.joinAdminsGroupIfAdmin();
        }
        return connected;
    }

    async disconnect() {
        try {
            if (this.connection) {
                await this.connection.stop();
                this.connection = null;
                this.isConnected = false;
                console.log("SignalR disconnected");
            }
        } catch (error) {
            console.error("Error disconnecting SignalR:", error);
        }
    }

    setupEventHandlers() {
        if (!this.connection) return;

        // Xóa các handler cũ để tránh duplicate
        try {
            this.connection.off("ReceiveMessage");
            this.connection.off("UserTyping");
            this.connection.off("MessageRead");
            this.connection.off("UserOnline");
            this.connection.off("UserOffline");
            this.connection.off("AdminChatNotification"); // event mới cho admin notification
        } catch (error) {
            // Silent ignore if no handlers to remove
        }

        // Nhận tin nhắn real-time (chỉ show trong chat window)
        this.connection.on("ReceiveMessage", (message) => {
            window.dispatchEvent(new CustomEvent("newMessage", { detail: message }));
        });

        // AdminChatNotification: event riêng cho admin notification popup
        // Tách biệt hoàn toàn với ReceiveMessage để tránh duplicate
        this.connection.on("AdminChatNotification", (data) => {
            window.dispatchEvent(new CustomEvent("adminChatNotification", { detail: data }));
        });

        // User typing indicator
        this.connection.on("UserTyping", (data) => {
            window.dispatchEvent(new CustomEvent("userTyping", { detail: data }));
        });

        // Message read status
        this.connection.on("MessageRead", (data) => {
            window.dispatchEvent(new CustomEvent("messageRead", { detail: data }));
        });

        // User online/offline
        this.connection.on("UserOnline", (userId) => {
            window.dispatchEvent(new CustomEvent("userOnline", { detail: userId }));
        });

        this.connection.on("UserOffline", (userId) => {
            window.dispatchEvent(new CustomEvent("userOffline", { detail: userId }));
        });

        // Connection events
        this.connection.onreconnecting(() => {
            console.log("🔄 SignalR reconnecting...");
            this.isConnected = false;
        });

        this.connection.onreconnected(() => {
            console.log("✅ SignalR reconnected");
            this.isConnected = true;
        });

        this.connection.onclose(() => {
            console.log("❌ SignalR connection closed");
            this.isConnected = false;
        });
    }

    // Chat management
    async joinChat(chatId) {
        try {
            if (this.connection && this.isConnected) {
                console.log('🏠 Joining chat room:', chatId);
                await this.connection.invoke("JoinChat", chatId);
                console.log('✅ Successfully joined chat room:', chatId);
                return true;
            } else {
                console.warn('⚠️ Cannot join chat - SignalR not connected:', {
                    hasConnection: !!this.connection,
                    isConnected: this.isConnected,
                    connectionState: this.connection?.state
                });
                return false;
            }
        } catch (error) {
            console.error('❌ Error joining chat room:', chatId, error);
            return false;
        }
    }

    async leaveChat(chatId) {
        try {
            if (this.connection && this.isConnected) {
                console.log('🚪 Leaving chat room:', chatId);
                await this.connection.invoke("LeaveChat", chatId);
                console.log('✅ Successfully left chat room:', chatId);
                return true;
            }
        } catch (error) {
            console.error('❌ Error leaving chat room:', chatId, error);
            return false;
        }
    }

    async sendMessageViaSignalR(chatId, message) {
        if (this.connection && this.isConnected) {
            await this.connection.invoke("SendMessage", chatId, message);
        }
    }

    // Test connection helper
    async testConnection() {
        try {
            console.log('🧪 Testing SignalR connection...');
            console.log('API_ENDPOINT:', API_ENDPOINT);
            console.log('Token available:', !!localStorage.getItem("token"));
            console.log('Connection state:', this.connection?.state);
            console.log('Is connected:', this.isConnected);
            
            if (!this.isConnected) {
                console.log('⚠️ Not connected, attempting to connect...');
                await this.startConnection();
            }
            
            return this.isConnected;
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    }

    // Send message qua API, để backend phát realtime qua SignalR (tránh duplicate)
    async sendMessage(chatId, content, type = 1) {
        try {
            console.log('📤 User sending message:', { chatId, content, type });
            const result = await this.sendMessageApi(chatId, content, type);
            console.log('✅ Message sent via API:', result);
            return result;
        } catch (error) {
            console.error("❌ Error sending message:", error);
            throw error;
        }
    }

    async userTyping(chatId, isTyping) {
        if (this.connection && this.isConnected) {
            await this.connection.invoke("UserTyping", chatId, isTyping);
        }
    }

    async markAsRead(chatId, messageId) {
        if (this.connection && this.isConnected) {
            await this.connection.invoke("MarkAsRead", chatId, messageId);
        }
    }

    // Event listeners
    onReceiveMessage(callback) {
        if (this.connection) {
            this.connection.off("ReceiveMessage", callback);
            this.connection.on("ReceiveMessage", callback);
        }
    }

    onUserTyping(callback) {
        if (this.connection) {
            this.connection.off("UserTyping", callback);
            this.connection.on("UserTyping", callback);
        }
    }

    onMessageRead(callback) {
        if (this.connection) {
            this.connection.off("MessageRead", callback);
            this.connection.on("MessageRead", callback);
        }
    }

    onUserOnline(callback) {
        if (this.connection) {
            this.connection.off("UserOnline", callback);
            this.connection.on("UserOnline", callback);
        }
    }

    onUserOffline(callback) {
        if (this.connection) {
            this.connection.off("UserOffline", callback);
            this.connection.on("UserOffline", callback);
        }
    }

    onNewChatCreated(callback) {
        if (this.connection) {
            this.connection.off("NewChatCreated", callback);
            this.connection.on("NewChatCreated", callback);
        }
    }

    onChatStatusUpdated(callback) {
        if (this.connection) {
            this.connection.off("ChatStatusUpdated", callback);
            this.connection.on("ChatStatusUpdated", callback);
        }
    }

    onChatClosed(callback) {
        if (this.connection) {
            this.connection.off("ChatClosed", callback);
            this.connection.on("ChatClosed", callback);
        }
    }

    // API calls
    async createChat(subject, priority = 2) { // Normal = 2
        const requestData = {
            subject,
            priority
        };
        
        console.log('Creating chat with data:', requestData);
        console.log('API endpoint:', `/api/Chat/create`);
        
        const response = await axiosInstance.post("/api/Chat/create", requestData);
        return response.data;
    }

    async getMyChats() {
        const response = await axiosInstance.get("/api/Chat/my-chats");
        return response.data;
    }

    // Alias for UI compatibility
    async getUserChats() {
        return await this.getMyChats();
    }

    async getAllChats() {
        const response = await axiosInstance.get("/api/Chat/all");
        return response.data;
    }

    async getChat(chatId) {
        const response = await axiosInstance.get(`/api/Chat/${chatId}`);
        return response.data;
    }

    async sendMessageApi(chatId, content, type = 1) { // Text = 1
        const requestData = {
            content,
            type
        };
        
        console.log('Sending message with data:', requestData);
        console.log('Message API endpoint:', `/api/Chat/${chatId}/messages`);
        
        const response = await axiosInstance.post(`/api/Chat/${chatId}/messages`, requestData);
        return response.data;
    }

    async getChatMessages(chatId) {
        console.log('🔗 API Call: GET messages for chat', chatId);
        console.log('🔗 Endpoint:', `/api/Chat/${chatId}/messages`);
        
        const response = await axiosInstance.get(`/api/Chat/${chatId}/messages`);
        
        console.log('🔗 API Response Status:', response.status);
        console.log('🔗 API Response Data:', response.data);
        
        return response.data;
    }

    async assignChat(chatId, adminId) {
        const response = await axiosInstance.post(`/api/Chat/${chatId}/assign`, {
            adminId
        });
        return response.data;
    }

    async updateChatStatus(chatId, status) {
        const response = await axiosInstance.put(`/api/Chat/${chatId}/status`, {
            status
        });
        return response.data;
    }

    async closeChat(chatId) {
        const response = await axiosInstance.post(`/api/Chat/${chatId}/close`, {});
        return response.data;
    }

    async getUnreadCount() {
        const response = await axiosInstance.get("/api/Chat/unread-count");
        return response.data;
    }

    async getChatStatistics() {
        const response = await axiosInstance.get("/api/Chat/statistics");
        return response.data;
    }

    // Test function - call this in browser console
    async testGetMessages(chatId) {
        try {
            console.log('🧪 Testing API directly for chat:', chatId);
            const result = await this.getChatMessages(chatId);
            console.log('🧪 Test Result:', result);
            return result;
        } catch (error) {
            console.error('🧪 Test Error:', error);
            return null;
        }
    }

    // Join group 'admins' để nhận notification toàn hệ thống
    async joinAdminsGroup() {
        try {
            if (this.connection && this.isConnected) {
                console.log('🎯 Joining admins group via SignalR...');
                await this.connection.invoke("JoinAdminsGroup");
                console.log('✅ Successfully joined admins group');
                return true;
            } else {
                console.warn('⚠️ Cannot join admins group - connection not ready:', {
                    hasConnection: !!this.connection,
                    isConnected: this.isConnected,
                    connectionState: this.connection?.state
                });
                return false;
            }
        } catch (error) {
            console.error('❌ Error joining admins group:', error);
            return false;
        }
    }

    async leaveAdminsGroup() {
        try {
            if (this.connection && this.isConnected) {
                console.log('🚪 Leaving admins group via SignalR...');
                await this.connection.invoke("LeaveAdminsGroup");
                console.log('✅ Successfully left admins group');
                return true;
            }
        } catch (error) {
            console.error('❌ Error leaving admins group:', error);
            return false;
        }
    }

    // Hàm kiểm tra role và join group admins nếu là admin
    async joinAdminsGroupIfAdmin() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('📢 No token found, cannot check admin role');
                return false;
            }
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role
                || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                || '';
            const userId = payload.nameid || payload.sub || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
            const userName = payload.unique_name || payload.name || 'Unknown';
            
            console.log('🔍 Checking user role:', { role, userId, userName });
            
            if (role === 'Administrator' || role === 'Admin') {
                console.log('✅ User is admin, joining admins group...');
                await this.joinAdminsGroup();
                console.log('🎯 Successfully joined admins group for user:', userName);
                return true;
            } else {
                console.log('👤 User is not admin, role:', role);
                return false;
            }
        } catch (e) {
            console.error('❌ Error checking admin role:', e);
            return false;
        }
    }
}

const chatServiceInstance = new ChatService();

// Expose to global scope for debugging
if (typeof window !== 'undefined') {
    window.ChatService = chatServiceInstance;
}

export default chatServiceInstance; 