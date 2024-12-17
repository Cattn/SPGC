let points = [];
let totalPoints = 0;

function printAllPoints() {
    const rows = document.querySelectorAll(".dataTable-tbody .dataTable-row");
    points = [];
    totalPoints = 0;
    rows.forEach(row => {
        const pointsCell = row.querySelector(".points-cell");
        if (pointsCell) {
            pointsCell.contentEditable = "true";
            const rawText = pointsCell.textContent.trim();
            const match = rawText.match(/([\d.]+)\s*\/\s*(\d+)/);

            if (match) {
                points.push(parseFloat(match[1]));
                totalPoints += parseInt(match[2]);
                console.log(`${match[1]}/${match[2]}`);
            } else {
                console.log(`No valid match found for: ${rawText}`);
            } 
        }
    });
    console.log(`Total Points Earned: ${points.reduce((a, b) => a + b, 0).toFixed(2)}`);
    console.log(`Total Points Possible: ${totalPoints}`);
    console.log(`Number of Assignments: ${points.length}`);
    console.log(`Average Points per assignment: ${(points.reduce((a, b) => a + b, 0) / points.length).toFixed(2)}`);
    console.log(`Grade: ${((points.reduce((a, b) => a + b, 0) / totalPoints) * 100).toFixed(2)}%`);
    printCalculation();
}

function reCalculateButton() {
    const container = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grid-top-buttons > div > div.gradebook-grid-title-container");
    if (container) {
        const submitButton = container.querySelector("button");
        if (!submitButton) {
            const button = document.createElement("button");
            button.textContent = "Re-calculate";
            button.onclick = printAllPoints;
            container.appendChild(button);
        }
    }
}

function printCalculation() {
    const container = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grid-top-buttons > div > div.gradebook-grid-title-container");
    if (container) {
        const existingDiv = container.querySelector("#calculation");
        if (existingDiv) {
            existingDiv.remove();
        }
        const div = document.createElement("div");
        div.id = "calculation";
        div.innerHTML += `<br>Total Points Earned: ${points.reduce((a, b) => a + b, 0).toFixed(2)}<br>
        Total Points Possible: ${totalPoints}<br>
        Number of Assignments: ${points.length}<br>
        Average Points per assignment: ${(points.reduce((a, b) => a + b, 0) / points.length).toFixed(2)}<br>
        Grade: ${((points.reduce((a, b) => a + b, 0) / totalPoints) * 100).toFixed(2)}%<br>`;
        container.appendChild(div);
    }
}




// Detect ClassName/Page Load
const observer = new MutationObserver(() => {
    const classNames = document.querySelectorAll("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grid-top-buttons > div > div.gradebook-grid-title-container > div.student-gb-grades-course-container > select > option");
    const className = Array.from(classNames).find(option => option.selected);
    if (className) {
      console.log(className.innerHTML);
      printAllPoints();
      reCalculateButton();
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });




// get rid of dumb anti-tamper
(function () {
    const originalConsoleClear = console.clear;
    console.clear = function () {
      console.log("no yapsterpiece in the console");
    };
  
    if (Object.getOwnPropertyDescriptor(window.location, 'reload')?.configurable) {
      Object.defineProperty(window.location, 'reload', {
        configurable: false,
        writable: false,
        value: function () {
          console.log("no reloading lil bro");
        },
      });
    }
  
    const originalSetInterval = window.setInterval;
    window.setInterval = function () {
      console.log("setInterval was blocked");
      return null;
    };
  
    const originalClearInterval = window.clearInterval;
    window.clearInterval = function (id) {
      console.log("clearInterval was called", id);
      originalClearInterval(id);
    };
  
    for (let i = 1; i <= 9999; i++) clearInterval(i);
  
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'SCRIPT' && node.textContent.includes('setInterval')) {
            console.log("banned!! gone!!");
            node.remove();
          }
        });
      });
    });
  
    observer.observe(document.documentElement, { childList: true, subtree: true });
  
  })();

