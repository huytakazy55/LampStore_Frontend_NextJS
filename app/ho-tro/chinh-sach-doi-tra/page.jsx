export const metadata = {
    title: 'Chính sách đổi trả',
    description: 'Chính sách đổi trả sản phẩm tại CapyLumine - Đổi trả miễn phí trong 15 ngày đầu tiên.',
};

export default function ChinhSachDoiTraPage() {
    return (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <i className='bx bx-transfer text-amber-600 dark:text-amber-400 text-xl' />
                </span>
                Chính sách đổi trả
            </h2>
            <p className="text-gray-400 text-sm mb-8">Cập nhật lần cuối: 29/04/2025</p>

            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 mb-8 border border-amber-100 dark:border-amber-800/40 not-prose">
                <div className="flex items-start gap-3">
                    <i className='bx bx-badge-check text-amber-600 dark:text-amber-400 text-2xl mt-0.5' />
                    <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">Đổi trả miễn phí 15 ngày</h4>
                        <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">CapyLumine cam kết đổi trả <strong>miễn phí trong 15 ngày</strong> kể từ ngày nhận hàng nếu sản phẩm gặp lỗi từ nhà sản xuất. Hoàn tiền 100% hoặc đổi sản phẩm mới.</p>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">✅ Điều kiện đổi trả</h3>
            <div className="not-prose space-y-2 mb-6">
                {[
                    'Sản phẩm còn trong thời hạn 15 ngày kể từ ngày nhận hàng',
                    'Sản phẩm bị lỗi từ nhà sản xuất (LED không sáng, mạch lỗi, sai màu, sai mẫu)',
                    'Sản phẩm giao sai so với đơn đặt hàng (sai loại, sai số lượng)',
                    'Sản phẩm bị hư hỏng trong quá trình vận chuyển',
                    'Sản phẩm còn nguyên tem, nhãn mác và bao bì (trừ trường hợp lỗi NSX)',
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/40">
                        <i className='bx bx-check-circle text-emerald-600 dark:text-emerald-400 text-lg shrink-0' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">❌ Trường hợp KHÔNG được đổi trả</h3>
            <div className="not-prose space-y-2 mb-6">
                {[
                    'Quá 15 ngày kể từ ngày nhận hàng',
                    'Sản phẩm bị hư hỏng do khách hàng sử dụng sai cách',
                    'Sản phẩm đã qua sử dụng, có dấu hiệu hao mòn, trầy xước do khách hàng',
                    'Không muốn mua nữa / thay đổi ý kiến (không phải lỗi sản phẩm)',
                    'Sản phẩm mua trong các chương trình khuyến mãi đặc biệt (Sale, Flash Deal)',
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-800/40">
                        <i className='bx bx-x-circle text-red-500 dark:text-red-400 text-lg shrink-0' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">🔄 Quy trình đổi trả</h3>
            <div className="not-prose space-y-3 mb-6">
                {[
                    { title: 'Gửi yêu cầu', desc: 'Liên hệ CSKH qua hotline (+84) 969 608 810 hoặc inbox Fanpage. Cung cấp mã đơn hàng, mô tả lỗi và kèm ảnh/video.' },
                    { title: 'Xác nhận đổi trả', desc: 'CSKH xem xét và xác nhận yêu cầu trong vòng 24h. Hướng dẫn gửi trả sản phẩm (nếu cần).' },
                    { title: 'Gửi trả sản phẩm', desc: 'Đóng gói sản phẩm cẩn thận và gửi về địa chỉ kho CapyLumine. Phí ship do CapyLumine chi trả nếu lỗi từ NSX.' },
                    { title: 'Nhận hàng mới / hoàn tiền', desc: 'Sản phẩm mới được gửi lại trong 2-3 ngày làm việc, hoặc hoàn tiền vào tài khoản trong vòng 5-7 ngày.' },
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

            <h3 className="text-xl font-bold mt-8 mb-4">💰 Chính sách hoàn tiền</h3>
            <div className="overflow-x-auto not-prose">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-amber-50 dark:bg-amber-950/30">
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Phương thức thanh toán</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Hình thức hoàn tiền</th>
                            <th className="text-left p-3 font-semibold text-gray-800 dark:text-gray-100 border-b border-amber-100 dark:border-amber-800/40">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">COD</td><td className="p-3">Chuyển khoản ngân hàng</td><td className="p-3">5-7 ngày làm việc</td></tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800"><td className="p-3">Chuyển khoản</td><td className="p-3">Hoàn vào tài khoản gốc</td><td className="p-3">3-5 ngày làm việc</td></tr>
                        <tr><td className="p-3">Ví điện tử</td><td className="p-3">Hoàn vào ví</td><td className="p-3">1-3 ngày làm việc</td></tr>
                    </tbody>
                </table>
            </div>
        </article>
    );
}
