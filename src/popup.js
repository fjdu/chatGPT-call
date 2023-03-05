const temperatureDef = 0.0;
apiKey = '';
total_tokens = 0;
prompt_msgs = [];
completion_msgs = [];

preset_prompts_def = [
  '',
  'Summarize the following in English:',
  'Summarize the following in English succinctly:',
  'Translate the following Chinese text into English:',
  'Continue the following in English:',
  'Reply the following in English:',
  '用中文概括下面的内容:',
  '用中文概括下面的内容，不超过5句话:',
  '润色下面的英文:',
  '将下面这段中文翻译为英文:',
  '用中文续写下面的内容:',
  '用中文回复下面的内容:'
];

async function sendToChatGPT() {

  const elTbody = document.getElementById('tbDialog');
  const elUserInput = document.getElementById('userInput');

  const inputText = elUserInput.value;
  elUserInput.value = '';

  const prevContainer = document.createElement('div');
  prevContainer.id = 'prevContainer';
  elTbody.insertRow(elTbody.rows.length-2).appendChild(prevContainer);
  const prevTextArea = document.createElement('textarea');
  prevTextArea.rows = 5;
  prevTextArea.value = inputText;
  prevTextArea.className = 'prevInput';
  prevTextArea.readOnly = true;
  prevContainer.appendChild(prevTextArea);

  const replyContainer = document.createElement('div');
  replyContainer.id = 'replyContainer';
  elTbody.insertRow(elTbody.rows.length-2).appendChild(replyContainer);
  const elReply = document.createElement('textarea');
  elReply.rows = 10;
  elReply.className = 'replyByChatGPT';
  elReply.type = 'text';
  elReply.id = 'replyByChatGPT';
  elReply.readOnly = true;
  elReply.placeholder = 'Waiting for reply from ChatGPT...';
  replyContainer.appendChild(elReply);

  let temperature = temperatureDef;
  let tmp = parseFloat(document.getElementById("temperature").value);
  if (!isNaN(tmp)) {
    if ((0.0 <= tmp) && (tmp <= 1.0)) {
      temperature = tmp;
    }
  }

  let propt_option = document.getElementById("prompt-text").value;
  if (propt_option !== '') {
    propt_option += '\n';
  }
  console.log(propt_option);

  fetch('https://api.openai.com/v1/chat/completions',
    {method: 'POST',
     mode: 'cors',
     headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'},
     body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: temperature,
        messages: [{role: "user",
                    content: propt_option + inputText}]})})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    let c_token = data['usage']['completion_tokens'];
    let p_token = data['usage']['prompt_tokens'];
    let t_token = data['usage']['total_tokens'];
    replyText = data['choices'][0].message.content;
    total_tokens += t_token;
    prompt_msgs.push(inputText);
    completion_msgs.push(replyText);

    const elReply = document.getElementById('replyByChatGPT');
    elReply.value = replyText;
    elReply.removeAttribute('id');

    const prevContainer = document.getElementById('prevContainer');
    const elPromptToken = document.createElement('div');
    elPromptToken.className = 'promptTokenInfo';
    elPromptToken.appendChild(document.createTextNode(p_token.toString() + ' tokens.'));
    prevContainer.appendChild(elPromptToken);
    prevContainer.removeAttribute('id');

    const replyContainer = document.getElementById('replyContainer');
    const elCompletionToken = document.createElement('div');
    elCompletionToken.className = 'completionTokenInfo';
    elCompletionToken.appendChild(document.createTextNode(c_token.toString() + ' tokens.'));
    replyContainer.appendChild(elCompletionToken);
    replyContainer.removeAttribute('id');

    const fee = total_tokens * 0.002 / 1000;
    document.getElementById("stats").value = 'Total tokens: ' + total_tokens.toString() + ', fee: ' + fee.toFixed(6) + ' USD (about ' + (fee * 6.91).toFixed(6) + ' CNY)';

  });
}

function apiKeyInput() {
  apiKey = document.getElementById("apiKey").value;
  chrome.storage.local.set({'chatGPT-API-Key': apiKey}).then(() => {
  });
}

function displayPresetPrompts(elSel, pprompts) {
  for (var i=0; i<pprompts.length; i++) {
    var option = document.createElement("option");
    if (pprompts[i] == '') {
      option.value = pprompts[i];
      option.text = 'Optional: choose a preset prompt';
    } else {
      option.value = pprompts[i];
      option.text = pprompts[i];
    }
    elSel.appendChild(option);
  }
}

document.addEventListener('DOMContentLoaded',
function() {
  chrome.storage.local.get(["chatGPT-API-Key"]).then((result) => {
    if ((result !== undefined) && (result !== 'undefined')) {
      let apiKeytmp = result['chatGPT-API-Key'];
      if ((apiKeytmp !== undefined) && (apiKeytmp !== 'undefined')) {
        apiKey = apiKeytmp;
        document.getElementById("apiKey").value = apiKey;
      }
    }
  });
  let preset_prompts = preset_prompts_def;
  chrome.storage.local.get(["preset-prompts"]).then((result) => {
    if ((result !== undefined) && (result !== 'undefined')) {
      let preset_prompts_tmp = result['preset-prompts'];
      if ((preset_prompts_tmp !== null) &&
          (preset_prompts_tmp !== undefined) &&
          (preset_prompts_tmp !== 'undefined')) {
        preset_prompts = preset_prompts_tmp;
      }
    }
  });
  displayPresetPrompts(document.getElementById('prompt-text'), preset_prompts);
  document.getElementById("sendToChatGPT").addEventListener("click", sendToChatGPT);
  document.getElementById("apiKey").addEventListener("input", apiKeyInput);
  document.getElementById("temperature").placeholder = 'temperature: ' + temperatureDef.toString();
});
