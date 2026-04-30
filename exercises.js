// ============================================
// MÁY CHẤM BÀI – Exercise Data
// Cấu hình môn học và bài tập
// Thêm môn mới: thêm object vào mảng SUBJECTS
// ============================================

const SUBJECTS = [
  {
    id: "pttkgt",
    name: "PT & TKGT",
    fullName: "Phân tích & Thiết kế Giải thuật",
    icon: "🧮",
    chapters: [
      {
        id: "ch1",
        name: "Chapter 1 – Analysis of Algorithm Efficiency",
        exercises: [
          { id: "ch1_ex1", title: "Bài 1: So sánh bậc tăng trưởng (Order of Growth)", desc: "So sánh n(n+1) vs 2000n³, log₂n vs ln n, 2^(n−1) vs 2^n" },
          { id: "ch1_ex2", title: "Bài 2: Ký hiệu O, Ω, Θ", desc: "Xác định đúng/sai các khẳng định sử dụng O, Ω, Θ" },
          { id: "ch1_ex3", title: "Bài 3: Chứng minh ký hiệu tiệm cận", desc: "Chứng minh t(n)=O(g(n)) → g(n)=Ω(t(n)), Θ(αg(n))=Θ(g(n))" },
          { id: "ch1_ex4", title: "Bài 4: Algorithm Mystery", desc: "Phân tích thuật toán Mystery: tính S = Σ(i*i), basic operation, complexity" },
          { id: "ch1_ex5", title: "Bài 5: Tổng n lập phương (đệ quy)", desc: "Thuật toán đệ quy S(n) = 1³+2³+...+n³, complexity, so sánh non-recursive" },
          { id: "ch1_ex6", title: "Bài 6: Algorithm Q(n)", desc: "Lập hệ thức truy hồi, giải và tính complexity" },
          { id: "ch1_ex7", title: "Bài 7: Tính 2^n bằng đệ quy", desc: "Thiết kế thuật toán đệ quy 2^n = 2^(n-1) + 2^(n-1), phân tích complexity" },
          { id: "ch1_ex8", title: "Bài 8: Algorithm Riddle", desc: "Phân tích Riddle(A[0..n-1]): tìm max/min, complexity" }
        ]
      },
      {
        id: "ch2",
        name: "Chapter 2 – Brute Force",
        exercises: [
          { id: "ch2_ex1", title: "Bài 1: Tính aⁿ brute-force", desc: "Viết thuật toán brute-force tính aⁿ, phân tích complexity" },
          { id: "ch2_ex2", title: "Bài 2: Tính đa thức p(x)", desc: "Brute-force tính p(x) = aₙxⁿ + ... + a₁x + a₀, cải tiến thành O(n)" },
          { id: "ch2_ex3", title: "Bài 3: Đếm chuỗi con A...B", desc: "Đếm số chuỗi con bắt đầu bằng A, kết thúc bằng B trong text" },
          { id: "ch2_ex4", title: "Bài 4: Closest-pair (1D)", desc: "Thuật toán tốt hơn brute-force cho closest-pair trên đường thẳng" },
          { id: "ch2_ex5", title: "Bài 5: Closest-pair (k chiều)", desc: "Bài toán closest-pair trong không gian k chiều" }
        ]
      },
      {
        id: "ch3",
        name: "Chapter 3 – Divide and Conquer",
        exercises: [
          { id: "ch3_ex1", title: "Bài 1: Tìm phần tử lớn nhất (D&C)", desc: "Divide-and-conquer tìm vị trí phần tử lớn nhất trong mảng" },
          { id: "ch3_ex2", title: "Bài 2: Tính aⁿ (D&C)", desc: "Divide-and-conquer tính aⁿ, so sánh brute-force" },
          { id: "ch3_ex3", title: "Bài 3: Sắp xếp âm trước dương", desc: "Sắp xếp mảng: phần tử âm đứng trước phần tử dương, O(n) time + O(1) space" },
          { id: "ch3_ex4", title: "Bài 4: Closest-pair 1D (D&C)", desc: "Divide-and-conquer cho closest-pair trên đường thẳng thực" }
        ]
      },
      {
        id: "ch4",
        name: "Chapter 4 – Decrease and Conquer",
        exercises: [
          { id: "ch4_ex1", title: "Bài 1: Khoảng cách 2 số gần nhất (presorting)", desc: "Presorting-based: tìm |x−y| nhỏ nhất trong mảng" },
          { id: "ch4_ex2", title: "Bài 2: Giao của hai tập hợp", desc: "Tìm C = A ∩ B, brute-force vs presorting" },
          { id: "ch4_ex3", title: "Bài 3: Tìm cặp có tổng bằng s", desc: "Tìm trong mảng có cặp (aᵢ, aⱼ) sao cho aᵢ + aⱼ = s" },
          { id: "ch4_ex5", title: "Bài 5: Cặp số có tích lớn nhất", desc: "Tìm cặp (a,b) sao cho a+b=n và a*b lớn nhất" }
        ]
      },
      {
        id: "ch5",
        name: "Chapter 5 – Dynamic Programming",
        exercises: [
          { id: "ch5_ex1", title: "Bài 1: Hệ số nhị thức C(n,k)", desc: "DP tính C(n,k) không dùng phép nhân" },
          { id: "ch5_ex2", title: "Bài 2: Đổi tiền (minimum coins)", desc: "DP tìm số đồng xu ít nhất có tổng bằng n" },
          { id: "ch5_ex3", title: "Bài 3: Coin Row Problem", desc: "DP chọn lượng coin tối đa: 7, 1, 3, 8, 5, 3" },
          { id: "ch5_ex4", title: "Bài 4: Knapsack Problem", desc: "DP bài toán ba lô: w=[3,2,5,2], v=[13,11,22,17], W=7" },
          { id: "ch5_ex5", title: "Bài 5: Unbounded Knapsack", desc: "DP knapsack với số lượng không giới hạn mỗi loại" },
          { id: "ch5_ex6", title: "Bài 6: Shortest Path Counting (Rook)", desc: "DP đếm số đường đi ngắn nhất của quân xe trên bàn cờ" }
        ]
      },
      {
        id: "ch6",
        name: "Chapter 6 – Greedy Technique",
        exercises: [
          { id: "ch6_ex1", title: "Bài 1: Assignment Problem (Greedy)", desc: "Gán n người vào n công việc với chi phí tối thiểu" },
          { id: "ch6_ex3", title: "Bài 3: Graph Coloring", desc: "Tô màu đồ thị bằng thuật toán greedy" }
        ]
      },
      {
        id: "ch7",
        name: "Chapter 7 – Backtracking & Branch-and-Bound",
        exercises: [
          { id: "ch7_ex1", title: "Bài 1: Hoán vị {1,2,...,n}", desc: "Backtracking sinh tất cả hoán vị, tính complexity" },
          { id: "ch7_ex2", title: "Bài 2: Xâu nhị phân không có 00", desc: "Backtracking sinh xâu nhị phân độ dài n không có hai số 0 liên tiếp" },
          { id: "ch7_ex3", title: "Bài 3: Xâu nhị phân không có 11", desc: "Backtracking sinh xâu nhị phân độ dài n không có hai số 1 liên tiếp" },
          { id: "ch7_ex4", title: "Bài 4: TSP (Branch-and-Bound)", desc: "Branch-and-Bound tìm đường đi ngắn nhất bài toán người bán hàng" }
        ]
      }
    ]
  }
  // ---- THÊM MÔN MỚI TẠI ĐÂY ----
  // {
  //   id: "ctdl",
  //   name: "CTDL & GT",
  //   fullName: "Cấu trúc dữ liệu & Giải thuật",
  //   icon: "📊",
  //   chapters: [ ... ]
  // }
];
