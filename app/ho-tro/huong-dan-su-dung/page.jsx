export const metadata = {
    title: 'Hướng dẫn sử dụng',
    description: 'Hướng dẫn sử dụng và bảo quản đèn trang trí CapyLumine đúng cách để đèn bền đẹp lâu dài.',
};

export default function HuongDanSuDungPage() {
    return (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <i className='bx bx-book-open text-amber-600 dark:text-amber-400 text-xl' />
                </span>
                Hướng dẫn sử dụng
            </h2>
            <p className="text-gray-400 text-sm mb-8">Cập nhật lần cuối: 29/04/2025</p>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-800/40 not-prose">
                <div className="flex items-start gap-3">
                    <i className='bx bx-bulb text-blue-600 dark:text-blue-400 text-2xl mt-0.5' />
                    <div>
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Lưu ý quan trọng</h4>
                        <p className="text-blue-700 dark:text-blue-400 text-sm leading-relaxed">Vui lòng đọc kỹ hướng dẫn sử dụng trước khi sử dụng sản phẩm để đảm bảo an toàn và kéo dài tuổi thọ đèn.</p>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">1. Mở hộp & lắp đặt</h3>
            <div className="not-prose space-y-3 mb-6">
                {[
                    'Mở hộp cẩn thận, kiểm tra sản phẩm và phụ kiện đầy đủ theo phiếu đóng gói.',
                    'Đặt đèn trên bề mặt phẳng, ổn định, tránh đặt ở nơi ẩm ướt hoặc gần nguồn nước.',
                    'Cắm nguồn điện (adapter/USB) phù hợp với thông số kỹ thuật ghi trên sản phẩm.',
                    'Bật đèn bằng nút nguồn hoặc cảm ứng (tùy loại đèn).',
                ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{step}</p>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">2. Các chế độ ánh sáng</h3>
            <div className="overflow-x-auto not-prose mb-6">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-amber-50 dark:bg-amber-950/30">
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Chế độ</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Mô tả</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Phù hợp</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">💡 Ánh sáng vàng ấm</td><td className="p-3">Tông màu 2700K-3000K, dịu mắt</td><td className="p-3">Phòng ngủ, thư giãn</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">⚡ Ánh sáng trắng</td><td className="p-3">Tông màu 5000K-6500K, sáng rõ</td><td className="p-3">Đọc sách, làm việc</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">🌈 Ánh sáng RGB</td><td className="p-3">Đổi màu liên tục hoặc chọn màu cố định</td><td className="p-3">Trang trí, không gian sáng tạo</td></tr>
                        <tr><td className="p-3">🌙 Chế độ ngủ</td><td className="p-3">Ánh sáng giảm dần, hẹn giờ tắt</td><td className="p-3">Giấc ngủ, ru bé</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">3. Bảo quản đèn đúng cách</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
                {[
                    { icon: 'bx-droplet', title: 'Tránh nước', desc: 'Không để đèn tiếp xúc trực tiếp với nước hoặc đặt ở nơi ẩm ướt' },
                    { icon: 'bx-sun', title: 'Tránh nắng trực tiếp', desc: 'Không phơi đèn dưới ánh nắng mặt trời trực tiếp lâu dài' },
                    { icon: 'bx-brush', title: 'Vệ sinh nhẹ nhàng', desc: 'Dùng khăn mềm, khô lau bụi. Không dùng hóa chất mạnh' },
                    { icon: 'bx-plug', title: 'Nguồn điện ổn định', desc: 'Sử dụng adapter chính hãng, tránh cắm nguồn không ổn định' },
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center shrink-0">
                            <i className={`bx ${item.icon} text-amber-600 dark:text-amber-400`} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{item.title}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">4. Câu hỏi thường gặp</h3>
            <div className="not-prose space-y-3">
                {[
                    { q: 'Đèn có thể điều chỉnh độ sáng không?', a: 'Hầu hết các mẫu đèn CapyLumine đều hỗ trợ điều chỉnh độ sáng bằng nút bấm hoặc cảm ứng. Một số mẫu cao cấp hỗ trợ điều khiển qua remote.' },
                    { q: 'Đèn dùng nguồn điện gì?', a: 'Đèn sử dụng nguồn USB 5V hoặc adapter 12V (tùy mẫu). Thông tin chi tiết được ghi trên bao bì sản phẩm.' },
                    { q: 'Bóng LED có thay được không?', a: 'Đèn LED CapyLumine có tuổi thọ lên đến 50.000 giờ nên hiếm khi cần thay thế. Nếu cần, vui lòng liên hệ CSKH.' },
                ].map((faq, i) => (
                    <details key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 group">
                        <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center justify-between hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                            {faq.q}
                            <i className='bx bx-chevron-down text-lg transition-transform group-open:rotate-180' />
                        </summary>
                        <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</div>
                    </details>
                ))}
            </div>
        </article>
    );
}
