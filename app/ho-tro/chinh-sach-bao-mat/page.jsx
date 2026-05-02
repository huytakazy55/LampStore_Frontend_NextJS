export const metadata = {
    title: 'Chính sách bảo mật - CapyLumine',
    description: 'Chính sách bảo mật tại CapyLumine.com - Cam kết bảo vệ thông tin cá nhân của khách hàng.',
};

const sections = [
    {
        title: '📋 1. Thông tin chúng tôi thu thập',
        desc: 'Khi sử dụng dịch vụ của CapyLumine, chúng tôi có thể thu thập các loại thông tin sau:',
        items: [
            { label: 'Thông tin cá nhân', text: 'Họ tên, email, số điện thoại, địa chỉ giao hàng khi bạn đăng ký tài khoản hoặc đặt hàng.' },
            { label: 'Thông tin đơn hàng', text: 'Lịch sử mua hàng, sản phẩm yêu thích, giỏ hàng và phương thức thanh toán.' },
            { label: 'Thông tin kỹ thuật', text: 'Địa chỉ IP, loại trình duyệt, thiết bị sử dụng, hệ điều hành và thời gian truy cập.' },
            { label: 'Cookie', text: 'Dữ liệu cookie để cải thiện trải nghiệm duyệt web và ghi nhớ tùy chọn của bạn.' },
        ],
        color: 'blue',
        icon: 'bx-data',
    },
    {
        title: '🎯 2. Mục đích sử dụng thông tin',
        desc: 'Thông tin thu thập được sử dụng cho các mục đích sau:',
        items: [
            { text: 'Xử lý đơn hàng, giao hàng và cung cấp dịch vụ khách hàng.' },
            { text: 'Gửi thông báo về tình trạng đơn hàng, khuyến mãi và cập nhật sản phẩm mới.' },
            { text: 'Cải thiện chất lượng Website, sản phẩm và dịch vụ khách hàng.' },
            { text: 'Phân tích xu hướng sử dụng để tối ưu hóa trải nghiệm người dùng.' },
            { text: 'Phát hiện và ngăn chặn gian lận, bảo vệ an ninh tài khoản.' },
        ],
        color: 'emerald',
        icon: 'bx-target-lock',
    },
    {
        title: '🔒 3. Bảo vệ thông tin',
        desc: 'CapyLumine cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp:',
        items: [
            { text: 'Sử dụng mã hóa SSL/TLS cho tất cả các giao dịch và truyền tải dữ liệu.' },
            { text: 'Mật khẩu được mã hóa (hash) và không bao giờ được lưu trữ dưới dạng văn bản thuần.' },
            { text: 'Hạn chế quyền truy cập dữ liệu chỉ cho nhân viên được ủy quyền.' },
            { text: 'Thường xuyên kiểm tra và cập nhật hệ thống bảo mật.' },
            { text: 'Sao lưu dữ liệu định kỳ để đảm bảo an toàn trong trường hợp sự cố.' },
        ],
        color: 'purple',
        icon: 'bx-shield-quarter',
    },
];

const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border border-blue-100 dark:border-blue-800/40', icon: 'text-blue-600 dark:text-blue-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border border-emerald-100 dark:border-emerald-800/40', icon: 'text-emerald-600 dark:text-emerald-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border border-purple-100 dark:border-purple-800/40', icon: 'text-purple-600 dark:text-purple-400' },
};

export default function ChinhSachBaoMatPage() {
    return (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <i className='bx bx-shield text-amber-600 dark:text-amber-400 text-xl' />
                </span>
                Chính sách bảo mật
            </h2>
            <p className="text-gray-400 text-sm mb-8">Cập nhật lần cuối: 01/05/2025</p>

            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 mb-8 border border-amber-100 dark:border-amber-800/40 not-prose">
                <div className="flex items-start gap-3">
                    <i className='bx bx-lock-alt text-amber-600 dark:text-amber-400 text-2xl mt-0.5' />
                    <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">Cam kết bảo mật</h4>
                        <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed"><strong>CapyLumine</strong> cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, bảo vệ và chia sẻ thông tin của bạn.</p>
                    </div>
                </div>
            </div>

            {sections.map((section, si) => {
                const c = colorMap[section.color];
                return (
                    <div key={si}>
                        <h3 className="text-xl font-bold mt-8 mb-3">{section.title}</h3>
                        {section.desc && <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{section.desc}</p>}
                        <div className="not-prose space-y-2 mb-6">
                            {section.items.map((item, i) => (
                                <div key={i} className={`flex items-start gap-3 p-3 ${c.bg} ${c.border} rounded-lg`}>
                                    <i className={`bx ${section.icon} ${c.icon} text-lg shrink-0 mt-0.5`} />
                                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                                        {item.label && <strong>{item.label}: </strong>}{item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <h3 className="text-xl font-bold mt-8 mb-4">🤝 4. Chia sẻ thông tin với bên thứ ba</h3>
            <div className="not-prose p-5 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">CapyLumine <strong>không bán, cho thuê hoặc trao đổi</strong> thông tin cá nhân của bạn với bên thứ ba, ngoại trừ các trường hợp:</p>
                <div className="space-y-2">
                    {[
                        'Đối tác vận chuyển — để giao hàng đến địa chỉ của bạn.',
                        'Cổng thanh toán — để xử lý giao dịch thanh toán an toàn.',
                        'Yêu cầu pháp luật — khi có yêu cầu từ cơ quan nhà nước có thẩm quyền.',
                        'Bảo vệ quyền lợi — khi cần thiết để bảo vệ quyền, tài sản hoặc an toàn.',
                    ].map((text, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <i className='bx bx-chevron-right text-amber-500 shrink-0 mt-0.5' />
                            <span className="text-gray-600 dark:text-gray-400 text-sm">{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">🍪 5. Cookie và công nghệ theo dõi</h3>
            <div className="overflow-x-auto not-prose mb-6">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-amber-50 dark:bg-amber-950/30">
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Loại Cookie</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Mục đích</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Thời hạn</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Thiết yếu</td><td className="p-3">Đăng nhập, giỏ hàng, bảo mật</td><td className="p-3">Phiên làm việc</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Chức năng</td><td className="p-3">Ghi nhớ tùy chọn, ngôn ngữ</td><td className="p-3">30 ngày</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Phân tích</td><td className="p-3">Thống kê truy cập, hành vi</td><td className="p-3">1 năm</td></tr>
                        <tr><td className="p-3">Quảng cáo</td><td className="p-3">Hiển thị quảng cáo phù hợp</td><td className="p-3">90 ngày</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">👤 6. Quyền của người dùng</h3>
            <div className="not-prose space-y-2 mb-6">
                {[
                    'Truy cập và xem thông tin cá nhân đã cung cấp cho CapyLumine.',
                    'Yêu cầu chỉnh sửa hoặc cập nhật thông tin cá nhân không chính xác.',
                    'Yêu cầu xóa tài khoản và dữ liệu cá nhân (trừ dữ liệu cần thiết theo quy định pháp luật).',
                    'Từ chối nhận email marketing bất cứ lúc nào bằng cách nhấn "Hủy đăng ký" trong email.',
                    'Tắt cookie trong cài đặt trình duyệt (có thể ảnh hưởng đến trải nghiệm sử dụng).',
                ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/40">
                        <i className='bx bx-check-circle text-emerald-600 dark:text-emerald-400 text-lg shrink-0 mt-0.5' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">🔄 7. Thay đổi chính sách</h3>
            <div className="not-prose p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    CapyLumine có quyền cập nhật Chính sách bảo mật này bất cứ lúc nào. Mọi thay đổi sẽ được thông báo trên Website. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận chính sách mới.
                </p>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">📞 8. Liên hệ</h3>
            <div className="not-prose bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/40">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    Nếu bạn có câu hỏi về Chính sách bảo mật hoặc muốn thực hiện quyền liên quan đến dữ liệu cá nhân:
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
