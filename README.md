# 🎵 iMusic Reze
<p align="center"> 
  <a href="https://imusicreze.onrender.com/"> 
    <img src="./src-tauri/icons/128x128.png">
  </a>
</p>

<p align="center">
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  </a>
  <a href="https://tauri.app/">
    <img src="https://img.shields.io/badge/Tauri_v2-FFC131?style=for-the-badge&logo=tauri&logoColor=black" alt="Tauri" />
  </a>
  <a href="https://www.rust-lang.org/">
    <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </a>
</p>

## ✨ Giới thiệu

**iMusic Reze** là ứng dụng nghe nhạc offline trên Desktop được xây dựng với hiệu năng cao của **Rust (Tauri)** và giao diện mượt mà của **React**.

Dự án lấy cảm hứng từ giao diện **Zing MP3** với tông màu tím chủ đạo (Deep Purple), thiết kế **Glassmorphism** (kính mờ), và các hiệu ứng chuyển động tinh tế. Ứng dụng tập trung vào trải nghiệm người dùng (UX) hiện đại, gọn nhẹ và đẹp mắt.

## 🚀 Tính năng nổi bật

*   **🎧 Giao diện Vinyl Record:** Đĩa than xoay khi phát nhạc, hiệu ứng kim đĩa than chân thực.
*   **🎨 Dynamic Theme:** Tự động trích xuất màu chủ đạo từ ảnh bìa bài hát (Album Art) để phối màu cho giao diện và hiệu ứng Glassmorphism.
*   **📂 Quản lý Thư viện:** Quét và phát nhạc từ thư mục local trên máy tính.
*   **📑 Playlist thông minh:**
    *   Tạo, sửa, xóa Playlist.
    *   **Drag & Drop:** Kéo thả để sắp xếp thứ tự bài hát.
    *   Thêm nhiều bài hát vào playlist cùng lúc.
*   **📱 Mobile-style Drawer:** Danh sách phát trượt từ dưới lên (Overlay) thay vì chuyển trang, tối ưu trải nghiệm.
*   **🎛️ Custom Title Bar:** Thanh tiêu đề tùy chỉnh trong suốt, đồng bộ với giao diện ứng dụng.
*   **🎹 Media Controls:** Đầy đủ chức năng: Play, Pause, Next, Prev, Loop, Shuffle, Seek bar.
*   **⌨️ Phím tắt:** Hỗ trợ các phím tắt media hệ thống (SMTC Integration).


## 🛠️ Cài đặt & Chạy dự án

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:
*   [Node.js](https://nodejs.org/) (Khuyên dùng v18+)
*   [Rust](https://www.rust-lang.org/tools/install)
*   [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Nếu dùng Windows)

### 1. Clone dự án

```bash
git clone https://github.com/vy-phan/iMusic_Reze.git
cd imusic
```

### 2. Cài đặt thư viện

```bash
npm install
```

### 3. Chạy môi trường phát triển (Dev)

```bash
npm run redev
```

hoặc

```bash
npm run tauri dev
```


## 📦 Đóng gói ứng dụng (Build)

Để tạo file cài đặt (`.exe` cho Windows):

```bash
npm run tauri build
```

Sau khi chạy xong, file cài đặt sẽ nằm tại:
`src-tauri/target/release/bundle/nsis/*.exe`

## 🧰 Công nghệ sử dụng

*   **Frontend:** React, TypeScript, Vite
*   **Backend:** Rust, Tauri v2
*   **Styling:** Tailwind CSS v3
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **State Management:** React Context API
*   **Drag & Drop:** @dnd-kit
*   **Utilities:** ColorThief (lấy màu chủ đạo), Tauri Media Plugin.

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy thoải mái mở **Issue** hoặc gửi **Pull Request**.

1.  Fork dự án
2.  Tạo branch mới (`git checkout -b feature/TinhNangMoi`)
3.  Commit thay đổi (`git commit -m 'Thêm tính năng mới'`)
4.  Push lên branch (`git push origin feature/TinhNangMoi`)
5.  Mở Pull Request


---
<p align="center">Made with ❤️ by Vy Phan</p>

