/* eslint-disable max-len */
const createGuidelinesWorksheet = (workbook) => {
  const guidelinesWorksheet = workbook.addWorksheet("Guidelines");

  // Add and merge header row
  guidelinesWorksheet.mergeCells("A1:C1");
  const headerCell = guidelinesWorksheet.getCell("A1");
  headerCell.value = "HƯỚNG DẪN CÁCH DÙNG FILE INPUT MATCHING THEORY";

  // Set styles for header cell
  headerCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "ADD8E6" }, // Light blue color
  };
  headerCell.alignment = { vertical: "middle", horizontal: "center" };

  // Adjust column widths
  guidelinesWorksheet.getColumn("A").width = 25;
  guidelinesWorksheet.getColumn("B").width = 100;
  guidelinesWorksheet.getColumn("C").width = 25;

  // Add second row with styles
  const cellValues = ["TÊN Ô", "CHỨC NĂNG", "GHI CHÚ"];
  const cellStyles = [
    { bgColor: "8a52f2", textColor: "ffffff" },
    { bgColor: "0c6125", textColor: "ffffff" },
    { bgColor: "d479d2", textColor: "ffffff" },
  ];

  cellValues.forEach((value, index) => {
    const cell = guidelinesWorksheet.getCell(
      `${String.fromCharCode(65 + index)}2`,
    );
    cell.value = value;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: cellStyles[index].bgColor },
    };
    cell.font = {
      color: { argb: cellStyles[index].textColor },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Add content rows
  const colA = [
    "Problem name",
    "Number of set",
    "Number of individuals",
    "Number of characteristics",
    "Fitness function",
    "Evaluate Function set_1",
    "Evaluate Function set_2",
    "Capacity",
    "Set Many",
    "Set One",
    "Requirements",
  ];

  const colB = [
    "Tên problem được lấy từ dữ liệu người dùng nhập trên trang input",
    "Số lượng các set tham gia được lấy từ dữ liệu người dùng nhập trên trang input",
    "Số lượng tất cả các cá thể ở mỗi set tham gia được lấy từ dữ liệu người dùng nhập trên trang input",
    "Tổng số lượng các thuộc tính của các cá thể tham gia được lấy từ dữ liệu người dùng nhập trên trang input",
    `
    Hàm fitness được lấy từ dữ liệu người dùng nhập trên trang input
    Cách nhập hàm:
    Hiện tại, evaluate function có thể xử lý theo 3 loại biến:
    *$: R: requirement của các individual đối với 1 characteristic cụ thể
    *$: P: properties của các individidual đối với 1 characteristic cụ thể
    *$: W: trọng số của characteristic đối với individual (characteristic đó quan trọng ở mức nào đối với inidividual)
     *$: Ví dụ cụ thể: P1*R1*W1+P2*R2*W2 sẽ là hàm mà phần mềm có thể xử lý được. Phần mềm không xử lý kiểu hàm cũ, trừ khi người dùng để default
     * $: i - index of MatchSet in "matches"
             * $: set - value (1 or 2) represent set 1 (0) or set 2 (1)
             * $: S(set) - Sum of all payoff scores of "set" evaluate by opposite set
             * $: M(i) - Value of specific matchSet's satisfaction eg: M0 (satisfactory of Individual no 0)
             
             * Supported functions:
             * #: SIGMA{S1} calculate sum of all MatchSet of a belonging set eg: SIGMA{S1}
             
             * Supported mathematical calculations:
             * Name:    Usage
             * 1. absolute       : abs(expression)
             * 2. exponent      : (expression)^(expression)
             * 3. sin                 : sin(expression)
             * 4. cos                 : cos(expression)
             * 5. tan                : tan(expression)
             * 6. logarithm     : log(expression)(expression)
             * 7. square root: sqrt(expression)
    `,
    "Hàm đánh giá của set 1 được lấy từ dữ liệu người dùng nhập trên trang input",
    "Hàm đánh giá của set 2 được lấy từ dữ liệu người dùng nhập trên trang input",
    "Người dùng nhập capacity của từng đối tượng (ví dụ: nếu A có thể match với 2 người thì capacity bằng 2)",
    "Set 1 là Set Many do người dùng đã tick trong phần lựa chọn ở trang input",
    "Set 2 là Set One do người dùng đã tick trong phần lựa chọn ở trang input",
    `Người dùng nhập chỉ số yêu cầu của từng cá thể
    - Về phần các characteristic của các Individual:
       + Đối với các characteristic dạng chữ, có thể phân tích thành nhiều input khác nhau không có quy luật(ví dụ như skills có thể có cooking, swimming, drawing,...): 
        Các nhóm cần chia thành từng characteristic theo các input đấy (ví dụ như skills thì sẽ tách ra thành cooking, swimming,... và để thành characteristic riêng biệt)
        và đánh giá bằng điểm số (ví dụ swimming: 10 điểm, cooking: 6 điểm).
       +  Đối với các characteristic đánh giá theo mức độ (ví dụ như low, medium, high): 
       Các nhóm cần chuyển đổi thành dạng số theo thang điểm 10 và giới hạn các mức độ theo từng mốc điểm.`,
  ];

  colA.forEach((value, index) => {
    const cellA = guidelinesWorksheet.getCell(`A${3 + index}`);
    cellA.value = value;
    cellA.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "d8bff5" },
    };
    cellA.font = { color: { argb: "FF000000" } };
    cellA.alignment = { vertical: "middle", horizontal: "left" };

    const cellB = guidelinesWorksheet.getCell(`B${3 + index}`);
    cellB.value = colB[index];
    cellB.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "b4fac7" },
    };
    cellB.font = { color: { argb: "FF000000" } };
    cellB.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
  });

  // Add notes to column C
  for (let rowNumber = 3; rowNumber <= 13; rowNumber++) {
    const cellC = guidelinesWorksheet.getCell(`C${rowNumber}`);
    cellC.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "fee6ff" },
    };
  }

  guidelinesWorksheet.mergeCells("C11:C12");
  const cellC11 = guidelinesWorksheet.getCell("C11");
  cellC11.value =
    "Phần này người dùng không cần quá quan tâm vì đây chỉ là note cho backend dễ xử lý hơn";
  cellC11.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  // Add borders
  guidelinesWorksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "b0b0b0" } },
        left: { style: "thin", color: { argb: "b0b0b0" } },
        bottom: { style: "thin", color: { argb: "b0b0b0" } },
        right: { style: "thin", color: { argb: "b0b0b0" } },
      };
    });
  });
};

export default createGuidelinesWorksheet;
