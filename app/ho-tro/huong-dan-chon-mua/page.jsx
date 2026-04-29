export const metadata = {
    title: 'Hướng dẫn chọn mua đèn',
    description: 'Hướng dẫn chi tiết cách chọn mua đèn trang trí phù hợp với nhu cầu và không gian của bạn.',
};

export default function HuongDanChonMuaPage() {
    return (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <i className='bx bx-cart text-amber-600 dark:text-amber-400 text-xl' />
                </span>
                Hướng dẫn chọn mua
            </h2>
            <p className="text-gray-400 text-sm mb-8">Cập nhật lần cuối: 29/04/2025</p>

            <h3 className="text-xl font-bold mt-8 mb-4">🏠 Bước 1: Xác định không gian sử dụng</h3>
            <p className="dark:text-gray-300">Mỗi không gian có nhu cầu chiếu sáng khác nhau. Hãy xác định bạn cần đèn cho:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose mb-6">
                {[
                    { icon: 'bx-bed', title: 'Phòng ngủ', desc: 'Đèn ngủ ánh sáng dịu, tông vàng ấm, có hẹn giờ tắt', recommend: 'Đèn ngủ thú, đèn 3D' },
                    { icon: 'bx-book-reader', title: 'Bàn học/làm việc', desc: 'Đèn sáng đều, chống chói, bảo vệ mắt', recommend: 'Đèn bàn LED, đèn kẹp' },
                    { icon: 'bx-home-heart', title: 'Trang trí', desc: 'Đèn LED dây, đèn neon, đèn anime nghệ thuật', recommend: 'Đèn LED, đèn neon uốn' },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center mb-3">
                            <i className={`bx ${item.icon} text-amber-600 dark:text-amber-400 text-xl`} />
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">{item.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-2">{item.desc}</p>
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">→ {item.recommend}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">💰 Bước 2: Xác định ngân sách</h3>
            <div className="overflow-x-auto not-prose mb-6">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-amber-50 dark:bg-amber-950/30">
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Phân khúc</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Mức giá</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Đặc điểm</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3 font-medium">Phổ thông</td><td className="p-3">100.000đ - 300.000đ</td><td className="p-3">Đèn ngủ mini, đèn cảm biến, đèn LED dây cơ bản</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3 font-medium">Trung cấp</td><td className="p-3">300.000đ - 700.000đ</td><td className="p-3">Đèn 3D, đèn thú lớn, đèn khung gỗ, đèn anime</td></tr>
                        <tr><td className="p-3 font-medium">Cao cấp</td><td className="p-3">700.000đ - 2.000.000đ</td><td className="p-3">Đèn thủy tinh nghệ thuật, đèn custom, đèn bộ sưu tập giới hạn</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">✅ Bước 3: Kiểm tra trước khi mua</h3>
            <div className="not-prose space-y-2 mb-6">
                {[
                    'Đọc mô tả sản phẩm kỹ: kích thước, chất liệu, nguồn điện',
                    'Xem ảnh thực tế và video review (nếu có)',
                    'Kiểm tra đánh giá từ khách hàng đã mua',
                    'Xác nhận chính sách bảo hành và đổi trả',
                    'Liên hệ CSKH nếu cần tư vấn thêm',
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/40">
                        <i className='bx bx-check-circle text-emerald-600 dark:text-emerald-400 text-lg' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">🛒 Bước 4: Đặt hàng</h3>
            <div className="not-prose space-y-3 mb-6">
                {[
                    'Chọn sản phẩm yêu thích và nhấn "Thêm vào giỏ hàng".',
                    'Vào giỏ hàng, kiểm tra lại số lượng và thông tin sản phẩm.',
                    'Nhập thông tin giao hàng: họ tên, số điện thoại, địa chỉ.',
                    'Chọn phương thức thanh toán (COD hoặc chuyển khoản).',
                    'Xác nhận đơn hàng. Bạn sẽ nhận được SMS/email xác nhận.',
                ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{step}</p>
                    </div>
                ))}
            </div>
        </article>
    );
}
