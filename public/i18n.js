// Tiếng Việt / English. Chữ nguồn trong giao diện là Tiếng Việt; khi chọn English, bộ dịch này thay cụm từ trong mọi nút chữ,
// kể cả chữ do JavaScript sinh ra về sau (MutationObserver). Dữ liệu của bạn (tên việc, nội dung tin, file .md) giữ nguyên.
(function () {
  "use strict";
  let LANG = "vi"; try { LANG = localStorage.getItem("vp-lang") === "en" ? "en" : "vi"; } catch {}
  window.VPLang = LANG;
  const root = document.documentElement; root.lang = LANG; root.setAttribute("data-lang", LANG);

  // nút chuyển ngôn ngữ (đã có sẵn trong HTML của thanh trên cùng)
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-set-lang]"); if (!b) return;
    try { localStorage.setItem("vp-lang", b.getAttribute("data-set-lang")); } catch {}
    location.reload();
  });
  if (LANG !== "en") return;

  // ngày giờ theo ngôn ngữ English
  for (const fn of ["toLocaleString", "toLocaleDateString", "toLocaleTimeString"]) {
    const orig = Date.prototype[fn];
    Date.prototype[fn] = function (loc, ...rest) { return orig.call(this, loc === "vi-VN" ? "en-GB" : loc, ...rest); };
  }

  // [tiếng Việt viết thường, English]. Khớp không phân biệt hoa/thường; câu dài được thử trước câu ngắn.
  const D = [
    // ---- thanh trên cùng, điều hướng ----
    ["xưởng r&d vulcan", "Vulcan R&D Workshop"], ["xưởng r&d", "R&D Workshop"], ["thiết kế cơ khí · quản lý dự án · dữ liệu", "Mechanical design · Project management · Data"],
    ["trạm điều phối", "Dispatch station"], ["điều hướng", "Navigation"], ["trực tiếp", "LIVE"], ["đang nối…", "connecting…"], ["mất kết nối, đang nối lại…", "disconnected, reconnecting…"],
    ["mất kết nối máy chủ", "server connection lost"], ["bảng điều hành", "Dashboard"], ["công việc & tiến độ", "Tasks & progress"], ["công việc", "Tasks"], ["tổng quan", "Overview"],
    ["hòm thư", "Inbox"], ["nội quy & đội ngũ", "Rules & team"], ["nội quy", "Rules"], ["đánh giá nhân sự ai", "AI staff performance"], ["đánh giá nhân sự", "Staff performance"], ["đánh giá", "Performance"],
    ["tin nhắn", "Messages"], ["xưởng prototype · cnc · in 3d", "Prototype workshop · CNC · 3D printing"], ["xưởng prototype", "Prototype workshop"], ["xưởng", "Workshop"],
    // ---- trang Xưởng ----
    ["bản đồ tương tác của xưởng. kéo để di chuyển, cuộn để thu phóng.", "Interactive workshop map. Drag to pan, scroll to zoom."], ["bản đồ xưởng", "Workshop map"],
    ["bấm vào một người trên bản đồ.", "Click a person on the map."], ["rảnh thì đi thăm máy và chào nhau · kéo để di chuyển · cuộn để thu phóng", "Idle staff visit machines and greet each other · Drag to pan · Scroll to zoom"],
    ["dừng chuyển động", "Pause motion"], ["tiếp tục chuyển động", "Resume motion"], ["điều khiển góc nhìn", "View controls"], ["phóng to", "Zoom in"], ["thu nhỏ", "Zoom out"], ["về giữa", "Center"],
    ["cảnh báo", "Alerts"], ["không có cảnh báo.", "No alerts."], ["đang xem", "Viewing"], ["chi tiết", "Details"], ["dòng thời gian hôm nay", "Today's timeline"], ["hôm nay chưa có hoạt động.", "No activity today."],
    ["chưa có việc ưu tiên.", "No priority tasks yet."], ["việc ưu tiên", "Priority tasks"], ["đội ngũ", "Team"], ["phiên đang mở", "Open sessions"], ["nhân sự xưởng", "Workshop staff"],
    ["chưa có phiên nào đang mở.", "No sessions are open."], ["chờ / chặn", "Waiting / blocked"], ["rảnh / nghỉ", "Idle / off"], ["lượt solidworks", "SolidWorks turn"], ["ổ đĩa trống", "Free disk"],
    ["đại ca", "Boss"], ["chủ văn phòng", "Owner"], ["đang làm", "working"], ["đang chờ", "waiting"], ["bị chặn", "blocked"], ["rảnh", "idle"], ["trống", "free"],
    ["trưởng xưởng", "WORKSHOP HEAD"], ["pm · kế hoạch dự án", "PM · PROJECT PLAN"], ["dữ liệu · pdm · doc control", "DATA · PDM · DOC CONTROL"], ["qa/qc · đo kiểm & duyệt", "QA/QC · INSPECTION & APPROVAL"],
    ["phòng thiết kế cad", "CAD DESIGN ROOM"], ["phòng design review", "DESIGN REVIEW ROOM"], ["phòng họp chung", "MEETING ROOM"], ["tập hợp…", "GATHERING…"], ["đang họp giao ban", "DAILY STAND-UP"],
    ["bàn rà", "SURFACE PLATE"], ["tiện cnc", "CNC LATHE"], ["cưa", "SAW"], ["khoan", "DRILL"],
    ["nhân sự mô phỏng của xưởng: tự đi tuần theo vị trí công việc và họp giao ban ở phòng họp chung. khi có phiên claude code cùng vai, phiên đó thế chỗ.", "Simulated workshop staff: they patrol their work areas and hold stand-ups in the meeting room. A Claude Code session with the same role replaces them."],
    ["đang di chuyển", "Moving"], ["tại vị trí làm việc", "At workstation"], ["đang trên dev", "on DEV"], ["phiên con đang chạy", "sub-sessions running"],
    ["chờ lượt solidworks", "waiting for SolidWorks"], ["đang giữ lượt", "holding the turn"], ["đang giữ", "holding"], ["trạng thái:", "Status:"], ["vai trò:", "Role:"], ["đang:", "Now:"],
    ["hoạt động gần nhất:", "Last activity:"], ["đang rảnh / chờ", "idle / waiting"], ["nghỉ lâu", "away"], ["không đọc được nhật ký", "log unreadable"], ["người", "Person"],
    // lời thoại của nhân sự xưởng
    ["chào", "Hi"], ["họp nhanh nhé", "Quick sync?"], ["xem lại thiết kế", "Reviewing the design"], ["review bản vẽ", "Reviewing drawings"], ["kiểm tra cnc-1", "Checking CNC-1"],
    ["cnc-2 chạy ổn", "CNC-2 running fine"], ["cnc-3 đang cắt", "CNC-3 is cutting"], ["cnc-2 đang cắt nhôm", "CNC-2 cutting aluminum"], ["tiện đang chạy", "Lathe is running"],
    ["cắt phôi", "Cutting stock"], ["khoan lỗ", "Drilling holes"], ["máy in số 1 ổn", "Printer 1 is fine"], ["kiểm tra bàn in", "Checking the print bed"], ["sla đang quét", "SLA is scanning"],
    ["nguội chi tiết", "Hand-finishing parts"], ["lấy dụng cụ", "Getting tools"], ["đo cmm", "Measuring on CMM"], ["rà kiểm tra", "Inspecting"], ["duyệt kết quả đo", "Approving measurements"],
    ["kiểm tra pdm", "Checking PDM"], ["trao đổi kế hoạch", "Discussing the plan"], ["cập nhật master list", "Updating Master List"], ["xem model cad", "Viewing the CAD model"], ["xem mẫu in thử", "Looking at the test print"],
    ["rà ưu tiên dự án", "Reviewing project priorities"], ["cập nhật tiến độ", "Updating progress"], ["soạn wi song ngữ", "Drafting bilingual WI"], ["đối chiếu spec", "Cross-checking SPEC"],
    ["soát bản vẽ", "Checking drawings"], ["lập báo cáo đo", "Writing the inspection report"], ["dựng model solidworks", "Building the SolidWorks model"], ["chỉnh dung sai", "Adjusting tolerances"],
    ["phân lịch máy", "Scheduling machines"], ["kiểm tồn dụng cụ", "Counting tool stock"], ["đang tiện trục", "Turning a shaft"], ["đo lại đường kính", "Re-measuring the diameter"], ["kiểm tra dao", "Checking the tool"],
    ["đang in mẫu", "Printing a sample"], ["kiểm tra lớp đầu", "Checking the first layer"], ["e12 giao sản xuất tuần này", "E12 goes to production this week"], ["chốt thứ tự ưu tiên", "Locking in the priority order"],
    ["wi24 gần xong", "WI24 almost done"], ["cần bản vẽ rev mới nhất", "Need the latest drawing rev"], ["cmm đo đạt", "CMM measurement passed"], ["có lỗi s2 cần sửa", "S2 defect needs fixing"],
    ["model rev b xong", "Model rev B is done"], ["cần dfm cho gá kẹp", "Need DFM for the fixture"], ["ưu tiên cnc-2 trước", "CNC-2 first"], ["máy in 3 cần thay nhựa", "Printer 3 needs new filament"],
    ["phôi trục sẵn sàng", "Shaft stock is ready"], ["dao tiện mòn rồi", "The lathe tool is worn"], ["chương trình g-code ok", "G-code program OK"], ["đổi dao ø6", "Swapping to a Ø6 tool"],
    ["mẫu in xong 80%", "Print is 80% done"], ["thay cuộn nhựa pla", "Changing the PLA spool"], ["tôi nắm rồi", "Got it"],
    // ---- góc SolidWorks / DEV ----
    ["lượt solidworks", "SolidWorks turn"], ["trạm solidworks", "SolidWorks station"], ["trạm sw & chờ anh", "SW station & waiting on you"], ["trạm sw trống", "SW station free"], ["trạm sw", "SW station"],
    ["hàng chờ trạm sw", "SW station queue"], ["hàng chờ dev", "DEV queue"], ["hàng chờ trống", "Queue is empty"], ["hàng chờ còn", "queued:"], ["hàng chờ", "queue"], ["gói · dịch vụ khỏe", "packages · services healthy"],
    ["lịch trạm solidworks hôm nay", "Today's SolidWorks schedule"], ["ai giữ lượt, lúc nào", "who held the turn, when"], ["hôm nay chưa có lượt solidworks nào.", "No SolidWorks turns today."],
    ["chưa có lượt solidworks", "no SolidWorks turns yet"], ["lượt dev gần nhất", "Latest DEV turn"], ["lượt dev 7 ngày", "DEV turns, 7 days"], ["lượt dev", "DEV turn"], ["lượt sw gần nhất", "Latest SW turn"], ["lượt sw", "SW turn"],
    ["dev đang giữ", "DEV held by"], ["dev trống", "DEV idle"], ["dev hỏng", "DEV broken"], ["đang lên dev", "going to DEV"], ["đang chạy solidworks", "running SolidWorks"], ["đang có người giữ", "IN USE"],
    ["người cầm:", "Holder:"], ["chưa rõ người cầm", "holder unknown"], ["chưa rõ", "unknown"], ["sổ dev", "DEV log"], ["giữ được", "kept"], ["giữ dev", "holding DEV"],
    // ---- bảng điều hành ----
    ["bảng nhân sự trực tiếp", "Live staff board"], ["luồng tin giữa các phòng", "Message flow between rooms"], ["nhịp làm việc 3 giờ qua", "Activity, last 3 hours"], ["số phiên có hoạt động mỗi phút", "active sessions per minute"],
    ["tiền ai hôm nay", "AI spend today"], ["tiền ai theo ngày (ước tính)", "AI spend per day (estimate)"], ["hôm nay", "Today"], ["trần", "cap"], ["ước tính", "estimate"], ["theo token:", "By tokens:"],
    ["lượt solidworks tự khai:", "self-reported SolidWorks turns:"], ["lượt có ghi tiền", "turns with cost"], ["lượt không ghi", "turns without cost"], ["theo nguồn:", "By source:"],
    ["ước tính: token claude đếm được trong nhật ký × bảng giá api trong config.json (prices), cộng tiền các lượt solidworks tự khai khi nhả lượt (vp luot nha --usd …). dùng gói thuê bao tháng thì đây là số để so sánh, không phải hóa đơn.",
      "Estimate: Claude tokens counted in the logs × the API price list in config.json (prices), plus the cost self-reported when releasing a SolidWorks turn (vp luot nha --usd …). On a monthly subscription this is a comparison figure, not an invoice."],
    ["trạng thái", "Status"], ["đang làm gì (câu mới nhất)", "Doing what (latest message)"], ["lần cuối", "Last seen"], ["60 phút qua", "last 60 min"], ["ai nhắn nhiều nhất hôm nay", "Top senders today"],
    ["tin mới nhất", "Latest messages"], ["tin gần nhất", "Latest message"], ["cần anh làm", "Needs you"], ["cần anh", "Needs you"], ["tin cần anh", "NEEDS-YOU messages"], ["sổ cần anh", "Needs-you log"],
    ["✓ không ai đang chờ anh", "✓ Nobody is waiting on you"], ["đang hỏi anh (hộp chọn)", "asking you (choice box)"], ["có vẻ chờ anh trả lời", "seems to be waiting for your reply"], ["có vẻ dừng vì cần anh", "seems stopped, needs you"],
    ["có vẻ xin anh quyết", "seems to need your decision"], ["· anh đã trả lời, chờ người hỏi đóng", "· you replied, waiting for the asker to close it"], ["có vẻ", "seems"], ["ẩn mục này trên máy này", "Hide this item on this machine"],
    ["độ khớp sổ dev (7 ngày)", "DEV log match (7 days)"], ["khớp sổ", "log match"], ["dòng đọc được", "lines readable"], ["tất cả dòng đều ghép được.", "All lines could be matched."], ["dòng gốc (chưa ghép được):", "Raw line (unmatched):"],
    ["văn phòng chưa ghép được dòng này với dòng đóng lượt (cùng gói + sha), nên không tự suy kết quả. dòng gốc:", "The office could not match this line with a turn-closing line (same package + SHA), so it does not infer a result. Raw line:"],
    ["ban điều hành", "Management"], ["phòng điều phối", "Coordination"], ["kiểm tra & duyệt", "Review & approval"], ["studio claude", "Claude studio"],     ["chưa đọc được nhật ký", "log not readable yet"], ["chưa đọc được sổ", "ledger not readable yet"], ["đang chạy", "running"], ["đã cho nghỉ", "released"], ["đang họp", "in a meeting"],
    ["đứng yên", "idle for"], ["chưa đạt", "not passed"], ["đã đạt", "passed"], ["đạt", "passed"], ["đã trống", "free for"],     ["sửa nhiều nhất", "most revisions"], ["sửa", "revisions"], ["phiên", "sessions"], ["tin hôm nay", "messages today"], ["không rõ", "unknown"], ["lỗi ·", "errors ·"], ["gói:", "Package:"],
    ["ghi chú mới nhất:", "Latest note:"], ["tắt", "off"], ["đã xem", "seen"], ["đóng", "Close"],     // ---- công việc ----
    ["việc đang áp dụng", "Active tasks"], ["nhật ký quyết định", "Decision log"], ["mới nhất trên cùng", "newest first"], ["tiến độ các gói", "Package progress"], ["việc hôm nay · quyết định · gói · chờ anh", "Today's work · decisions · packages · waiting on you"],
    ["chủ:", "Owner:"], ["chưa giao", "unassigned"], ["để làm gì:", "Purpose:"], ["chưa làm", "to do"], ["chưa bắt đầu", "not started"],     ["lựa chọn:", "Options:"], ["đang dở:", "In progress:"], ["đang dừng:", "Paused:"], ["quá hạn", "overdue"], ["đúng hạn", "on time"], ["hạn", "Due"],
    ["chưa có lượt solidworks", "no SolidWorks turns yet"], ["đổi lần cuối", "last changed"], ["gói đổi trong 6 giờ", "packages changed in 6 h"], ["gói", "package"], ["việc đạt", "tasks passed"], ["phần đạt", "parts passed"], ["phần", "parts"],
    ["mục chờ trong sổ", "open items in the ledger"], ["mục văn phòng thấy", "items seen by the office"],     // ---- nội quy ----
    ["luật chung · cấp bậc · ai làm gì · sổ tay", "Shared rules · ranks · who does what · notebook"], ["cấp bậc & đội ngũ", "Ranks & team"], ["cấp bậc & quyền (cap-bac.md)", "Ranks & permissions (CAP-BAC.md)"],
    ["sổ tay", "Notebook"], ["bài học", "Lessons"], ["việc để sau", "Later"], ["từ điển", "Glossary"], ["tìm trong sổ tay…", "Search the notebook…"], ["bản gọn", "Summary"], ["phần đầu", "Intro"],
    ["nháp chờ duyệt", "DRAFT pending approval"], ["mới đổi", "recently changed"], ["mới", "NEW"], ["nháp", "draft"], ["gặp ở:", "Seen at:"], ["ví dụ:", "Example:"], ["có trong văn phòng", "In the office"], ["chưa thấy phiên", "No session yet"],
    ["chưa có nội quy: tạo data/noi-quy.md (setup đã chép khung mẫu) hoặc agents.md / claude.md trong dự án.", "No rules yet: create data/NOI-QUY.md (setup copies a template) or AGENTS.md / CLAUDE.md in the project."],
        // ---- tổng quan ----
    ["việc gì · ai làm · tới đâu · nghẽn ở đâu", "What · who · how far · where it is stuck"], ["việc đang làm theo thứ tự ưu tiên", "Tasks in priority order"], ["việc đang làm", "Active tasks"], ["các bot đang làm gì", "What each bot is doing"],
    ["đỏ: rảnh mà còn việc, hoặc im quá 2 giờ khi còn việc", "red: idle with work left, or silent over 2 h with work left"], ["rảnh mà còn việc", "idle but has work"], ["im > 2 giờ", "silent > 2 h"],
    ["tạm dừng", "On hold"], ["chỉ xem. thứ tự việc lấy từ", "View only. Task order comes from"], ["tiến độ mới nhất", "Latest progress"], ["việc · để làm gì", "Task · purpose"], ["chủ · duyệt", "Owner · reviewer"],
    ["không có.", "None."], ["lỗi máy chủ:", "Server error:"], ["chưa gắn mục viec.json", "not linked to a viec.json item"], ["còn ghi điều kiện chờ", "still has a waiting condition"],
    ["có nhắc mã mục; số tin là tin hòm thư chưa đóng. làm mới 10 giây một lần.", "mentions an item code; message count = unclosed inbox messages. Refreshes every 10 s."], ["đang cần", "Needed"],
    ["cập nhật", "Updated"], ["duyệt:", "Review:"], ["tin chưa đóng", "open messages"], ["nhắc ≥2:", "reminded ≥2:"], ["dòng cuối gói, chưa nhắc", "last line of the package, no mention of"], ["không mã", "no code"], ["dòng tiến độ là dòng mới nhất trong", "the progress line is the newest line in"],
    ["trạng thái đạt lấy từ", "the passed status comes from"], ["việc đã đạt", "tasks passed"], ["bot im > 2 giờ còn việc", "bots silent > 2 h with work left"], ["còn việc", "has work"],
    // ---- hòm thư ----
    ["phiên nào đang tắc · chỉ xem", "Which sessions are stuck · view only"], ["theo từng vai", "By role"], ["tin chưa xong", "Unfinished messages"], ["chưa xong", "Unfinished"], ["chưa đọc", "Unread"],
    ["chờ > 1 giờ", "Waiting > 1 h"], ["đọc ≥ 3 lần", "Read ≥ 3 times"], ["tin cũ nhất", "Oldest message"], ["cần người (đọc ≥ 3)", "Needs a person (read ≥ 3)"], ["người nhận chưa mở", "recipient has not opened"],
    ["là tin người nhận đã đọc đi đọc lại mà chưa làm xong: cần người vào xem.", "is a message the recipient re-read repeatedly without finishing: a person should look."], ["đọc lại mà chưa xong", "re-read but unfinished"],
    ["sắp theo mức tắc: đọc ≥ 3 lần → chờ quá 1 giờ → nhiều tin", "Sorted by blockage: read ≥ 3 times → waiting over 1 h → most messages"], ["lần nào. làm mới 30 giây một lần.", "times. Refreshes every 30 s."],
    ["văn phòng chỉ đọc hòm thư, không gửi, sửa hay đóng tin; mọi tin đi qua công cụ", "The office only reads the inbox; it never sends, edits or closes messages. All messages go through the tool"], ["chưa đóng", "open"],
    // ---- đánh giá ----
    ["hiệu suất · token · xếp loại", "Performance · tokens · grades"], ["cập nhật số liệu", "Update figures"], ["cập nhật your usage", "Update Your usage"], ["phiên hiện tại (% đã dùng)", "Current session (% used)"],
    ["phiên đặt lại lúc", "Session resets at"], ["tuần này (% đã dùng)", "This week (% used)"], ["tuần đặt lại", "Week resets"], ["đã chi tháng này ($)", "Spent this month ($)"], ["hạn mức chi tháng ($)", "Monthly spend limit ($)"],
    ["ghi chú / cảnh báo", "Note / warning"], ["gói", "Plan"], ["lưu", "Save"], ["hủy", "Cancel"],
    ["số liệu nhập tay từ claude.ai → settings → usage; trang này không tự đọc được.", "Entered by hand from claude.ai → Settings → Usage; this page cannot read it automatically."],
    ["token 24 giờ", "Tokens, 24 h"], ["token mới 24 giờ", "New tokens, 24 h"], ["token 7 ngày", "Tokens, 7 days"], ["token theo giờ · 24 giờ qua", "Tokens per hour · last 24 h"], ["token theo ngày · 7 ngày", "Tokens per day · 7 days"],
    ["token theo giờ, 24 giờ qua · cao nhất", "Tokens per hour, last 24 h · peak"], ["token theo ngày · 7 ngày", "Tokens per day · 7 days"], ["token mới / giờ", "New tokens / h"], ["token mới", "new tokens"], ["token 24h", "tokens 24 h"],
    ["phần tính đủ giá", "billed at full price"], ["tổng", "total"], ["đọc lại từ đệm", "re-read from cache"], ["nhân sự ai", "AI staff"], ["xếp loại", "Grades"], ["loại c", "grade C"], ["loại d", "grade D"], ["chưa đủ số liệu", "not enough data"],
    ["bảng xếp loại nhân sự", "Staff grading table"], ["kết quả /40", "Results /40"], ["tin cậy /20", "Reliability /20"], ["chăm chỉ /20", "Diligence /20"], ["tiết kiệm /20", "Efficiency /20"],
    ["giờ làm 24h", "Work h 24 h"], ["việc xong 24h", "Done 24 h"], ["lỗi lệnh", "Command errors"], ["tin 24h", "Msgs 24 h"], ["đệm", "Cache"], ["24 giờ", "24 h"], ["lúc này", "Now"], ["loại", "Grade"], ["điểm", "Score"], ["nhân sự", "Staff"],
    ["kết quả", "Results"], ["tin cậy", "Reliability"], ["chăm chỉ", "Diligence"], ["tiết kiệm", "Efficiency"], ["nhận xét", "NOTES"], ["đầu ra 24 giờ", "Output, 24 h"], ["mới 24 giờ", "New, 24 h"], ["mới 7 ngày", "New, 7 days"], ["đệm 7 ngày", "Cache, 7 days"],
    ["token theo ngày", "TOKENS PER DAY"], ["vào làm", "joined"], ["lượt việc xong trong 24 giờ", "tasks done in 24 h"], ["lượt trong 7 ngày", "in 7 days"], ["lượt đạt", "turns passed"], ["lượt chưa đạt", "turns not passed"],
    ["lần lỗi trên", "errors out of"], ["lệnh/công cụ trong 24 giờ", "commands/tools in 24 h"], ["chưa chạy lệnh nào trong 24 giờ", "No commands run in 24 h"], ["chưa có lượt solidworks trong 7 ngày", "No SolidWorks turns in 7 days"],
    ["người mới", "new staff"], ["giờ làm", "work hours"], ["việc xong", "done"], ["chưa thấy nhật ký", "no log yet"], ["dưới 50.", "below 50."], ["từ 80,", "from 80,"], ["từ 65,", "from 65,"], ["từ 50,", "from 50,"], ["tỷ", "B"],
    ["cách chấm (100 điểm, đo từ nhật ký thật):", "How scoring works (100 points, measured from real logs):"],
    ["kết quả 40: số lượt việc làm xong trong 24 giờ (claude: câu trả lời kết thúc lượt) mỗi lượt +4, cộng lượt solidworks 7 ngày (đạt +12, chưa đạt −4).", "Results 40: tasks completed in 24 h (Claude: a reply that ends the turn), +4 each, plus SolidWorks turns over 7 days (passed +12, not passed −4)."],
    ["tin cậy 20: tỉ lệ lệnh/công cụ chạy không lỗi trong 24 giờ (lỗi 25% trở lên = 0; chưa chạy lệnh nào tính 15). chăm chỉ 20: số giờ có hoạt động trong 24 giờ (10 giờ trở lên = đủ).", "Reliability 20: share of commands/tools that ran without error in 24 h (25% errors or more = 0; no commands run = 15). Diligence 20: hours with activity in 24 h (10 h or more = full)."],
    ["\"token mới\" là phần tính đủ giá (đầu vào chưa có trong bộ nhớ đệm + đầu ra); \"đệm\" là phần đọc lại ngữ cảnh cũ, rẻ hơn nhiều. claude tính cả phiên con (subagent). điểm là số đo tham khảo, không thay đánh giá chất lượng code.",
      "\"New tokens\" are billed at full price (input not in the cache + output); \"cache\" is re-read context, much cheaper. Claude includes sub-sessions (subagents). Scores are a reference measure, not a code-quality review."],
    ["tiết kiệm 20: token mới mỗi giờ làm so với mức giữa của đội cùng nền tảng (bằng hoặc thấp hơn = đủ điểm, gấp 4 lần = 0).", "Efficiency 20: new tokens per working hour vs the team median (equal or lower = full score, 4× = 0)."],
    // ---- tin nhắn ----
    ["giám đốc giao việc · các phiên nhắn nhau · 24 giờ", "Owner's assignments · session-to-session messages · 24 h"], ["tất cả", "All"], ["việc giám đốc giao", "Assignments from the owner"], ["hiệu suất", "Performance"],
    ["chưa có tin nào trong 24 giờ qua.", "No messages in the last 24 h."],
    ["chỉ xem. văn phòng đọc tin từ nhật ký phiên (tin bạn gõ cho phiên, và tin các phiên gửi nhau bằng sendmessage). chuỗi giống khóa đã được che. tự làm mới 3 giây một lần.", "View only. The office reads messages from session logs (what you typed to a session, and messages sessions send each other with SendMessage). Key-like strings are masked. Refreshes every 3 s."],
    // ---- ô nhắn tin cho agent ----
    ["gõ tin cho agent… (ctrl+enter để gửi)", "Type a message to the agent… (Ctrl+Enter to send)"], ["nhắn cho", "Message"], ["gửi không được.", "Could not send."], ["hiện mã pin cho điện thoại", "Show PIN for phone"], ["mã pin:", "PIN:"], ["mã pin", "PIN"],
    ["chỉ hiện trên máy này", "shown on this machine only"], ["sai mã pin.", "Wrong PIN."], ["mở khóa", "Unlock"], ["không kết nối được máy chủ văn phòng.", "Cannot reach the office server."], ["vào hòm thư · agent đọc ở cuối lượt", "to inbox · the agent reads it at the end of its turn"],
    ["tin vào hòm thư", "Message goes to the inbox"], ["agent đọc bằng vp tiep ở cuối mỗi lượt (đã cài theo huong-dan-cho-agent.md). việc hệ trọng (production, khóa, tiền, xóa dữ liệu) thì gõ thẳng trong phiên. mã phiên:", "the agent reads it with vp tiep at the end of each turn (set up per HUONG-DAN-CHO-AGENT.md). For critical matters (production, keys, money, deleting data) type directly in the session. Session ID:"],
    // ---- đơn vị thời gian (đặt cuối: ngắn nhất) ----
    ["mỗi giờ", "per hour"], ["trước", "ago"], ["giây", "s"], ["phút", "min"], ["giờ", "h"], ["ngày", "d"], ["lượt", "turns"],     ["thứ hai", "Mon"], ["thứ ba", "Tue"], ["thứ tư", "Wed"], ["thứ năm", "Thu"], ["thứ sáu", "Fri"], ["thứ bảy", "Sat"], ["chủ nhật", "Sun"],
    // ---- cảnh báo từ máy chủ ----
    ["dev trống", "DEV idle"], ["hàng chờ còn", "queue still has"], ["lượt dev đã giữ", "DEV turn held for"], ["đang bị chặn", "is blocked"], ["chỉ còn", "only"], ["không khỏe hơn 3 phút", "unhealthy for over 3 min"],
    ["hòm thư:", "Inbox:"], ["tin đã đọc lại ≥ 2 lần mà chưa xong", "messages re-read ≥ 2 times but unfinished"], ["đang báo bị chặn, cần người gỡ.", "Reported as blocked; a person needs to unblock."],
    ["làm xong", "Completed"], ["lượt việc trong", "tasks in"], ["giờ trong 24 giờ qua", "h in the last 24 h"], ["lượt việc trong", "tasks in"], ["lần lỗi", "errors"], ["giờ trong 24 giờ qua", "h in the last 24 h"], ["giờ trong 7 ngày", "h in 7 days"],
    ["token mới mỗi giờ làm", "new tokens per working hour"], ["mức giữa của đội claude", "the Claude team median"],     ["token đọc lại từ bộ nhớ đệm: phiên hay đổi ngữ cảnh, tốn hơn.", "of tokens re-read from the cache: the session switches context often, which costs more."],
  ];
  // bỏ trùng khóa, giữ bản đầu; sắp dài trước ngắn
  const map = new Map(); for (const [k, v] of D) if (!map.has(k)) map.set(k, v);
  const keys = [...map.keys()].sort((a, b) => b.length - a.length);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(?<![\\p{L}\\p{N}])(?:" + keys.map(esc).join("|") + ")(?![\\p{L}\\p{N}])", "giu");
  const VI = /[À-ỹ]/;
  const tr = (text) => {
    if (!VI.test(text)) return text;
    return text.replace(re, (m) => {
      const en = map.get(m.toLowerCase()); if (en == null) return m;
      const letters = m.replace(/[^A-Za-zÀ-ỹ]/g, "");
      if (letters.length > 2 && letters === letters.toUpperCase()) return en.toUpperCase();
      if (/^[A-ZÀ-Ỹ]/.test(m) && /^[a-z]/.test(en)) return en[0].toUpperCase() + en.slice(1);
      return en;
    });
  };
  const ATTR = ["title", "placeholder", "aria-label", "alt"];
  const fixNode = (n) => {
    if (n.nodeType === 3) {
      const p = n.parentNode; if (p && (p.nodeName === "SCRIPT" || p.nodeName === "STYLE")) return;
      if (p && p.closest && p.closest('[translate="no"],.doing,.mdoing,.txt,.tk,.feed .it,#list')) return;
      const v = n.nodeValue, t = tr(v); if (t !== v) n.nodeValue = t;
    } else if (n.nodeType === 1) {
      if (n.nodeName === "SCRIPT" || n.nodeName === "STYLE" || n.getAttribute("translate") === "no") return;
      for (const a of ATTR) { const v = n.getAttribute(a); if (v && VI.test(v)) { const t = tr(v); if (t !== v) n.setAttribute(a, t); } }
      const v = n.getAttribute("data-tip"); if (v && VI.test(v)) { const t = tr(v); if (t !== v) n.setAttribute("data-tip", t); }
      for (let c = n.firstChild; c; c = c.nextSibling) fixNode(c);
    }
  };
  const obs = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === "childList") m.addedNodes.forEach(fixNode);
      else if (m.type === "characterData") fixNode(m.target);
      else if (m.type === "attributes") fixNode(m.target);
    }
  });
  obs.observe(document, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...ATTR, "data-tip"] });
  document.addEventListener("DOMContentLoaded", () => { fixNode(document.documentElement); if (VI.test(document.title)) document.title = tr(document.title); });
})();
