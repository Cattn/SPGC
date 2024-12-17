let state = false;

if (localStorage.getItem("isEnabled") === "true") {
    state = true;
    console.log("enabled");
}


document.getElementById("toggle").addEventListener("click", function() {
    state = !state;
    send(state ? "on" : "off");
    localStorage.setItem("isEnabled", state);
    console.log(state ? "enabled" : "disabled");
    this.checked = state;
});


const send = (s) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, s);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("toggle").checked = state;
});
