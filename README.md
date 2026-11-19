# Xưởng ảo cho đội AI (Tan Design Team)

Theo dõi các phiên **Claude Code** của đội thiết kế cơ khí trên một bản đồ xưởng 2D, kèm đủ bộ sổ điều phối như một đội thật: việc ưu tiên, gói việc, hòm thư, lượt SolidWorks, sổ "Cần anh", nội quy, đội ngũ, bài học và đánh giá nhân sự.

- Mỗi phiên Claude Code là một nhân viên có bàn riêng: đang làm thì ngồi bàn, rảnh thì đi tuần xưởng.
- Đội nhân sự xưởng (Product Manager, Document, QC, Design Mechanical, Workshop Manager, Lathe Machine, Milling Machine, 3D Printer) tự đi tuần theo vị trí công việc và họp giao ban ở Phòng họp chung.
- Xưởng Prototype có máy CNC, máy tiện, máy in 3D, SLA, cưa, khoan, bàn nguội, cầu trục, đều đang vận hành.
- Giao diện có hai ngôn ngữ, Tiếng Việt và English; nút chuyển nằm ở góc trên bên phải.

> **Chỉ đọc, chạy tại máy bạn.** Xưởng chỉ đọc nhật ký mà Claude Code vốn tự ghi (`~/.claude`) và sổ của đội trong thư mục `data/`. Không gửi dữ liệu đi đâu, không cần khóa API. Mọi chuỗi giống khóa đều được che trước khi hiện. Kho không dùng thư viện ngoài nào, nên không cần `npm install`.

## Chạy

Cần **Node.js 18+** (https://nodejs.org) và **Claude Code** đã dùng trên máy.

```bash
npm start            # hoặc chạy chay-van-phong.bat trên Windows
```

Mở **http://localhost:7788**. Lần đầu có thể chạy `npm run setup` để tạo `config.json` và sổ `data/` từ khung mẫu `mau/`.

## Các màn hình

Mọi trang dùng chung một thanh điều hướng ở hàng trên cùng, cùng nền cơ khí và nút chuyển ngôn ngữ.

| Màn | Có gì |
|---|---|
| **Xưởng** | Bản đồ 2D: phòng Trưởng xưởng, PM, Dữ liệu, QA/QC, Thiết kế CAD, Design Review, Phòng họp chung, xưởng Prototype. Kéo để di chuyển, cuộn để thu phóng, nút Ⅱ để dừng chuyển động. Cột phải: cảnh báo, người đang xem (nhắn tin cho agent), việc ưu tiên, dòng thời gian |
| **Bảng điều hành** | Đang làm / chờ / bị chặn / rảnh, lượt SolidWorks, việc ưu tiên, luồng tin, dải "Cần anh", nhịp làm việc 3 giờ, tiền AI |
| **Công việc** | Việc đang áp dụng theo thứ tự, nhật ký quyết định, tiến độ từng gói, lượt SolidWorks và việc chờ anh |
| **Tổng quan** | Việc gì, ai làm, tới đâu, nghẽn ở đâu; ai rảnh mà còn việc, ai im quá 2 giờ |
| **Hòm thư** | Mỗi vai: số tin chưa xong, chờ quá 1 giờ, đọc lại từ 3 lần mà chưa xong |
| **Nội quy** | Nội quy, đội ngũ, cấp bậc, sổ tay (bài học, việc để sau, từ điển, SPEC) |
| **Đánh giá** | Thẻ "Your usage" (gói Claude, nhập tay), token theo giờ và ngày, xếp loại A/B/C/D theo việc xong, lỗi lệnh, lượt DEV, giờ làm, độ tiết kiệm |
| **Tin nhắn** | Toàn bộ tin 24 giờ, lọc theo người |

"Your usage" lấy số từ claude.ai → Settings → Usage. Claude không có cổng công khai để máy chủ tự đọc, nên số này nhập tay và lưu trên trình duyệt.

## Sổ điều phối `data/` và công cụ `vp`

Sổ của đội nằm trong `data/` (đã có trong `.gitignore`). Agent ghi sổ bằng `node tools/vp.js …`; gõ `node tools/vp.js giup` để xem đủ lệnh:

| Sổ | Lệnh |
|---|---|
| Hòm thư `hop-thu/<vai>.jsonl` | `vp gui --toi "<vai>" "[VIỆC] …"` · `vp tiep --toi "<vai mình>"` (cuối mỗi lượt) · `vp xong <mã>` · `vp ds` |
| Lượt SolidWorks `DEV.lock`, `DEV-LUOT.jsonl` | `vp luot cho \| lay \| nha \| huy \| xem` |
| Cần anh `CAN-ANH.md` | `vp cananh hoi \| xong \| ds` |
| Việc ưu tiên `UU-TIEN.json` | `vp viec ds \| them \| sua \| dung \| xoa` |
| Gói việc `goi/<gói>/viec.json` + `tien-do.md` | `vp goi tao \| muc \| dat \| sua \| ghichu` · `vp tiendo <gói> "…"` |
| Bài học `BAI-HOC.md` | `vp baihoc --the "<thẻ>" "…" --chan "…"` |
| Nội quy, đội ngũ, cấp bậc, việc để sau, từ điển, quyết định, SPEC | sửa tay các file `.md` trong `data/` (khung mẫu ở `mau/`) |

Luật đội để dán vào dự án nằm ở `data/DOAN-CHEN-VAO-AGENTS.md`, đã điền sẵn đường dẫn. Nó dặn mọi phiên AI: đọc hòm thư cuối mỗi lượt, hỏi chủ qua sổ "Cần anh", lấy và nhả lượt SolidWorks, ghi "Đang dở" trước khi nghỉ.

## Cấu hình `config.json`

| Khóa | Mặc định | Ý nghĩa |
|---|---|---|
| `title`, `subtitle`, `ownerName` | Văn phòng AI, …, Giám đốc | Tên hiện trên thanh trên cùng và bản đồ |
| `projects` | `[]` | Thư mục dự án cần theo dõi (tính cả thư mục con, worktree). Để trống là mọi dự án trên máy |
| `port`, `host` | 7788, 127.0.0.1 | `0.0.0.0` để máy khác trong mạng xem được |
| `accessKey` | `""` | Khóa xem: nhập một lần mới vào được |
| `keepHours` | 24 | Phiên im quá số giờ này thì rời xưởng |
| `staff`, `hide` | `[]` | Đặt tên, chức danh, phòng (`manager`, `coord`, `g1`, `claude`, `shop`) cho phiên; giấu phiên |
| `dataDir` | `data` | Nơi để sổ điều phối |
| `rulesFile` | `""` | File nội quy riêng; để trống thì dùng `data/NOI-QUY.md`, không có thì `AGENTS.md` / `CLAUDE.md` của dự án |
| `aiCapUsd` | 100 | Trần tiền AI mỗi ngày (vượt 80% thì ô chuyển đỏ) |
| `prices` | Claude 3 / 0,3 / 15 | Giá API (USD cho 1 triệu token: vào / đọc đệm / ra) để **ước tính** tiền. Dùng gói thuê bao tháng thì đây chỉ là số để so sánh |
| `dockerFilter`, `dockerStrip`, `dockerRetired` | `""`, `""`, `[]` | Hiện container Docker ở Phòng họp chung, ví dụ `"name=myapp-dev"` |

Sửa `config.json` xong cần khởi động lại `server.js`.

## Gặp lỗi

| Hiện tượng | Cách xử lý |
|---|---|
| `Chưa có config.json` | Chạy `npm run setup` trước. |
| Xưởng trống | Mở phiên Claude Code **trong đúng thư mục dự án** đã chọn; kiểm `projects` (dùng dấu `/`). |
| `EADDRINUSE` | Cổng 7788 đang bận: đổi `port` hoặc tắt tiến trình cũ. |
| Đổi `config.json` mà không thấy thay đổi | Khởi động lại `node server.js`. |
| Hòm thư không ai đọc | Phiên chưa có luật đội: dán `data/DOAN-CHEN-VAO-AGENTS.md` vào `CLAUDE.md`, và đặt tên phiên trùng tên vai. |
| Màn hình giật | Bấm nút Ⅱ để dừng chuyển động, hoặc dùng trình duyệt mới (Chrome/Edge). |

## Cấu trúc mã

```
server.js              máy chủ: tìm phiên, đọc nhật ký + sổ, đẩy trạng thái mỗi giây
lib/                   perf (token, điểm, tiền) · docs (sổ sách) · hopthu · tongquan · chat (PIN) · mailbox · config
tools/vp.js            công cụ ghi sổ cho agent
setup.js               cài đặt (hỏi–đáp hoặc --yes cho agent)
mau/                   khung mẫu sổ điều phối + đoạn luật đội cho CLAUDE.md
public/                giao diện: index (Xưởng) + board, congviec, noiquy, tongquan, hopthu, hieusuat, tinnhan
  xuong.js / machines.js   bản đồ, agent, máy móc
  bg.js / bg.css           nền cơ khí
  nav.js / nav.css         thanh điều hướng chung
  i18n.js                  chuyển Tiếng Việt / English
HUONG-DAN-CHO-AGENT.md hướng dẫn để agent tự cài
```

Mã gốc lấy từ dự án mã nguồn mở `van-phong-ao-3d` (MIT). Giấy phép MIT.
