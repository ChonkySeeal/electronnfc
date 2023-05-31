electronAPI.ScanBook((event, dto) => {
  console.dir(dto, { colors: true, depth: 20 });
  let showCategory = document.getElementById("category");
  let showStatus = document.getElementById("status");
  let showTitle = document.getElementById("name");
  let showAuthor = document.getElementById("author");

  const status =
    dto.properties["상태"].status.id == "387caf66-e381-4bfa-bddc-ef3c33b1670e"
      ? true
      : false;

  showTitle.innerHTML = dto.properties["제목"].title[0].plain_text
    ? "제목: " + dto.properties["제목"].title[0].plain_text
    : "제목: ";
  showAuthor.innerHTML = dto.properties["저자"].rich_text[0].plain_text
    ? "지은이: " + dto.properties["저자"].rich_text[0].plain_text
    : "지은이:";
  showStatus.innerHTML = dto.properties["상태"].status.name
    ? "대출 상태: " + dto.properties["상태"].status.name
    : "대출 상태: ";
  showCategory.innerHTML = dto.properties["분야"].multi_select[0].name
    ? "분야: " + dto.properties["분야"].multi_select[0].name
    : "분야: ";
  if (status) {
    document.getElementsByClassName("btnDiv")[0].style.display = "inline";
    document.getElementById("borrow").addEventListener("click", () => {
      electronAPI.BorrowBook(dto.id);
      document.getElementsByClassName("scanInfo")[0].style.display = "inline";
    });
  } else {
    const borrower = document.getElementById("borrower");
    borrower.innerHTML = dto.properties["대출한 사람"].people.name
      ? dto.properties["대출한 사람"].people.name
      : "대출한 사람 이름이 기입 되지 않음";
  }
  setTimeout(resetForm, 60000);
});

function resetForm() {
  document.getElementById("category").innerHTML = "분야: ";
  document.getElementById("status").innerHTML = "대출 상태: ";
  document.getElementById("name").innerHTML = "제목: ";
  document.getElementById("author").innerHTML = "지은이: ";
  document.getElementsByClassName("btnDiv")[0].style.display = "none";
  document.getElementsByClassName("scanInfo")[0].style.display = "none";
}
