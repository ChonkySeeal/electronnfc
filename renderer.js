let pageId;

document
  .getElementById("borrow")
  .addEventListener("click", electronAPI.borrowBtn);

electronAPI.scannedBook(function (event, dto) {
  console.dir(dto, { colors: true, depth: 20 });
  pageId = dto.id;
  electronAPI.requestNfc();
});

electronAPI.scannedPerson(function (event, dto) {
  console.dir(dto, { colors: true, depth: 20 });
});

function resetForm() {
  document.getElementById("category").innerHTML = "분야: ";
  document.getElementById("status").innerHTML = "대출 상태: ";
  document.getElementById("name").innerHTML = "제목: ";
  document.getElementById("author").innerHTML = "지은이: ";
  document.getElementsByClassName("btnDiv")[0].style.display = "none";
  document.getElementsByClassName("scanInfo")[0].style.display = "none";
}
