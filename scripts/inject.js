let points = [];
let totalPoints = 0;
let weighted = false;
let weightNames = [];
let weightPercentages = [];
let categories = [];
let maxPoints = [];

function printAllPoints() {
    const rows = document.querySelectorAll(".dataTable-tbody .dataTable-row");
    points = [];
    totalPoints = 0;
    categories = [];
    rows.forEach(row => {
        const pointsCell = row.querySelector(".points-cell");
        if (pointsCell) {
            pointsCell.contentEditable = "true";
            const rawText = pointsCell.textContent.trim();
            const match = rawText.match(/([\d.]+)\s*\/\s*(\d+)/);

            if (match) {
                points.push(parseFloat(match[1]));
                totalPoints += parseInt(match[2]);
                if (weighted) {
                  const categoryCell = row.querySelector(".data-field-category_title");
                  if (categoryCell) {
                      const category = categoryCell.textContent.trim();
                      categories.push(category);
                      maxPoints.push(parseInt(match[2]));
                  }
                }
            } else {
                console.log(`No valid match found for: ${rawText}`);
            } 
        }
    });
    if (weighted) {
      printWeightedCalculation();
    } else {
      printCalculation();
    }
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

function printWeightedCalculation() {
  const container = document.querySelector(
    "body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grid-top-buttons > div > div.gradebook-grid-title-container"
  );

  if (container) {
    const existingDiv = container.querySelector("#weightedCalculation");
    if (existingDiv) {
      existingDiv.remove();
    }

    const div = document.createElement("div");
    div.id = "weightedCalculation";

    const categoryPoints = {};
    const categoryMaxPoints = {}; 
    const weightedScores = [];

    categories.forEach((category, index) => {
      categoryPoints[category] = (categoryPoints[category] || 0) + points[index];
      categoryMaxPoints[category] = (categoryMaxPoints[category] || 0) + maxPoints[index];
    });

    div.innerHTML += `<br><strong>Category Grades:</strong><br>`;
    weightNames.forEach((name, index) => {
      const totalCategoryPoints = categoryMaxPoints[name] || 1; 
      const earnedPoints = categoryPoints[name] || 0;
      const categoryGrade = ((earnedPoints / totalCategoryPoints) * 100).toFixed(2);
      const weightedScore = (categoryGrade * weightPercentages[index]) / 100;
      weightedScores.push(weightedScore);

      div.innerHTML += `${name}: ${categoryGrade}% (Weight: ${weightPercentages[index]}%)<br>`;
    });

    // Calculate overall weighted grade
    const overallGrade = weightedScores.reduce((a, b) => a + b, 0).toFixed(2);
    div.innerHTML += `<br><strong>Overall Weighted Grade: ${overallGrade}%</strong>`;

    container.appendChild(div);
  } else {
    console.log("Container not found. Exiting function.");
  }
}






function checkWeighted() {
    const element = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.student-gb-grades-weighted-grades-container");
    if (element) {
      weighted = true;
      const tableRow = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.student-gb-grades-weighted-grades-container > div > table > tbody > tr:nth-child(1)");
      if (tableRow) {
        const weightedCells = tableRow.querySelectorAll("td.student-gb-grades-weighted-grades-cell");
        if (weightedCells.length > 2) {
          weightNames = [];
          for (let i = 1; i < weightedCells.length - 1; i++) {
            const text = weightedCells[i].innerText.trim();
            weightNames.push(text);
          }
        }
      }
    }

    const percentTable = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.student-gb-grades-weighted-grades-container > div > table > tbody > tr:nth-child(2)");
    if (percentTable) {
      const weightedCells = percentTable.querySelectorAll("td.student-gb-grades-weighted-grades-cell");
      if (weightedCells.length > 2) {
        weightPercentages = [];
        for (let i = 1; i < weightedCells.length - 1; i++) {
          const text = weightedCells[i].innerText.trim();
          weightPercentages.push(parseFloat(text));
        }
      }
    }
  } 




// Detect ClassName/Page Load
const observer = new MutationObserver(() => {
    const selectElement = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grid-top-buttons > div > div.gradebook-grid-title-container > div.student-gb-grades-course-container > select");
    if (selectElement) {
        const classNames = selectElement.querySelectorAll("option");
        const className = Array.from(classNames).find(option => option.selected);
        if (className) {
            checkWeighted();
            printAllPoints();
            reCalculateButton();
            observer.disconnect();
        }
        selectElement.addEventListener('change', (event) => {
            setTimeout(() => {
                location.reload();
            }, 2000);
        });
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

