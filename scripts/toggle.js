let state = localStorage.getItem("toggleState") === "true";

document.getElementById("toggle").addEventListener("click", function() {
    state = !state;
    localStorage.setItem("toggleState", state);
    window.toggleState = state;
});
