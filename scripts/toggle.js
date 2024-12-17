document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById("toggle");
    let state = localStorage.getItem("isEnabled") === "true";

    console.log(state ? "enabled" : "disabled");
    toggle.checked = state;

    toggle.addEventListener("click", function() {
        state = !state;
        localStorage.setItem("isEnabled", state);
        send(state ? "on" : "off");
        console.log(state ? "enabled" : "disabled");
    });
});

const send = (s) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, s);
    });
}

