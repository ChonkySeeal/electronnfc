


const { ipcRenderer } = require('electron')
console.log("am I being read?????????????")
  ipcRenderer.on('attach-device', (sender, message) => {
    console.log("testes")
    const messageSpan = document.getElementById('message')
    messageSpan.innerText = message.message
  })
ipcRenderer.on('remove-device', (sender, message) => {
    console.log("testes")
    const messageSpan = document.getElementById('message')
    messageSpan.innerText = message.message
  })
ipcRenderer.on('card', (sender, message) => {
    console.log("testes")
    const messageSpan = document.getElementById('message')
    const cardSpan = document.getElementById('card')
    messageSpan.innerText = message.message
    cardSpan.innerText = message.card.uid
  })
