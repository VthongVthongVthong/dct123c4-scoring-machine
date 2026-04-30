# ✨ Máy Chấm Bài – AI Grading Platform

Máy Chấm Bài là một ứng dụng web hiện đại giúp tự động hóa quy trình chấm điểm bài tập sinh viên bằng công nghệ Trí tuệ nhân tạo (AI). Dự án được thiết kế dành riêng cho lớp **DCT123C4** với độ chính xác cao và quy trình bảo mật nghiêm ngặt.

<img width="2561" height="1858" alt="screencapture-dct123c4-ct-ws-2026-04-30-22_40_48" src="https://github.com/user-attachments/assets/6ad7cd34-3429-4da8-a0c3-0ea8855bb78c" />

## 🚀 Tính năng nổi bật

- **📸 AI OCR (Vision):** Sử dụng model **Gemini 1.5 Flash** để bóc tách văn bản từ ảnh chụp bài làm (hỗ trợ chữ viết tay và công thức toán học).
- **🎯 Chấm điểm thông minh:** AI tự động phân tích logic, đưa ra điểm số, giải thích lỗi sai và gợi ý tối ưu hóa (độ phức tạp thuật toán, kiến thức liên quan).
- **🔐 Xác thực Sinh viên:** Tích hợp với **Firebase Realtime Database** để đảm bảo chỉ sinh viên trong danh sách mới có quyền truy cập.
- **🛡️ Bảo mật tuyệt đối:**
  - **Cloudflare Workers Proxy:** Giấu hoàn toàn API Key và địa chỉ Database khỏi phía Client.
  - **JavaScript Obfuscation:** Mã hóa mã nguồn để bảo vệ logic ứng dụng.
  - **CORS Protection:** Chỉ cho phép tên miền chính thức gọi tới API.
- **📱 Giao diện Premium:** Thiết kế tối giản, hỗ trợ Dark Mode, responsive hoàn hảo trên thiết bị di động.

## 🛠️ Công nghệ sử dụng

- **Frontend:** Vanilla HTML5, CSS3 (Modern UI/UX), JavaScript (ES6+).
- **AI Engine:** Google Gemini Pro Vision & Gemini Flash 1.5.
- **Backend Serverless:** Cloudflare Workers (Runtime).
- **Database:** Firebase Realtime Database.
- **Build Tools:** Node.js, Terser (Minification), Basic-FTP (Automated Deploy).

## 📦 Hướng dẫn Phát triển & Triển khai

### 1. Cài đặt môi trường
```bash
npm install
```

### 2. Xây dựng bản phát hành (Build)
Lệnh này sẽ thực hiện mã hóa (obfuscate) mã nguồn và chuẩn bị các file trong thư mục `dist/`:
```bash
npm run build
```

### 3. Triển khai (Deploy)
Tự động upload các file đã mã hóa lên hosting (InfinityFree) qua FTP:
```bash
npm run deploy
```

## 🔒 Cấu trúc thư mục

- `src/`: Mã nguồn gốc (dễ đọc, dùng để phát triển).
- `dist/`: Mã nguồn đã được mã hóa và tối ưu (dùng để chạy trên web).
- `worker.js`: Mã nguồn chạy trên Cloudflare Workers (xử lý trung gian).
- `build.js`: Script tự động hóa quy trình nén và đóng gói code.

---
Developed with 💖 by **Vthong** (DCT123C4)
