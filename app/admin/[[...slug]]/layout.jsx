import AdminGuard from '@/components/admin/AdminGuard';

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }) {
    return <AdminGuard>{children}</AdminGuard>;
}
