document.getElementById("borrow").addEventListener("click", electronAPI.borrow);
document.getElementById("return").addEventListener("click", electronAPI.return);

electronAPI.scannedBook(function (event, dto) {
  electronAPI.borrower();
});
electronAPI.loading(loading);
function resetForm() {
  document.getElementById("category").innerHTML = "분야: ";
  document.getElementById("status").innerHTML = "대출 상태: ";
  document.getElementById("name").innerHTML = "제목: ";
  document.getElementById("author").innerHTML = "지은이: ";
  document.getElementsByClassName("btnDiv")[0].style.display = "none";
  document.getElementsByClassName("scanInfo")[0].style.display = "none";
}

function loading() {
  document.getElementById("spinner").style.display = "block";
}
