let bookObj;
let timerId;
initiate();

function initiate() {
  bookObj = {};
  $("#info").empty();
  $("#buttons").empty();
  $("#direction").empty();
  $("#buttons").append(`					
<button class="col-3 m-2  btn" id="borrow" style="min-width: 100px;">대출</button>
<button class="col-3 m-2  btn" id="return" style="min-width: 100px;">반납</button>
`);

  document.getElementById("borrow").addEventListener("click", () => {
    electronAPI.borrow();
    $(`
    <div class="m-5 card" style="display : none; max-height: 100px; min-width: 100px;">
      <div class="card-body notice" ">
      <p class="card-text font-weight-bold">책을 스캔해 주세요!</p>
    </div>
  </div>`)
      .appendTo("#direction")
      .show();
  });
  document.getElementById("return").addEventListener("click", () => {
    electronAPI.return();
    $(`
    <div class="m-5 card" style="display : none; max-height: 100px; min-width: 100px;">
      <div class="card-body notice" ">
      <p class="card-text font-weight-bold">책을 스캔해 주세요!</p>
    </div>
  </div>`)
      .appendTo("#direction")
      .show();
  });
}

electronAPI.reset(function (e, dto) {
  initiate();
});

electronAPI.done(function (e, dto) {
  $("#direction").empty();
  $("#buttons").empty();
  $("#info").empty();
  $(`
  <div class="card text-center" style="display : none;">
    <div class="m-5 card-body" ">
    <p class="card-text font-weight-bold">감사합니다! ${dto.name}님</p>
    <p class="card-text font-weight-bold">빌리신 책 제목 : ${dto.result.title}</p>
    <button class="col-3 m-2  btn" id="confirm" style="min-width: 100px;">확인</button>
  </div>
  
</div>`)
    .appendTo("#direction")
    .show();
  timerId = setTimeout(initiate, 10000);
  document.getElementById("confirm").addEventListener("click", function () {
    clearTimeout(timerId);
    initiate();
  });
});

electronAPI.returnOn(function (e, dto) {
  $("#direction").empty();
  $("#buttons").empty();
  $("#info").empty();
  $(`
  <div class="card text-center" style="display : none;">
    <div class="m-5 card-body" ">
    <p class="card-text font-weight-bold">반납하신 책 : ${dto.result.title}</p>
    <button class="col-3 m-2  btn" id="confirm" style="min-width: 100px;">확인</button>
  </div>
  
</div>`)
    .appendTo("#direction")
    .show();
  timerId = setTimeout(initiate, 10000);
  document.getElementById("confirm").addEventListener("click", function () {
    clearTimeout(timerId);
    initiate();
  });
});

electronAPI.scannedBook(function (e, dto) {
  $("#direction").empty();
  bookObj = dto.result;
  electronAPI.borrower();
  $("#return").remove();
  $(
    `<button class="col-3 m-2  btn" id="cancel" style="display : none; min-width: 100px;">취소</button>`
  )
    .appendTo("#buttons")
    .show("slow", function () {
      document
        .getElementById("cancel")
        .addEventListener("click", electronAPI.cancel);
    });
  $(`
  <table class="table" style="display: none;">
                
                  <h2>책 정보</h2>
                  <tbody>
                    <tr>
                      <th scope="row">제목:</th>
                      <td id="name">${bookObj.title ? bookObj.title : "-"}</td>
                    </tr>
                    <tr>
                      <th scope="row">지은이:</th>
                      <td id="author">${
                        bookObj.author ? bookObj.author : "-"
                      }</td>
  
                    </tr>
                    <tr>
                      <th scope="row">분야:</th>
                      <td id="category">${
                        bookObj.category ? bookObj.category : "-"
                      }</td>
  
                    </tr>
                    <tr>
                      <th scope="row">책장번호:</th>
                      <td id="borrower">${
                        bookObj.shelfNum ? bookObj.shelfNum : "-"
                      }</td>
                    </tr>
                  </tbody>
                </table>`)
    .appendTo("#info")
    .show("slow");
  $(`<div class="m-5 card" style="display : none; max-height: 100px; min-width: 100px;">
  <div class="card-body notice" ">
  <p class="card-text font-weight-bold">사원증을 스캔해 주세요!</p>
</div>
</div>`)
    .appendTo("#direction")
    .show();
});
