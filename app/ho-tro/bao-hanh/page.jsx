export const metadata = {
    title: 'Chính sách bảo hành sản phẩm',
    description: 'Chính sách bảo hành sản phẩm đèn trang trí CapyLumine - Cam kết chất lượng, hỗ trợ nhanh chóng.',
};

export default function BaoHanhPage() {
    return (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <i className='bx bx-shield-quarter text-amber-600 dark:text-amber-400 text-xl' />
                </span>
                Bảo hành sản phẩm
            </h2>
            <p className="text-gray-400 text-sm mb-8">Cập nhật lần cuối: 29/04/2025</p>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 mb-8 border border-emerald-100 dark:border-emerald-800/40 not-prose">
                <div className="flex items-start gap-3">
                    <i className='bx bx-shield-quarter text-emerald-600 dark:text-emerald-400 text-2xl mt-0.5' />
                    <div>
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Cam kết bảo hành</h4>
                        <p className="text-emerald-700 dark:text-emerald-400 text-sm leading-relaxed">CapyLumine cam kết bảo hành chính hãng cho tất cả sản phẩm. Mọi lỗi do nhà sản xuất sẽ được xử lý nhanh chóng và miễn phí.</p>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">⏰ Thời gian bảo hành</h3>
            <div className="overflow-x-auto not-prose mb-6">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-amber-50 dark:bg-amber-950/30">
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Loại sản phẩm</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Thời gian bảo hành</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Đèn ngủ thú, đèn 3D</td><td className="p-3 font-medium text-amber-600 dark:text-amber-400">6 tháng</td><td className="p-3">Bảo hành bóng LED và mạch điện</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Đèn khung gỗ, đèn thủy tinh</td><td className="p-3 font-medium text-amber-600 dark:text-amber-400">12 tháng</td><td className="p-3">Bảo hành mạch điện, không bảo hành vỡ</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Đèn LED dây, đèn neon</td><td className="p-3 font-medium text-amber-600 dark:text-amber-400">3 tháng</td><td className="p-3">Bảo hành lỗi LED, adapter</td></tr>
                        <tr><td className="p-3">Phụ kiện (adapter, remote)</td><td className="p-3 font-medium text-amber-600 dark:text-amber-400">1 tháng</td><td className="p-3">Đổi mới nếu lỗi từ NSX</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">✅ Điều kiện được bảo hành</h3>
            <div className="not-prose space-y-2 mb-6">
                {[
                    'Sản phẩm còn trong thời hạn bảo hành',
                    'Lỗi phát sinh do nhà sản xuất (LED lỗi, mạch hỏng, adapter không hoạt động)',
                    'Sản phẩm chưa bị tác động ngoại lực, ngấm nước hoặc sửa chữa bởi bên thứ ba',
                    'Có đầy đủ thông tin đơn hàng (mã đơn, số điện thoại đặt hàng)',
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/40">
                        <i className='bx bx-check-circle text-emerald-600 dark:text-emerald-400 text-lg shrink-0' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">❌ Trường hợp KHÔNG được bảo hành</h3>
            <div className="not-prose space-y-2 mb-6">
                {[
                    'Hết thời hạn bảo hành',
                    'Sản phẩm bị hư hỏng do sử dụng sai cách, va đập, rơi vỡ',
                    'Sản phẩm bị ngấm nước, cháy do nguồn điện không ổn định',
                    'Sản phẩm đã được sửa chữa hoặc thay đổi bởi bên thứ ba',
                    'Hao mòn tự nhiên theo thời gian (phai màu nhẹ, xước nhẹ bề mặt)',
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-800/40">
                        <i className='bx bx-x-circle text-red-500 dark:text-red-400 text-lg shrink-0' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">📞 Quy trình bảo hành</h3>
            <div className="not-prose space-y-3">
                {[
                    { title: 'Liên hệ CSKH', desc: 'Gọi hotline (+84) 969 608 810 hoặc nhắn tin qua Fanpage, cung cấp mã đơn hàng và mô tả lỗi.' },
                    { title: 'Gửi hình ảnh/video', desc: 'Chụp ảnh hoặc quay video lỗi sản phẩm gửi cho CSKH để xác nhận.' },
                    { title: 'Xác nhận bảo hành', desc: 'CSKH xác nhận đủ điều kiện bảo hành và hướng dẫn gửi trả sản phẩm (nếu cần).' },
                    { title: 'Xử lý', desc: 'Sản phẩm sẽ được sửa chữa hoặc đổi mới trong vòng 3-7 ngày làm việc kể từ khi nhận được hàng.' },
                ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{step.title}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mt-0.5">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}
