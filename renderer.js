





electronAPI.ScanCallBack((_event, dto) => {
    console.log(dto)
    let showNFC = document.querySelector("#nfc");
    
    let showTitle = document.querySelector("#name");
    let showAuthor = document.querySelector("#author");
    
    console.log(dto.properties["力格"].title)
    console.log(dto.properties["力格"].plain_text)
    let title = document.createTextNode(dto.properties["力格"].title[0].plain_text);
    console.log(title)
    
    let author = document.createTextNode(dto.properties["历磊"].title[0].plain_text);
    showTitle.appendChild(title);
    showAuthor.appendChild(author);
})

