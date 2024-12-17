document.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab.url.match(/^https:\/\/sis\.palmbeachschools\.org\/focus\//)) {
            const div = document.createElement("div");
            div.textContent = "Only use this toggle on SIS.";
            document.body.appendChild(div);
            return;
        }

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
});
 
const send = (s) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, s);
    });
}

 