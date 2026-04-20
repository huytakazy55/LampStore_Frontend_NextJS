"use client";

import axiosInstance from "./axiosConfig";
import * as signalR from "@microsoft/signalr";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

class ChatService
{
    constructor()
    {
        this.connection = null;
        this.isConnected = false;
    }

    async startConnection()
    {
        try
        {
            const token = localStorage.getItem("token");
            if (!token) return false;

            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_ENDPOINT}/chathub`, {
                    accessTokenFactory: () => localStorage.getItem("token"),
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
                    skipNegotiation: false
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Warning)
                .build();

            this.setupEventHandlers();
            await this.connection.start();
            this.isConnected = true;
            return true;
        } catch (error)
        {
            console.error("SignalR Connection failed:", error);
            this.isConnected = false;
            return false;
        }
    }

    async initializeConnection()
    {
        if (this.isConnected && this.connection && this.connection.state === signalR.HubConnectionState.Connected)
        {
            this.joinAdminsGroupIfAdmin();
            return true;
        }

        if (this.connection && this.connection.state === signalR.HubConnectionState.Connecting)
        {
            try
            {
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Connection timeout')), 10000)
                );
                await Promise.race([
                    new Promise(resolve =>
                    {
                        const checkConnection = () =>
                        {
                            if (this.connection.state === signalR.HubConnectionState.Connected)
                            {
                                this.isConnected = true;
                                resolve(true);
                            } else
                            {
                                setTimeout(checkConnection, 100);
                            }
                        };
                        checkConnection();
                    }),
                    timeout
                ]);
                return this.isConnected;
            } catch (error)
            {
                // Timeout, force restart
            }
        }

        if (this.connection)
        {
            try
            {
                await this.connection.stop();
            } catch (error)
            {
                // Silent
            }
            this.connection = null;
            this.isConnected = false;
        }

        const connected = await this.startConnection();
        if (connected)
        {
            await this.joinAdminsGroupIfAdmin();
        }
        return connected;
    }

    async disconnect()
    {
        try
        {
            if (this.connection)
            {
                await this.connection.stop();
                this.connection = null;
                this.isConnected = false;
            }
        } catch (error)
        {
            // Silent
        }
    }

    setupEventHandlers()
    {
        if (!this.connection) return;

        try
        {
            this.connection.off("ReceiveMessage");
            this.connection.off("UserTyping");
            this.connection.off("MessageRead");
            this.connection.off("UserOnline");
            this.connection.off("UserOffline");
            this.connection.off("AdminChatNotification");
        } catch (error)
        {
            // Silent
        }

        this.connection.on("ReceiveMessage", (message) =>
        {
            window.dispatchEvent(new CustomEvent("newMessage", { detail: message }));
        });

        this.connection.on("AdminChatNotification", (data) =>
        {
            window.dispatchEvent(new CustomEvent("adminChatNotification", { detail: data }));
        });

        this.connection.on("UserTyping", (data) =>
        {
            window.dispatchEvent(new CustomEvent("userTyping", { detail: data }));
        });

        this.connection.on("MessageRead", (data) =>
        {
            window.dispatchEvent(new CustomEvent("messageRead", { detail: data }));
        });

        this.connection.on("UserOnline", (userId) =>
        {
            window.dispatchEvent(new CustomEvent("userOnline", { detail: userId }));
        });

        this.connection.on("UserOffline", (userId) =>
        {
            window.dispatchEvent(new CustomEvent("userOffline", { detail: userId }));
        });

        this.connection.onreconnecting(() =>
        {
            this.isConnected = false;
        });

        this.connection.onreconnected(() =>
        {
            this.isConnected = true;
        });

        this.connection.onclose(() =>
        {
            this.isConnected = false;
        });
    }

    async joinChat(chatId)
    {
        try
        {
            if (this.connection && this.isConnected)
            {
                await this.connection.invoke("JoinChat", chatId);
                return true;
            }
            return false;
        } catch (error)
        {
            return false;
        }
    }

    async leaveChat(chatId)
    {
        try
        {
            if (this.connection && this.isConnected)
            {
                await this.connection.invoke("LeaveChat", chatId);
                return true;
            }
        } catch (error)
        {
            return false;
        }
    }

    async sendMessageViaSignalR(chatId, message)
    {
        if (this.connection && this.isConnected)
        {
            await this.connection.invoke("SendMessage", chatId, message);
        }
    }

    async sendMessage(chatId, content, type = 1)
    {
        const result = await this.sendMessageApi(chatId, content, type);
        return result;
    }

    async userTyping(chatId, isTyping)
    {
        if (this.connection && this.isConnected)
        {
            await this.connection.invoke("UserTyping", chatId, isTyping);
        }
    }

    async markAsRead(chatId, messageId)
    {
        if (this.connection && this.isConnected)
        {
            await this.connection.invoke("MarkAsRead", chatId, messageId);
        }
    }

    // Event listeners
    onReceiveMessage(callback)
    {
        if (this.connection)
        {
            this.connection.off("ReceiveMessage", callback);
            this.connection.on("ReceiveMessage", callback);
        }
    }

    onUserTyping(callback)
    {
        if (this.connection)
        {
            this.connection.off("UserTyping", callback);
            this.connection.on("UserTyping", callback);
        }
    }

    onMessageRead(callback)
    {
        if (this.connection)
        {
            this.connection.off("MessageRead", callback);
            this.connection.on("MessageRead", callback);
        }
    }

    onUserOnline(callback)
    {
        if (this.connection)
        {
            this.connection.off("UserOnline", callback);
            this.connection.on("UserOnline", callback);
        }
    }

    onUserOffline(callback)
    {
        if (this.connection)
        {
            this.connection.off("UserOffline", callback);
            this.connection.on("UserOffline", callback);
        }
    }

    onNewChatCreated(callback)
    {
        if (this.connection)
        {
            this.connection.off("NewChatCreated", callback);
            this.connection.on("NewChatCreated", callback);
        }
    }

    onChatStatusUpdated(callback)
    {
        if (this.connection)
        {
            this.connection.off("ChatStatusUpdated", callback);
            this.connection.on("ChatStatusUpdated", callback);
        }
    }

    onChatClosed(callback)
    {
        if (this.connection)
        {
            this.connection.off("ChatClosed", callback);
            this.connection.on("ChatClosed", callback);
        }
    }

    // API calls
    async createChat(subject, priority = 2)
    {
        const response = await axiosInstance.post("/api/Chat/create", { subject, priority });
        return response.data;
    }

    async getMyChats()
    {
        const response = await axiosInstance.get("/api/Chat/my-chats");
        return response.data;
    }

    async getUserChats()
    {
        return await this.getMyChats();
    }

    async getAllChats()
    {
        const response = await axiosInstance.get("/api/Chat/all");
        return response.data;
    }

    async getChat(chatId)
    {
        const response = await axiosInstance.get(`/api/Chat/${chatId}`);
        return response.data;
    }

    async sendMessageApi(chatId, content, type = 1)
    {
        const response = await axiosInstance.post(`/api/Chat/${chatId}/messages`, { content, type });
        return response.data;
    }

    async getChatMessages(chatId)
    {
        const response = await axiosInstance.get(`/api/Chat/${chatId}/messages`);
        return response.data;
    }

    async assignChat(chatId, adminId)
    {
        const response = await axiosInstance.post(`/api/Chat/${chatId}/assign`, { adminId });
        return response.data;
    }

    async updateChatStatus(chatId, status)
    {
        const response = await axiosInstance.put(`/api/Chat/${chatId}/status`, { status });
        return response.data;
    }

    async closeChat(chatId)
    {
        const response = await axiosInstance.post(`/api/Chat/${chatId}/close`, {});
        return response.data;
    }

    async getUnreadCount()
    {
        const response = await axiosInstance.get("/api/Chat/unread-count");
        return response.data;
    }

    async getChatStatistics()
    {
        const response = await axiosInstance.get("/api/Chat/statistics");
        return response.data;
    }

    // Join group 'admins' để nhận notification toàn hệ thống
    async joinAdminsGroup()
    {
        try
        {
            if (this.connection && this.isConnected)
            {
                await this.connection.invoke("JoinAdminsGroup");
                return true;
            }
            return false;
        } catch (error)
        {
            return false;
        }
    }

    async leaveAdminsGroup()
    {
        try
        {
            if (this.connection && this.isConnected)
            {
                await this.connection.invoke("LeaveAdminsGroup");
                return true;
            }
        } catch (error)
        {
            return false;
        }
    }

    async joinAdminsGroupIfAdmin()
    {
        try
        {
            const token = localStorage.getItem('token');
            if (!token) return false;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role
                || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                || '';

            if (role === 'Administrator' || role === 'Admin')
            {
                await this.joinAdminsGroup();
                return true;
            }
            return false;
        } catch (e)
        {
            return false;
        }
    }
}

const chatServiceInstance = new ChatService();

export default chatServiceInstance;