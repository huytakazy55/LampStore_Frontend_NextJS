export const metadata = {
    title: 'Giới thiệu CapyLumine',
    description: 'Tìm hiểu về CapyLumine - Cửa hàng đèn trang trí cao cấp hàng đầu Việt Nam.',
};

export default function GioiThieuPage() {
    return (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-a:text-amber-600 dark:prose-a:text-amber-400">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <i className='bx bx-info-circle text-amber-600 dark:text-amber-400 text-xl' />
                </span>
                Giới thiệu về CapyLumine
            </h2>
            <p className="text-gray-400 text-sm mb-8">Cập nhật lần cuối: 29/04/2025</p>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 mb-8 border border-amber-100 dark:border-amber-800/40">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base m-0">
                    <strong className="text-amber-700 dark:text-amber-400">CapyLumine</strong> là thương hiệu đèn trang trí cao cấp hàng đầu Việt Nam,
                    chuyên cung cấp các sản phẩm đèn ngủ dễ thương, đèn bàn học, đèn LED nghệ thuật và đèn anime với thiết kế độc đáo,
                    chất lượng vượt trội.
                </p>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">📖 Câu chuyện thương hiệu</h3>
            <p className="dark:text-gray-300">
                CapyLumine được thành lập với sứ mệnh mang đến những sản phẩm đèn trang trí không chỉ đẹp mắt mà còn góp phần
                nâng cao chất lượng cuộc sống. Lấy cảm hứng từ vẻ đáng yêu của chú chuột lang nước Capybara, chúng tôi tin rằng
                mỗi chiếc đèn đều có thể mang lại sự ấm áp, thư giãn và niềm vui cho không gian sống của bạn.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">🎯 Tầm nhìn & sứ mệnh</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center mb-3">
                        <i className='bx bx-target-lock text-amber-600 dark:text-amber-400 text-xl' />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Tầm nhìn</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Trở thành thương hiệu đèn trang trí được yêu thích nhất tại Việt Nam, mang ánh sáng nghệ thuật đến mọi gia đình.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center mb-3">
                        <i className='bx bx-heart text-amber-600 dark:text-amber-400 text-xl' />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Sứ mệnh</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Kiến tạo không gian sống đẹp hơn thông qua những sản phẩm đèn sáng tạo, chất lượng cao với giá cả hợp lý.</p>
                </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">💡 Tại sao chọn CapyLumine?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose mb-6">
                {[
                    { icon: 'bx-check-shield', title: 'Chất lượng đảm bảo', desc: 'Sản phẩm được kiểm tra chất lượng nghiêm ngặt trước khi giao đến tay khách hàng' },
                    { icon: 'bx-palette', title: 'Thiết kế độc đáo', desc: 'Mẫu mã đa dạng, từ phong cách dễ thương đến hiện đại, nghệ thuật' },
                    { icon: 'bx-package', title: 'Giao hàng toàn quốc', desc: 'Ship COD toàn quốc, đóng gói cẩn thận, bảo đảm an toàn' },
                    { icon: 'bx-support', title: 'Hỗ trợ tận tâm', desc: 'Đội ngũ CSKH nhiệt tình, sẵn sàng tư vấn 24/7' },
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <i className={`bx ${item.icon} text-amber-600 dark:text-amber-400`} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{item.title}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">📍 Thông tin liên hệ</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 not-prose">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <i className='bx bx-phone text-amber-600 dark:text-amber-400 text-lg' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">(+84) 969 608 810</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <i className='bx bx-envelope text-amber-600 dark:text-amber-400 text-lg' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">Khongthaydoi124@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <i className='bx bx-map text-amber-600 dark:text-amber-400 text-lg' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">A2 Vĩnh Hồ, Thịnh Quang, Đống Đa, Hà Nội</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <i className='bx bx-globe text-amber-600 dark:text-amber-400 text-lg' />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">CapyLumine.com</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
