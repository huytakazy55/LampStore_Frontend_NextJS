export const metadata = {
    title: 'Vận chuyển & Thanh toán',
    description: 'Thông tin chi tiết về phương thức vận chuyển, thời gian giao hàng và các hình thức thanh toán tại CapyLumine.',
};

export default function VanChuyenThanhToanPage() {
    return (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <i className='bx bx-package text-amber-600 dark:text-amber-400 text-xl' />
                </span>
                Vận chuyển & Thanh toán
            </h2>
            <p className="text-gray-400 text-sm mb-8">Cập nhật lần cuối: 29/04/2025</p>

            <h3 className="text-xl font-bold mt-8 mb-4">🚚 Chính sách vận chuyển</h3>
            <div className="overflow-x-auto not-prose mb-6">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-amber-50 dark:bg-amber-950/30">
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Khu vực</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Thời gian</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Phí ship</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Nội thành Hà Nội</td><td className="p-3">1-2 ngày</td><td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">Miễn phí</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Ngoại thành Hà Nội</td><td className="p-3">2-3 ngày</td><td className="p-3">15.000đ - 25.000đ</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Miền Bắc</td><td className="p-3">2-4 ngày</td><td className="p-3">25.000đ - 35.000đ</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Miền Trung</td><td className="p-3">3-5 ngày</td><td className="p-3">30.000đ - 40.000đ</td></tr>
                        <tr><td className="p-3">Miền Nam</td><td className="p-3">4-6 ngày</td><td className="p-3">35.000đ - 45.000đ</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 mb-8 border border-amber-100 dark:border-amber-800/40 not-prose">
                <div className="flex items-start gap-3">
                    <i className='bx bxs-truck text-amber-600 dark:text-amber-400 text-2xl mt-0.5' />
                    <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">Miễn phí vận chuyển</h4>
                        <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">Đơn hàng từ <strong>500.000đ</strong> trở lên được <strong>miễn phí vận chuyển</strong> toàn quốc! Áp dụng cho tất cả phương thức thanh toán.</p>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">📦 Đóng gói & bảo vệ</h3>
            <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { icon: 'bx-box', title: 'Hộp cứng chống sốc', desc: 'Sản phẩm được đặt trong hộp carton cứng, chống va đập' },
                    { icon: 'bx-layer', title: 'Lớp xốp bảo vệ', desc: 'Bọc xốp PE và túi bóng khí nhiều lớp bao quanh sản phẩm' },
                    { icon: 'bx-check-double', title: 'Kiểm tra trước gửi', desc: '100% sản phẩm được kiểm tra hoạt động trước khi đóng gói' },
                ].map((item, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center mb-3">
                            <i className={`bx ${item.icon} text-amber-600 dark:text-amber-400`} />
                        </div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{item.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">💳 Phương thức thanh toán</h3>
            <div className="not-prose space-y-3 mb-6">
                {[
                    { icon: 'bx-money', title: 'Thanh toán khi nhận hàng (COD)', desc: 'Nhận hàng kiểm tra trước, thanh toán tiền mặt cho shipper. Phổ biến nhất, áp dụng toàn quốc.', tag: 'Phổ biến' },
                    { icon: 'bx-credit-card', title: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản trước qua tài khoản ngân hàng. Đơn hàng được xử lý ngay sau khi nhận được thanh toán.', tag: null },
                    { icon: 'bx-wallet', title: 'Ví điện tử (Momo, ZaloPay)', desc: 'Thanh toán nhanh chóng qua ví điện tử. Quét mã QR trực tiếp trên trang thanh toán.', tag: 'Nhanh' },
                ].map((method, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center shrink-0">
                            <i className={`bx ${method.icon} text-amber-600 dark:text-amber-400 text-xl`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{method.title}</h4>
                                {method.tag && <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">{method.tag}</span>}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{method.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">🏦 Thông tin chuyển khoản</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 not-prose border border-gray-100 dark:border-gray-700 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Ngân hàng:</span> <span className="font-medium text-gray-800 dark:text-gray-100">Vietinbank</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Số tài khoản:</span> <span className="font-medium text-gray-800 dark:text-gray-100">104873037731</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Chi nhánh:</span> <span className="font-medium text-gray-800 dark:text-gray-100">Đống Đa</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Chủ TK:</span> <span className="font-medium text-gray-800 dark:text-gray-100">Lê Quang Huy</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Nội dung CK:</span> <span className="font-medium text-amber-600 dark:text-amber-400">[Mã đơn hàng] + [SĐT]</span></div>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 not-prose border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Ngân hàng:</span> <span className="font-medium text-gray-800 dark:text-gray-100">TPBank</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Số tài khoản:</span> <span className="font-medium text-gray-800 dark:text-gray-100">0969608810</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Chi nhánh:</span> <span className="font-medium text-gray-800 dark:text-gray-100">Đống Đa</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Chủ TK:</span> <span className="font-medium text-gray-800 dark:text-gray-100">Lê Quang Huy</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Nội dung CK:</span> <span className="font-medium text-amber-600 dark:text-amber-400">[Mã đơn hàng] + [SĐT]</span></div>
                </div>
            </div>
        </article>
    );
}
