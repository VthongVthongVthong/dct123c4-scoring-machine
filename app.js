// ============================================
// MÁY CHẤM BÀI – Main Application Logic
// Engine: Gemini 1.5 Flash (OCR & Reasoning)
// Pipeline: Gemini Vision -> User Confirm -> AI Grading
// ============================================

(function () {
  "use strict";

  // --- Configuration ---
  const WORKER_URL = "https://scoringmachine.huynhvienthong979.workers.dev"; // Dán link Cloudflare Worker vào đây

  // --- State ---
  const state = {
    studentInfo: null, // Lưu thông tin sinh viên sau khi login
    imageBase64: null,
    imageMimeType: null,
    selectedSubject: null,
    selectedChapter: null,
    selectedExercise: null,
    isProcessing: false,
    extractedText: "",
    cropper: null, // Lưu instance của Cropper
  };

  // --- DOM Cache ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {};

  function cacheDom() {
    dom.uploadZone = $("#upload-zone");
    dom.fileInput = $("#file-input");
    dom.previewContainer = $("#preview-container");
    dom.previewImg = $("#preview-img");
    dom.previewRemove = $("#preview-remove");
    dom.subjectSelect = $("#subject-select");
    dom.chapterSelect = $("#chapter-select");
    dom.exerciseSelect = $("#exercise-select");
    dom.chapterGroup = $("#chapter-group");
    dom.exerciseGroup = $("#exercise-group");
    dom.customPrompt = $("#custom-prompt");
    dom.analyzeBtn = $("#analyze-btn");
    
    // Stage controls
    dom.confirmPanel = $("#confirm-panel");
    dom.ocrEditArea = $("#ocr-edit-area");
    dom.confirmAnalyzeBtn = $("#confirm-analyze-btn");
    
    dom.resultsPanel = $("#results-panel");
    dom.resultContent = $("#result-content");
    dom.copyBtn = $("#copy-btn");
    dom.newAnalysisBtn = $("#new-analysis-btn");
    dom.historyList = $("#history-list");
    dom.historyClearBtn = $("#history-clear-btn");

    // Login DOM
    dom.loginOverlay = $("#login-overlay");
    dom.masvInput = $("#masv-input");
    dom.loginBtn = $("#login-btn");
    dom.appContainer = $("#app");
    dom.studentGreeting = $("#student-greeting");

    // Cropper DOM
    dom.cropperModal = $("#cropper-modal");
    dom.cropperImg = $("#cropper-img");
    dom.rotateLeft = $("#rotate-left");
    dom.rotateRight = $("#rotate-right");
    dom.cropDone = $("#crop-done");
    dom.cropCancel = $("#crop-cancel");
  }

  // --- Initialize ---
  function init() {
    cacheDom();
    bindEvents();
    populateSubjects();
    renderHistory();
    checkAuth(); // Kiểm tra trạng thái đăng nhập khi khởi tạo
  }

  // --- Event Bindings ---
  function bindEvents() {
    dom.uploadZone.addEventListener("click", () => { if (!state.imageBase64) dom.fileInput.click(); });
    dom.fileInput.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) processFile(file); });
    dom.uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); dom.uploadZone.classList.add("drag-over"); });
    dom.uploadZone.addEventListener("dragleave", () => dom.uploadZone.classList.remove("drag-over"));
    dom.uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dom.uploadZone.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    });

    dom.previewRemove.addEventListener("click", (e) => { e.stopPropagation(); clearImage(); });


    dom.subjectSelect.addEventListener("change", handleSubjectChange);
    dom.chapterSelect.addEventListener("change", handleChapterChange);
    dom.exerciseSelect.addEventListener("change", handleExerciseChange);

    // Bước 1: Gọi Gemini OCR
    dom.analyzeBtn.addEventListener("click", handleInitialOCR);

    // Bước 2: Gọi Gemini Grading
    dom.confirmAnalyzeBtn.addEventListener("click", handleFinalGrading);

    dom.copyBtn.addEventListener("click", copyResult);
    dom.newAnalysisBtn.addEventListener("click", () => {
      dom.resultsPanel.classList.remove("visible");
      dom.confirmPanel.style.display = "none";
      clearImage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    dom.historyClearBtn.addEventListener("click", clearHistory);

    // Login Events
    dom.loginBtn.addEventListener("click", handleLogin);
    dom.masvInput.addEventListener("keypress", (e) => { if (e.key === "Enter") handleLogin(); });

    // Cropper Events
    dom.rotateLeft.addEventListener("click", () => state.cropper.rotate(-90));
    dom.rotateRight.addEventListener("click", () => state.cropper.rotate(90));
    dom.cropCancel.addEventListener("click", () => {
      dom.cropperModal.style.display = "none";
      if (state.cropper) { state.cropper.destroy(); state.cropper = null; }
      dom.fileInput.value = "";
    });
    dom.cropDone.addEventListener("click", handleCropDone);
  }

  // --- Student Verification (Firebase) ---
  async function handleLogin() {
    const masv = dom.masvInput.value.trim();
    if (!masv) { showToast("Vui lòng nhập Mã số sinh viên", "error"); return; }

    setLoading(dom.loginBtn, true);

    try {
      // Giả sử dữ liệu Firebase là một mảng hoặc object các sinh viên
      // Gọi qua Cloudflare Worker
      const response = await fetch(WORKER_URL);
      const data = await response.json();

      if (!data) throw new Error("Không thể kết nối với cơ sở dữ liệu.");

      // Tìm kiếm sinh viên theo MaSV
      let student = null;
      if (Array.isArray(data)) {
        student = data.find(s => s && s.MaSV === masv);
      } else {
        // Nếu data là object (ví dụ: { "id1": {MaSV...}, "id2": {MaSV...} })
        student = Object.values(data).find(s => s && s.MaSV === masv);
      }

      if (student) {
        state.studentInfo = student;
        localStorage.setItem("mcb_student", JSON.stringify(student));
        unlockApp(student);
        showToast(`Xin chào ${student.HoLotSV} ${student.TenSV}!`, "success");
      } else {
        showToast("Mã số sinh viên không tồn tại hoặc không thuộc lớp DCT123C4", "error");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      showToast("Lỗi xác thực: " + err.message, "error");
    } finally {
      setLoading(dom.loginBtn, false);
    }
  }

  function checkAuth() {
    const saved = localStorage.getItem("mcb_student");
    if (saved) {
      state.studentInfo = JSON.parse(saved);
      unlockApp(state.studentInfo);
    }
  }

  function unlockApp(student) {
    dom.loginOverlay.style.display = "none";
    dom.appContainer.classList.add("unlocked");
    dom.studentGreeting.textContent = `👋 Chào sinh viên: ${student.HoLotSV} ${student.TenSV}`;
    dom.studentGreeting.classList.add("visible");
  }

  // --- Gemini API Gateway ---
  async function callGemini(payload) {
    // Gọi qua proxy.php thay vì gọi trực tiếp tới Google
    const url = WORKER_URL; 
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  }

  // --- Step 1: OCR Stage (Puter.js AI OCR - Free & Accurate) ---
  // --- Step 1: OCR Stage (Dùng luôn Gemini 1.5 Flash) ---
  async function handleInitialOCR() {
    if (!state.imageBase64) { showToast("Vui lòng chọn hoặc chụp ảnh bài làm", "error"); return; }
    if (state.isProcessing) return;
    
    setLoading(dom.analyzeBtn, true);
    dom.confirmPanel.style.display = "none";
    dom.resultsPanel.classList.remove("visible");

    try {
      showToast("Đang nhận diện văn bản bằng Gemini Vision...", "info");
      
      // Tách lấy phần dữ liệu Base64 thuần từ chuỗi Data URL
      const base64Data = state.imageBase64.split(",")[1];

      // Đóng gói payload chứa cả prompt yêu cầu trích xuất chữ và dữ liệu ảnh gửi lên Gemini
      const payload = {
        contents: [{
          parts: [
            { text: "Hãy trích xuất chính xác toàn bộ văn bản có trong bức ảnh này. Giữ nguyên cấu trúc, định dạng và xuống dòng. Chỉ trả về nội dung văn bản được trích xuất, tuyệt đối không thêm bất kỳ câu chào hỏi hay bình luận nào khác." },
            {
              inlineData: {
                mimeType: state.imageMimeType,
                data: base64Data
              }
            }
          ]
        }]
      };

      // Tận dụng lại hàm callGemini bạn đã viết sẵn
      const resultText = await callGemini(payload);
      
      if (!resultText) throw new Error("Không thể đọc được văn bản từ ảnh.");

      state.extractedText = resultText;
      dom.ocrEditArea.value = resultText;
      
      dom.confirmPanel.style.display = "block";
      dom.confirmPanel.scrollIntoView({ behavior: "smooth" });
      showToast("Đã đọc xong ảnh! Vui lòng kiểm tra lại văn bản.", "success");
    } catch (err) {
      console.error("Gemini OCR Error:", err);
      showToast("Lỗi khi nhận diện văn bản: " + err.message, "error");
    } finally {
      setLoading(dom.analyzeBtn, false);
    }
  }

  // --- Step 2: Analysis/Grading Stage ---
  async function handleFinalGrading() {
    const editedText = dom.ocrEditArea.value.trim();
    if (!editedText) { showToast("Nội dung văn bản không được để trống", "error"); return; }
    if (state.isProcessing) return;

    setLoading(dom.confirmAnalyzeBtn, true);

    try {
      const info = getExerciseInfo();
      const customPrompt = dom.customPrompt.value.trim();
      
      const systemPrompt = `Bạn là giảng viên đại học nhiệt huyết. Hãy chấm bài dựa trên VĂN BẢN ĐÃ ĐƯỢC XÁC NHẬN sau đây.
Yêu cầu định dạng kết quả:
1. # 🏆 Điểm: [X]/10 (Đặt ngay dòng đầu tiên)
2. ## 🔍 Phân tích logic: Giải thích cách làm và lỗi sai (nếu có) bằng ngôn ngữ cực kỳ đơn giản, dễ hiểu như đang giảng bài cho học sinh tiểu học.
3. ## 📐 Độ phức tạp: Đưa ra công thức (ví dụ O(n), O(log n)) và giải thích ngắn gọn (nếu là bài toán/lập trình).
4. ## 💡 Gợi ý tối ưu: Đề xuất thuật toán tốt hơn hoặc các mẹo làm bài nhanh, hiệu quả hơn.
LƯU Ý: Với các công thức toán học hoặc biểu thức phức tạp, hãy sử dụng định dạng LaTeX (kẹp giữa dấu $ cho công thức inline hoặc $$ cho công thức khối) để hiển thị đẹp mắt nhất.
Giọng văn truyền cảm hứng và khích lệ sinh viên.`;

      let userPrompt = `NỘI DUNG BÀI LÀM:\n${editedText}\n\n`;
      if (info) {
        userPrompt += `NGỮ CẢNH BÀI TẬP:\n- Môn: ${info.subject.fullName}\n- Bài: ${info.exercise.title}\n- Yêu cầu: ${info.exercise.desc}\n\n`;
      }
      if (customPrompt) {
        userPrompt += `YÊU CẦU THÊM: ${customPrompt}`;
      }

      const payload = {
        contents: [{
          parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
        }]
      };

      const result = await callGemini(payload);
      displayResult(result);
      saveToHistory(result, editedText);
      showToast("Phân tích hoàn tất!", "success");
    } catch (err) {
      console.error("Gemini Grading Error:", err);
      showToast("Lỗi khi phân tích: " + err.message, "error");
    } finally {
      setLoading(dom.confirmAnalyzeBtn, false);
    }
  }

  // --- Helpers ---
  function setLoading(btn, isLoading) {
    state.isProcessing = isLoading;
    if (isLoading) {
      btn.classList.add("loading");
      btn.disabled = true;
    } else {
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  }

  function displayResult(text) {
    dom.resultContent.innerHTML = marked.parse(text);
    
    // Render LaTeX formulas using KaTeX
    if (typeof renderMathInElement === "function") {
      renderMathInElement(dom.resultContent, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    }

    dom.resultsPanel.classList.add("visible");
    dom.resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function processFile(file) {
    if (!file.type.startsWith("image/")) return showToast("Chọn file ảnh!", "error");
    state.imageMimeType = file.type;
    const reader = new FileReader();
    reader.onload = (e) => {
      openCropper(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function openCropper(imageSrc) {
    dom.cropperImg.src = imageSrc;
    dom.cropperModal.style.display = "flex";
    
    if (state.cropper) state.cropper.destroy();
    
    state.cropper = new Cropper(dom.cropperImg, {
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    });
  }

  function handleCropDone() {
    if (!state.cropper) return;

    // Lấy ảnh đã cắt dưới dạng Base64 (giảm chất lượng nhẹ để tối ưu dung lượng gửi AI)
    const canvas = state.cropper.getCroppedCanvas({
      maxWidth: 2048,
      maxHeight: 2048,
    });

    const croppedBase64 = canvas.toDataURL(state.imageMimeType, 0.9);
    
    state.imageBase64 = croppedBase64;
    dom.previewImg.src = croppedBase64;
    dom.previewContainer.classList.add("visible");
    dom.uploadZone.classList.add("has-image");
    dom.uploadZone.querySelector(".upload-placeholder").style.display = "none";

    // Đóng modal
    dom.cropperModal.style.display = "none";
    state.cropper.destroy();
    state.cropper = null;
  }

  function clearImage() {
    state.imageBase64 = null;
    dom.previewContainer.classList.remove("visible");
    dom.uploadZone.classList.remove("has-image");
    dom.uploadZone.querySelector(".upload-placeholder").style.display = "";
    dom.fileInput.value = "";
  }

  function populateSubjects() {
    dom.subjectSelect.innerHTML = '<option value="">-- Chọn môn học --</option>';
    if (typeof SUBJECTS !== "undefined") {
      SUBJECTS.forEach(s => {
        const o = document.createElement("option");
        o.value = s.id; o.textContent = `${s.icon} ${s.name}`;
        dom.subjectSelect.appendChild(o);
      });
    }
  }

  function handleSubjectChange() {
    const subjId = dom.subjectSelect.value;
    state.selectedSubject = subjId || null;
    if (!subjId) { dom.chapterGroup.style.display = dom.exerciseGroup.style.display = "none"; return; }
    const subj = SUBJECTS.find(s => s.id === subjId);
    dom.chapterSelect.innerHTML = '<option value="">-- Chọn chương --</option>';
    subj.chapters.forEach(c => {
      const o = document.createElement("option");
      o.value = c.id; o.textContent = c.name; dom.chapterSelect.appendChild(o);
    });
    dom.chapterGroup.style.display = "block"; dom.exerciseGroup.style.display = "none";
  }

  function handleChapterChange() {
    const chId = dom.chapterSelect.value;
    state.selectedChapter = chId || null;
    if (!chId) { dom.exerciseGroup.style.display = "none"; return; }
    const subj = SUBJECTS.find(s => s.id === state.selectedSubject);
    const ch = subj.chapters.find(c => c.id === chId);
    dom.exerciseSelect.innerHTML = '<option value="">-- Chọn bài tập --</option>';
    ch.exercises.forEach(ex => {
      const o = document.createElement("option");
      o.value = ex.id; o.textContent = ex.title; dom.exerciseSelect.appendChild(o);
    });
    dom.exerciseGroup.style.display = "block";
  }

  function handleExerciseChange() { state.selectedExercise = dom.exerciseSelect.value || null; }

  function getExerciseInfo() {
    if (!state.selectedSubject || !state.selectedChapter || !state.selectedExercise) return null;
    const s = SUBJECTS.find(x => x.id === state.selectedSubject);
    const c = s.chapters.find(x => x.id === state.selectedChapter);
    const e = c.exercises.find(x => x.id === state.selectedExercise);
    return { subject: s, chapter: c, exercise: e };
  }

  function saveToHistory(result, raw) {
    const h = JSON.parse(localStorage.getItem("mcb_history") || "[]");
    const info = getExerciseInfo();
    h.unshift({
      id: Date.now(), timestamp: new Date().toISOString(),
      mode: "grade", subject: info?.subject.name || "Tự do",
      exercise: info?.exercise.title || "Tự do", preview: result.substring(0, 100), result
    });
    if (h.length > 20) h.pop();
    localStorage.setItem("mcb_history", JSON.stringify(h));
    renderHistory();
  }

  function renderHistory() {
    const h = JSON.parse(localStorage.getItem("mcb_history") || "[]");
    if (h.length === 0) { dom.historyList.innerHTML = '<li class="history-empty">Chưa có lịch sử</li>'; dom.historyClearBtn.style.display = "none"; return; }
    dom.historyClearBtn.style.display = "";
    dom.historyList.innerHTML = h.map(e => `
      <li class="history-item" data-id="${e.id}">
        <div class="history-icon">${e.mode === 'grade' ? '✅' : '📝'}</div>
        <div class="history-info">
          <div class="history-mode">${e.exercise}</div>
          <div class="history-date">${new Date(e.timestamp).toLocaleDateString("vi-VN")}</div>
          <div class="history-preview">${e.preview}...</div>
        </div>
        <button class="history-delete" data-id="${e.id}">✕</button>
      </li>`).join("");
    
    dom.historyList.querySelectorAll(".history-item").forEach(item => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".history-delete")) return;
        const entry = h.find(x => x.id == item.dataset.id);
        if (entry) displayResult(entry.result);
      });
    });
    dom.historyList.querySelectorAll(".history-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        let h2 = JSON.parse(localStorage.getItem("mcb_history") || "[]");
        h2 = h2.filter(x => x.id != btn.dataset.id);
        localStorage.setItem("mcb_history", JSON.stringify(h2));
        renderHistory();
      });
    });
  }

  function clearHistory() { if (confirm("Xóa lịch sử?")) { localStorage.removeItem("mcb_history"); renderHistory(); } }

  function showToast(m, t = "error") {
    let el = $(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = m; el.className = `toast ${t} visible`;
    setTimeout(() => el.classList.remove("visible"), 3000);
  }

  function copyResult() {
    navigator.clipboard.writeText(dom.resultContent.innerText).then(() => {
      dom.copyBtn.textContent = "✓ Đã chép"; setTimeout(() => dom.copyBtn.textContent = "📋 Sao chép", 2000);
    });
  }

  init();
})();
