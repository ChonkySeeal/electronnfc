electronAPI.BookScan((_event, dto) => {
  console.log(dto)
 
  
  let showTitle = document.querySelector("#name");
  let showAuthor = document.querySelector("#author");
  let person = document.querySelector("#person");
  let status = dto.status;
  showTitle.innerHTML = dto.title;
  showAuthor.innerHTML = dto.author;
  person.innerHTML = dto.person;

  if(status== "대출 가능") {
    const h1 = document.getElementById("buttonDiv");
    const button = "<button id=registeredbutton > 대출 </button>";
    const button2 = "<button id=canclebutton > 취소 </button>";
    h1.insertAdjacentHTML("afterend", button);
    h1.insertAdjacentHTML("afterend", button2);
    document
      .getElementById("registeredbutton")
      .addEventListener("click", electronAPI.clicked);

  } else {
    person.innerHTML = dto.person
  }
});



