export const metadata = {
    title: 'Điều khoản sử dụng - CapyLumine',
    description: 'Điều khoản sử dụng dịch vụ tại CapyLumine.com',
};

const sections = [
    {
        title: '📋 1. Định nghĩa và phạm vi áp dụng',
        items: [
            { text: '"Website" là trang thương mại điện tử CapyLumine.com, bao gồm tất cả các trang con, tính năng và dịch vụ liên quan.' },
            { text: '"Người dùng" là bất kỳ cá nhân hoặc tổ chức nào truy cập, đăng ký tài khoản hoặc sử dụng dịch vụ trên Website.' },
            { text: '"Sản phẩm" là các mặt hàng đèn ngủ 3D tráng gương và phụ kiện liên quan được bày bán trên Website.' },
        ],
        color: 'gray',
    },
    {
        title: '👤 2. Tài khoản người dùng',
        items: [
            { text: 'Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký tài khoản.' },
            { text: 'Bạn có trách nhiệm bảo mật thông tin đăng nhập và chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của mình.' },
            { text: 'Mỗi người dùng chỉ được phép sở hữu một (01) tài khoản.' },
            { text: 'CapyLumine có quyền tạm khóa hoặc xóa tài khoản nếu phát hiện hành vi vi phạm điều khoản.' },
            { text: 'Bạn phải từ 18 tuổi trở lên hoặc có sự đồng ý của phụ huynh/người giám hộ để tạo tài khoản.' },
        ],
        color: 'blue',
        icon: 'bx-user-check',
    },
    {
        title: '🛒 3. Quy định đặt hàng và thanh toán',
        items: [
            { text: 'Tất cả đơn hàng phải được xác nhận bởi CapyLumine trước khi được xử lý.' },
            { text: 'Giá sản phẩm có thể thay đổi mà không cần thông báo trước. Giá áp dụng là giá tại thời điểm đặt hàng.' },
            { text: 'CapyLumine hỗ trợ thanh toán COD, chuyển khoản ngân hàng và ví điện tử.' },
            { text: 'CapyLumine có quyền từ chối hoặc hủy đơn hàng nếu phát hiện thông tin không chính xác hoặc gian lận.' },
            { text: 'Phí vận chuyển được tính dựa trên địa chỉ nhận hàng và sẽ được hiển thị rõ ràng trước khi thanh toán.' },
        ],
        color: 'emerald',
        icon: 'bx-check-circle',
    },
    {
        title: '🔒 4. Quyền sở hữu trí tuệ',
        items: [
            { text: 'Toàn bộ nội dung trên Website (hình ảnh, văn bản, logo, thiết kế) thuộc quyền sở hữu của CapyLumine.' },
            { text: 'Nghiêm cấm sao chép, tái sản xuất, phân phối hoặc sử dụng nội dung mà không có sự cho phép bằng văn bản.' },
            { text: 'Không được sử dụng thương hiệu, logo của CapyLumine cho bất kỳ mục đích nào mà chưa được ủy quyền.' },
        ],
        color: 'purple',
        icon: 'bx-lock',
    },
    {
        title: '⚠️ 5. Hành vi bị cấm',
        items: [
            { text: 'Sử dụng Website cho mục đích bất hợp pháp hoặc trái đạo đức.' },
            { text: 'Cố ý phá hoại, tấn công hoặc can thiệp vào hoạt động bình thường của Website.' },
            { text: 'Đăng tải nội dung vi phạm pháp luật, xúc phạm, quấy rối hoặc phân biệt đối xử.' },
            { text: 'Sử dụng bot, script hoặc công cụ tự động để thu thập dữ liệu mà chưa được phép.' },
            { text: 'Mạo danh người khác hoặc cung cấp thông tin sai lệch khi sử dụng dịch vụ.' },
        ],
        color: 'red',
        icon: 'bx-x-circle',
    },
];

const colorMap = {
    gray: { bg: 'bg-gray-50 dark:bg-gray-800', border: '', icon: 'text-gray-500 dark:text-gray-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border border-blue-100 dark:border-blue-800/40', icon: 'text-blue-600 dark:text-blue-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border border-emerald-100 dark:border-emerald-800/40', icon: 'text-emerald-600 dark:text-emerald-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border border-purple-100 dark:border-purple-800/40', icon: 'text-purple-600 dark:text-purple-400' },
    red: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border border-red-100 dark:border-red-800/40', icon: 'text-red-500 dark:text-red-400' },
};

export default function DieuKhoanSuDungPage() {
    return (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <i className='bx bx-file text-amber-600 dark:text-amber-400 text-xl' />
                </span>
                Điều khoản sử dụng
            </h2>
            <p className="text-gray-400 text-sm mb-8">Cập nhật lần cuối: 01/05/2025</p>

            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 mb-8 border border-amber-100 dark:border-amber-800/40 not-prose">
                <div className="flex items-start gap-3">
                    <i className='bx bx-info-circle text-amber-600 dark:text-amber-400 text-2xl mt-0.5' />
                    <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">Lưu ý quan trọng</h4>
                        <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">Bằng việc truy cập và sử dụng website <strong>CapyLumine.com</strong>, bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.</p>
                    </div>
                </div>
            </div>

            {sections.map((section, si) => {
                const c = colorMap[section.color];
                return (
                    <div key={si}>
                        <h3 className="text-xl font-bold mt-8 mb-4">{section.title}</h3>
                        <div className="not-prose space-y-2 mb-6">
                            {section.items.map((item, i) => (
                                <div key={i} className={`flex items-start gap-3 p-3 ${c.bg} ${c.border} rounded-lg`}>
                                    <i className={`bx ${section.icon || 'bx-right-arrow-alt'} ${c.icon} text-lg shrink-0 mt-0.5`} />
                                    <span className="text-gray-700 dark:text-gray-300 text-sm">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <h3 className="text-xl font-bold mt-8 mb-4">⚖️ 6. Giới hạn trách nhiệm</h3>
            <div className="not-prose space-y-2 mb-6">
                {[
                    'CapyLumine không chịu trách nhiệm cho thiệt hại gián tiếp, ngẫu nhiên phát sinh từ việc sử dụng Website.',
                    'CapyLumine không đảm bảo Website sẽ hoạt động liên tục, không có lỗi hoặc không bị gián đoạn.',
                    'Trách nhiệm bồi thường của CapyLumine không vượt quá giá trị đơn hàng gây ra tranh chấp.',
                ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-100 dark:border-yellow-800/40">
                        <i className='bx bx-shield text-yellow-600 dark:text-yellow-400 text-lg shrink-0 mt-0.5' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">🔄 7. Thay đổi điều khoản</h3>
            <div className="not-prose p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    CapyLumine có quyền sửa đổi, cập nhật các điều khoản sử dụng bất cứ lúc nào mà không cần thông báo trước. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên Website. Việc bạn tiếp tục sử dụng Website sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                </p>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">📞 8. Liên hệ</h3>
            <div className="not-prose bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/40">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng, vui lòng liên hệ:
                </p>
                <div className="space-y-2">
                    {[
                        { icon: 'bx-store', text: 'CapyLumine.com' },
                        { icon: 'bx-phone', text: '(+84) 969 608 810' },
                        { icon: 'bx-envelope', text: 'Khongthaydoi124@gmail.com' },
                        { icon: 'bx-map', text: 'A2 Vĩnh Hồ, Thịnh Quang, Đống Đa, Hà Nội' },
                    ].map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <i className={`bx ${c.icon} text-amber-600 dark:text-amber-400 text-lg`} />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{c.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
}
