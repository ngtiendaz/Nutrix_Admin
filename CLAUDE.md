# CLAUDE.md - Hướng dẫn Phát triển & Lệnh Hệ thống

Tài liệu này định nghĩa các lệnh thường dùng và quy chuẩn code của dự án.

## Lệnh Hệ Thống (System Commands)

Tất cả các lệnh bên dưới nên chạy thông qua công cụ **RTK (Rust Token Killer)** để tối ưu hoá token (ví dụ: `rtk npm run dev`, `rtk git status`).

* Chạy môi trường phát triển (Dev Server): `npm run dev`
* Kiểm tra lỗi cú pháp (Lint): `npm run lint`
* Kiểm tra kiểu dữ liệu (Typecheck): `npm run typecheck`
* Biên dịch dự án (Build): `npm run build`
* Xem trước bản build (Preview): `npm run preview`

---

## Kiến trúc MVVM (MVVM Architecture)

Hệ thống tuân thủ nghiêm ngặt mô hình kiến trúc MVVM:

1. **Model** (`src/models/`):
   - Định nghĩa các interface/type cho dữ liệu (ví dụ: [Food.tsx](file:///Users/macbook/Code/DoAn/project/src/models/Food.tsx)).
   - Không chứa logic UI hay logic nghiệp vụ phức tạp.

2. **ViewModel** (`src/viewmodels/`):
   - Viết dưới dạng các custom hook React (ví dụ: [FoodViewModel.tsx](file:///Users/macbook/Code/DoAn/project/src/viewmodels/FoodViewModel.tsx)).
   - Quản lý state, thực hiện gọi API qua Service và trả về state/callbacks cho View.

3. **View** (`src/views/`):
   - Các React Component hiển thị giao diện (ví dụ: [FoodPage.tsx](file:///Users/macbook/Code/DoAn/project/src/views/foods/FoodPage.tsx)).
   - KHÔNG gọi trực tiếp các phương thức của Firebase/Services. Tất cả tương tác phải thông qua ViewModel.

4. **Services** (`src/services/`):
   - Tích hợp và cấu hình thư viện bên thứ ba (ví dụ: [firebase.tsx](file:///Users/macbook/Code/DoAn/project/src/services/firebase.tsx)).
   - Cung cấp các hàm bất đồng bộ cho ViewModel sử dụng.

---

## Quy chuẩn Code (Code Style & Guidelines)

* **Ngôn ngữ**: Giao diện và thông báo cho người dùng sử dụng **Tiếng Việt**. Code, comment chuyên ngành, tên biến/hàm sử dụng **Tiếng Anh**.
* **Styling**: Sử dụng **TailwindCSS** kết hợp các class chung định nghĩa tại [index.css](file:///Users/macbook/Code/DoAn/project/src/index.css) (`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.input-field`, `.card`).
* **Icons**: Sử dụng bộ thư viện `lucide-react`.
* **TypeScript**: Sử dụng kiểu dữ liệu rõ ràng, tránh lạm dụng `any`.
