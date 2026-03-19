const levels = [100,200,300,400,500];
const semesters = ["First","Second"];
const container = document.getElementById("container");

function buildInterface(){
    levels.forEach(level=>{
        let div = document.createElement("div");
        div.className = "level";
        let html = `<h2>${level} Level</h2>`;
        semesters.forEach(sem=>{
            let id = `${level}_${sem}`;
            html += `
<h3>${sem} Semester</h3>
<div class="semGPA">Semester GPA: <span id="gpa_${id}">0.00</span></div>
<table>
<tr>
<th>Course</th>
<th>Units</th>
<th>Grade</th>
<th></th> <!-- cancel button column -->
</tr>
<tbody id="body_${id}"></tbody>
</table>
<button onclick="addCourseRow('${id}')">Add Course</button>
`;
        });
        html += `<div class="yearGPA">Year GPA: <span id="year_${level}">0.00</span></div>`;
        div.innerHTML = html;
        container.appendChild(div);
    });
}

function addCourseRow(id, course="", unit="", grade="") {
    const tbody = document.getElementById("body_" + id);
    const row = document.createElement("tr");

    row.innerHTML = `
<td><input type="text" class="course" value="${course}" placeholder="Course Name"></td>
<td><input type="number" class="unit" value="${unit}" placeholder="Units"></td>
<td>
  <select class="grade">
    <option value="">--</option>
    <option value="5">A</option>
    <option value="4">B</option>
    <option value="3">C</option>
    <option value="2">D</option>
    <option value="1">E</option>
    <option value="0">F</option>
  </select>
</td>
<td><button class="cancel-btn" onclick="removeRow(this)">×</button></td>
`;

    tbody.appendChild(row);

    if(grade) row.querySelector(".grade").value = grade;

    attachListeners();
    calculateAll();
    saveData();
}

function removeRow(button){
    button.closest('tr').remove();
    calculateAll();
    saveData();
}

function attachListeners(){
    document.querySelectorAll("input, select").forEach(el=>{
        el.oninput = () => { calculateAll(); saveData(); };
    });
}

function calculateAll(){
    let totalUnits = 0, totalPoints = 0;
    levels.forEach(level=>{
        let yearUnits = 0, yearPoints = 0;
        semesters.forEach(sem=>{
            const id = `${level}_${sem}`;
            let semUnits = 0, semPoints = 0;
            document.querySelectorAll(`#body_${id} tr`).forEach(row=>{
                let unit = parseFloat(row.querySelector(".unit").value);
                let grade = parseFloat(row.querySelector(".grade").value);
                if(!isNaN(unit) && !isNaN(grade)){
                    semUnits += unit;
                    semPoints += unit * grade;
                }
            });
            document.getElementById(`gpa_${id}`).innerText = (semUnits>0?semPoints/semUnits:0).toFixed(2);
            yearUnits += semUnits;
            yearPoints += semPoints;
        });
        document.getElementById(`year_${level}`).innerText = (yearUnits>0?yearPoints/yearUnits:0).toFixed(2);
        totalUnits += yearUnits;
        totalPoints += yearPoints;
    });

    const cgpa = totalUnits>0?totalPoints/totalUnits:0;
    document.getElementById("cgpa").innerText = cgpa.toFixed(2);

    let degree="-";
    if (cgpa >= 4.5 && cgpa <= 5.0)
        degree = "First Class";
    else if (cgpa >= 3.5 && cgpa < 4.5)
        degree = "Second Class Upper";
    else if (cgpa >= 2.4 && cgpa < 3.5)
        degree = "Second Class Lower";
    else if (cgpa >= 1.5 && cgpa < 2.4)
        degree = "Third Class";
    else if (cgpa >= 0.0 && cgpa < 1.5)
        degree = "Failed";

    document.getElementById("degree").innerText = degree;
    saveData();
}

function saveData(){
    const data = {};
    document.querySelectorAll("tbody").forEach(tbody=>{
        const rows = [];
        tbody.querySelectorAll("tr").forEach(row=>{
            rows.push({
                course: row.querySelector(".course").value,
                unit: row.querySelector(".unit").value,
                grade: row.querySelector(".grade").value
            });
        });
        data[tbody.id] = rows;
    });
    localStorage.setItem("cgpaData", JSON.stringify(data));
}

function loadData(){
    const data = JSON.parse(localStorage.getItem("cgpaData"))||{};
    for(const tbodyId in data){
        data[tbodyId].forEach(row=>{
            addCourseRow(tbodyId.replace("body_",""), row.course, row.unit, row.grade);
        });
    }
}

function resetData(){
    if(confirm("Delete all CGPA records?")){
        localStorage.removeItem("cgpaData");
        location.reload();
    }
}

buildInterface();
loadData();
attachListeners();
calculateAll();