electronAPI.ScanCallBack((_event, dto) => {
  console.log(dto);
  let showNFC = document.querySelector("#nfc");
  let showTitle = document.querySelector("#name");
  let showAuthor = document.querySelector("#author");

  showTitle.innerHTML = dto.title;
  showNFC.innerHTML = dto.nfc;
  showAuthor.innerHTML = dto.author;
});
