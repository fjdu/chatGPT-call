apiKey = '';

async function sendToChatGPT() {

  const elTbody = document.getElementById('tbDialog');
  const elUserInput = document.getElementById('userInput');

  const inputText = elUserInput.value;
  elUserInput.value = '';

  const prevTextArea = document.createElement('textarea');
  prevTextArea.rows = 5;
  prevTextArea.value = inputText;
  prevTextArea.className = 'prevInput';
  prevTextArea.readOnly = true;
  elTbody.insertRow(elTbody.rows.length-2).appendChild(prevTextArea);

  const elReply = document.createElement('textarea');
  elReply.rows = 10;
  elReply.className = 'replyByChatGPT';
  elReply.type = 'text';
  elReply.id = 'replyByChatGPT';
  elReply.readOnly = true;
  elReply.placeholder = 'Reply from ChatGPT. Please wait...';
  elTbody.insertRow(elTbody.rows.length-2).appendChild(elReply);

  fetch('https://api.openai.com/v1/chat/completions',
    {method: 'POST',
     mode: 'cors',
     headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'},
     body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{role: "user",
                    content: inputText}]})})
  .then((response) => response.json())
  .then((data) => {
    replyText = data['choices'][0].message.content;
    const elReply = document.getElementById('replyByChatGPT');
    elReply.value = replyText;
    elReply.removeAttribute('id');
  });
}

function apiKeyInput() {
  apiKey = document.getElementById("apiKey").value;
  chrome.storage.local.set({'chatGPT-API-Key': apiKey}).then(() => {
  });
}

document.addEventListener('DOMContentLoaded',
function() {
  chrome.storage.local.get(["chatGPT-API-Key"]).then((result) => {
    if ((result !== undefined) && (result !== 'undefined')) {
      console.log(result);
      apiKey = result['chatGPT-API-Key'];
      document.getElementById("apiKey").value = apiKey;
    }
  });
  document.getElementById("sendToChatGPT").addEventListener("click", sendToChatGPT);
  document.getElementById("apiKey").addEventListener("input", apiKeyInput);
});
