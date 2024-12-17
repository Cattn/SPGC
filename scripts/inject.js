let isEnabled = localStorage.getItem("isEnabled") === "true";
chrome.runtime.onMessage.addListener((message) => {
  switch (message) {
    case "on":
      isEnabled = true;
      break;
    case "off":
      isEnabled = false;
      break;
  }

  localStorage.setItem("isEnabled", isEnabled);
});

let points = [];
let totalPoints = 0;
let weighted = false;
let weightNames = [];
let weightPercentages = [];
let categories = [];
let maxPoints = [];
let addedRows = [];
let showExtra = true;

function printAllPoints() {
    let rows = document.querySelectorAll(".dataTable-tbody .dataTable-row");
    points = [];
    totalPoints = 0;
    categories = [];
    maxPoints = [];
    rows = Array.from(rows).filter(row => !!row.querySelector(".points-cell"));
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
                const letterGradeCell = row.querySelector(".student-letter");
                  if (letterGradeCell) {
                      const percentage = (parseFloat(match[1]) / parseFloat(match[2])) * 100;
                      letterGradeCell.textContent = calculateLetterGrade(percentage);

                      const percentDiv = row.querySelector(".student-percent");
                      if (percentDiv) {
                          const percent = isFinite(percentage) ? `${Math.round(percentage)}%` : "";
                          percentDiv.textContent = percent;
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


function newRowCreator() {
  const tBody = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grades-grid-container.student-assignments-container > div > div > div.dataTable-scroll.printStretch > table > tbody");

  if (tBody) {
    const newRow = document.createElement("tr");
    newRow.setAttribute("class", "dataTable-row dataTable-recordRow dataTable-oddRow");

    const newRowText = document.createElement("td");
    newRowText.setAttribute("class", "tacky-left highlightable-container dataTable-recordColumn tacky-left-origin");
    newRowText.textContent = "New Row";

    const newPointsCell = document.createElement("td");
    newPointsCell.setAttribute("class", "tacky-left points-cell highlightable-container primary-grade-cell dataTable-recordColumn tacky-left-origin");
    newPointsCell.setAttribute("contenteditable", "true");

    const newCategoryCell = document.createElement("td");
    newCategoryCell.setAttribute("class", "record input dataTable-recordColumn data-field-category_title");
    newCategoryCell.setAttribute("contenteditable", "true");

    const pointText = document.createElement("td");
    pointText.setAttribute("class", "tacky-left highlightable-container dataTable-recordColumn tacky-left-origin");
    pointText.textContent = "Points:";

    const categoryText = document.createElement("td");
    categoryText.setAttribute("class", "tacky-left highlightable-container dataTable-recordColumn tacky-left-origin");
    categoryText.textContent = "Category:";

    const button = document.createElement("button");
    button.textContent = "Add Another Row";

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove Row";

    newRow.appendChild(newRowText);
    newRow.appendChild(pointText);
    newRow.appendChild(newPointsCell);
    newRow.appendChild(categoryText);
    newRow.appendChild(newCategoryCell);
    tBody.appendChild(newRow);
    newRow.appendChild(button);

    addedRows.push(newRow);

    button.addEventListener("click", () => {
      button.remove();
      newRow.appendChild(removeButton);
      newRowCreator();
    });

    removeButton.addEventListener("click", () => {
      newRow.remove();
      addedRows = addedRows.filter(row => row !== newRow);
    });
  }
}

function reCalculateButton() {
    const container = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grid-top-buttons > div > div.gradebook-grid-title-container");
    if (container) {
        const submitButton = container.querySelector("button");
        if (!submitButton) {
            const button = document.createElement("button");
            button.textContent = "Re-calculate";
            button.style.marginLeft = "5px";
            button.onclick = printAllPoints;

            const hideButton = document.createElement("button");
            hideButton.textContent = "Hide Extra Details";
            hideButton.style.marginLeft = "20px";
            hideButton.onclick = () => {
                const lastElement = container.lastElementChild;
                if (lastElement) {
                    lastElement.remove();
                    hideButton.remove();
                    showExtra = false;
                }
            };
            container.appendChild(hideButton);
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
        div.style.paddingLeft = "5px";
        div.innerHTML += `<br>Total Points Earned: ${points.reduce((a, b) => a + b, 0).toFixed(2)}<br>
        Total Points Possible: ${totalPoints}<br>
        Number of Assignments: ${points.length}<br>
        Average Points per assignment: ${(points.reduce((a, b) => a + b, 0) / points.length).toFixed(2)}<br>
        Grade: ${((points.reduce((a, b) => a + b, 0) / totalPoints) * 100).toFixed(2)}%<br>`;

        const letterGrade = calculateLetterGrade((points.reduce((a, b) => a + b, 0) / totalPoints) * 100);
        const mainGradeDiv = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grid-top-buttons > div > div.gradebook-grid-title-container > div.gradebook-grid-title-middle > div");
        mainGradeDiv.textContent = `Current Grade in Class: ${Math.round((points.reduce((a, b) => a + b, 0) / totalPoints) * 100)}% ${letterGrade}`;
        mainGradeDiv.setAttribute("data-focus-tooltip", `Current Grade in Class: ${Math.round((points.reduce((a, b) => a + b, 0) / totalPoints) * 100)}% ${letterGrade}`);
        if (showExtra){
        container.appendChild(div);
        }
    }
  }

function calculateLetterGrade(overallGrade) {
  if (overallGrade >= 89.5) {
    return "A";
  } else if (overallGrade >= 79.5) {
    return "B";
  } else if (overallGrade >= 69.5) {
    return "C";
  } else if (overallGrade >= 59.5) {
    return "D";
  } else {
    return "F";
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
    div.style.paddingLeft = "5px";

   const categoryPoints = {};
    const categoryMaxPoints = {};
    
    categories.forEach((category, index) => {
      categoryPoints[category] = (categoryPoints[category] || 0) + points[index];
      categoryMaxPoints[category] = (categoryMaxPoints[category] || 0) + maxPoints[index];
    });
    
    const weightedScores = weightNames.map((name, index) => {
      const totalCategoryPoints = categoryMaxPoints[name] || 1; 
      const earnedPoints = categoryPoints[name] || 0;
      const percentage = (earnedPoints / totalCategoryPoints) * 100;
      const weightedPercentage = percentage * (weightPercentages[index] / 100);
      return { percentage, weightedPercentage };
    });

    const scoreRow = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.student-gb-grades-weighted-grades-container > div > table > tbody > tr:nth-child(3)");

    
    div.innerHTML += `<br><strong>Category Grades:</strong><br>`;
    weightedScores.forEach((score, index) => {
      div.innerHTML += `${weightNames[index]}: ${score.percentage.toFixed(2)}% (Weighted: ${score.weightedPercentage.toFixed(2)}%, Weight: ${weightPercentages[index]}%)<br>`;
    });

    const overallGrade = weightedScores.reduce((a, b) => a + b.weightedPercentage, 0);
    div.innerHTML += `<br><strong>Overall Weighted Grade: ${(overallGrade.toFixed(2))}%</strong>`;

    const letterGrade = calculateLetterGrade(overallGrade);
    div.innerHTML += `<br><strong>Letter Grade: ${letterGrade}</strong>`;

    if (scoreRow) {
      const rows = Array.from(scoreRow.querySelectorAll("td")).slice(1, -1);
      rows.forEach((row, index) => {
        const totalCategoryPoints = categoryMaxPoints[weightNames[index]] || 1; 
        const earnedPoints = categoryPoints[weightNames[index]] || 0;
        const percentage = Math.round((earnedPoints / totalCategoryPoints) * 100);
        const letterGrade = calculateLetterGrade(percentage);
        row.textContent = `${earnedPoints}/${totalCategoryPoints} ${percentage}% ${letterGrade}`;
      });
      const lastRow = scoreRow.querySelector("td:last-child");
      const letterGrade = calculateLetterGrade(overallGrade);
      lastRow.textContent = `${Math.round(overallGrade)}% ${letterGrade}`;
    }

    if (showExtra) {
      container.appendChild(div);
    }
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
    if (!isEnabled) {
    const selectElement = document.querySelector("body > div.site-container.sis-package > div.site-middle > div > main > div > section > div.web-page-content > div.web-page-main-content > div.web-page-main-content-fill > div.grid-top-buttons > div > div.gradebook-grid-title-container > div.student-gb-grades-course-container > select");
    if (selectElement) {
        const classNames = selectElement.querySelectorAll("option");
        const className = Array.from(classNames).find(option => option.selected);
        if (className) {
            reCalculateButton();
            checkWeighted();
            printAllPoints();
            newRowCreator();
            observer.disconnect();
        }
        selectElement.addEventListener('change', (event) => {
            setTimeout(() => {
                location.reload();
            }, 2000);
        });
    }
  }
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});




// get rid of dumb anti-tamper
(function () {
  if (!isEnabled) {
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
  
    }
  })();

