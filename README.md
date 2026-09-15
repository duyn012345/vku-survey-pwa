# VKU Field Survey PWA - Ứng dụng điều tra hiện trường phỏng vấn nhu cầu việc làm

> **Mini-Project 1** — Môn học: **Cross-Platform Mobile App Development (VKU)**  
> **Sinh viên thực hiện:** Lê Thị Mỹ Duyên — MSSV: `23IT.B033`   
> **Demo Live:** [Live Demo](https://vku-survey-pwa.duyenlethi012345.workers.dev)
> **Repository:** [GitHub Repository](https://github.com/duyn012345/vku-survey-pwa)
---

## 1. Giới thiệu

VKU Field Survey PWA là ứng dụng Progressive Web App (PWA) hỗ trợ điều tra hiện trường và phỏng vấn nhu cầu việc làm của sinh viên.

Ứng dụng được xây dựng theo mô hình **Offline-first**, cho phép thu thập và lưu dữ liệu ngay cả khi không có Internet. Khi có kết nối mạng, dữ liệu sẽ được tự động đồng bộ lên Google Sheets thông qua Google Apps Script và ảnh được lưu trên Google Drive.

## 2. Tính năng chính

- Tạo và quản lý phiên khảo sát.
- Nhập thông tin sinh viên và nhu cầu việc làm.
- Lưu dữ liệu Offline bằng IndexedDB.
- Tự động đồng bộ khi có Internet.
- Theo dõi trạng thái `pending`, `syncing`, `synced`, `error`.
- Thu thập vị trí GPS nếu thiết bị cho phép.
- Chụp và lưu ảnh khảo sát lên Google Drive.
- Hiển thị thống kê trên Dashboard.
- Cài đặt và sử dụng dưới dạng PWA.
- Triển khai ứng dụng trên Cloudflare Pages.

## 3. Kiến trúc hệ thống

```text
React + Vite PWA
       │
       ↓
   IndexedDB
       │
       ↓
Có Internet?
   │       │
 Không     Có
   │       ↓
   │   Google Apps Script
   │       │
   │   ┌───┴────┐
   │   ↓        ↓
   │ Google   Google
   │ Sheets   Drive
   │
   ↓
Lưu Offline
   ↓
Tự động đồng bộ khi có mạng
```

### Luồng dữ liệu

```text
Người dùng
    ↓
Tạo khảo sát
    ↓
IndexedDB
    ↓
Google Apps Script
    ↓
Google Sheets + Google Drive
```

## 4. Cấu trúc project

```text
vku-survey/
├── public/
├── src/
│   ├── components/
│   │   └── NetworkStatus.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── NewSurvey.jsx
│   │   └── SurveyList.jsx
│   ├── services/
│   │   ├── db.js
│   │   ├── sync.js
│   │   └── location.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── appscript/
│   └── Mã.gs
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 5. Công nghệ sử dụng

- **Frontend:** React, JavaScript, Vite
- **PWA:** Service Worker, Web App Manifest, Vite PWA Plugin
- **Offline Storage:** IndexedDB
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **File Storage:** Google Drive
- **Deployment:** Cloudflare Pages
- **Source Control:** Git, GitHub

## 6. Cài đặt project

Clone repository:

```bash
git clone https://github.com/duyn012345/vku-survey-pwa.git
cd vku-survey
```

Cài đặt thư viện:

```bash
npm install
```
Chạy project:

```bash
npm run dev
```

Sau đó mở địa chỉ Vite cung cấp, thường là:

```text
http://localhost:5173/
```

## 7. Cấu hình Google Sheets

1. Tạo một Google Spreadsheet.
2. Tạo Sheet có tên:

```text
SurveyVKU
```

3. Sheet được sử dụng để lưu dữ liệu khảo sát.

Các trường dữ liệu chính:

```text
Session ID
Interviewer
Created At
Latitude
Longitude
Accuracy
Student Name
Student ID
Faculty
Year
Q1 - Q8
Photo URL
Synced At
```

## 8. Cấu hình Google Apps Script

Mở:

```text
Google Sheets → Extensions → Apps Script
```

Source code nằm tại:

```text
appscript/Mã.gs
```

Copy nội dung `Mã.gs` vào Google Apps Script.

Cấu hình Google Drive Folder ID:

```javascript
const DRIVE_FOLDER_ID =
  "YOUR_GOOGLE_DRIVE_FOLDER_ID";
```
Folder này được sử dụng để lưu ảnh khảo sát.

Nếu Apps Script yêu cầu quyền truy cập Google Drive, cấp quyền và kiểm tra lại chức năng upload ảnh.

## 9. Deploy Google Apps Script

Trong Google Apps Script:

```text
Deploy → New deployment → Web app
```

Cấu hình:

```text
Execute as: Me
Who has access: Anyone
```

Sau khi Deploy, lấy Web App URL có dạng:

```text
https://script.google.com/macros/s/XXXXXXXX/exec
```

Mở:

```text
src/services/sync.js
```

Cấu hình:

```javascript
const GOOGLE_SCRIPT_URL =
  "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
```

## 10. Kiểm tra Offline-first

1. Mở ứng dụng.
2. Tạo một phiên khảo sát.
3. Tắt Internet.
4. Lưu khảo sát.
5. Dữ liệu được lưu vào IndexedDB với trạng thái `pending`.
6. Bật Internet trở lại.
7. Ứng dụng tự động đồng bộ dữ liệu.
8. Kiểm tra dữ liệu trong Google Sheets.
9. Nếu có ảnh, kiểm tra Google Drive.

Kiểm tra IndexedDB:

```text
F12 → Application → IndexedDB
```

## 11. Trạng thái đồng bộ

- `pending`: Đang chờ đồng bộ.
- `syncing`: Đang đồng bộ.
- `synced`: Đồng bộ thành công.
- `error`: Đồng bộ thất bại.

## 12. Build và Deploy

Build project:

```bash
npm run build
```

Thư mục build:

```text
dist/
```

Kiểm tra bản production:

```bash
npm run preview
```

## 13. Thông tin người thực hiện

- **Trường:** Đại học CNTT & TT Việt - Hàn (VKU)
- **Môn học:** Cross-Platform Mobile App Development
- **Đề tài:** Mini-Project 1 — VKU Field Survey PWA

