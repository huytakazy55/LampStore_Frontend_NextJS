import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Hỗ trợ khách hàng',
    description: 'Tìm hiểu thông tin về CapyLumine, hướng dẫn mua sắm, chính sách bảo hành, vận chuyển và đổi trả.',
};

export default function HoTroPage() {
    redirect('/ho-tro/gioi-thieu');
}
