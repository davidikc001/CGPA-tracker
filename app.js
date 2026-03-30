const levels = [100,200,300,400,500];
const semesters = ["First","Second"];
const container = document.getElementById("container");

let currentIndex = 0;

/* ================= BUILD UI ================= */
function buildInterface(){
    levels.forEach(level=>{
        let div = document.createElement("div");
        div.className = "level";

        let html = `<h3>${level} Level</h3>`;

        semesters.forEach(sem=>{
            let id = `${level}_${sem}`;
            html += `
<h4>${sem} Semester</h4>
<div class="semGPA">GPA: <span id="gpa_${id}">0.00</span></div>

<table>
<tr>
<th>Course</th>
<th>Unit</th>
<th>Grade</th>
<th>Action</th>
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

/* ================= ADD ROW ================= */
function addCourseRow(id, course="", unit="", grade=""){
    const tbody = document.getElementById("body_" + id);
    if(!tbody) return;

    const row = document.createElement("tr");

    row.innerHTML = `
<td><input class="course" value="${course}"></td>
<td><input class="unit" type="number" value="${unit}"></td>
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

    calculateAll();
    saveData();
    setTimeout(saveData, 0);
}

/* ================= HANDLE CHANGE ================= */
function handleChange(){
    calculateAll();
    saveData();
}

/* ================= REMOVE ROW ================= */
function removeRow(btn){
    const row = btn.closest("tr");
    if(row) row.remove();

    calculateAll();
    saveData();
}

/* ================= EVENT DELEGATION (FIXED) ================= */
container.addEventListener("input", e => {
    if (
        e.target.classList.contains("course") ||
        e.target.classList.contains("unit") ||
        e.target.classList.contains("grade")
    ) {
        calculateAll();
        saveData();
    }
});

container.addEventListener("change", e => {
    if (e.target.classList.contains("grade")) {
        calculateAll();
        saveData();
    }
});

/* ================= CALCULATE ================= */
function calculateAll(){
    let totalUnits=0, totalPoints=0;

    levels.forEach(level=>{
        let yU=0, yP=0;

        semesters.forEach(sem=>{
            let id = `${level}_${sem}`;
            let sU=0, sP=0;

            document.querySelectorAll(`#body_${id} tr`).forEach(row=>{
                let u = parseFloat(row.querySelector(".unit").value);
                let g = parseFloat(row.querySelector(".grade").value);

                if(!isNaN(u) && !isNaN(g)){
                    sU+=u;
                    sP+=u*g;
                }
            });

            document.getElementById(`gpa_${id}`).innerText = (sU? sP/sU:0).toFixed(2);
            yU+=sU; yP+=sP;
        });

        document.getElementById(`year_${level}`).innerText = (yU? yP/yU:0).toFixed(2);
        totalUnits+=yU;
        totalPoints+=yP;
    });

    let cgpa = totalUnits? totalPoints/totalUnits:0;
    document.getElementById("cgpa").innerText = cgpa.toFixed(2);

    let degree="-";
    if(cgpa>=4.5) degree="1st Class";
    else if(cgpa>=3.5) degree="2nd Class Upper";
    else if(cgpa>=2.4) degree="2nd Class Lower";
    else if(cgpa>=1.5) degree="3rd Class";
    else degree="Failed";

    document.getElementById("degree").innerText = degree;
}

/* ================= SAVE ================= */
function saveData(){
    try{
        const data = {};

        document.querySelectorAll("tbody").forEach(tbody=>{
            const rows = [];

            tbody.querySelectorAll("tr").forEach(row=>{
                const course = row.querySelector(".course").value;
                const unit = row.querySelector(".unit").value;
                const grade = row.querySelector(".grade").value;

                rows.push({ course, unit, grade });
            });

            data[tbody.id] = rows;
        });

        localStorage.setItem("cgpaData", JSON.stringify(data));
    }catch(e){
        console.error("Save failed:", e);
    }
}

/* ================= LOAD ================= */
function loadData(){
    try{
        const raw = localStorage.getItem("cgpaData");
        if(!raw) return;

        const data = JSON.parse(raw);

        Object.keys(data).forEach(tbodyId => {
            const id = tbodyId.replace("body_", "");

            data[tbodyId].forEach(row=>{
                addCourseRow(id, row.course, row.unit, row.grade);
            });
        });

    }catch(e){
        console.error("Load failed:", e);
    }

    calculateAll();
}

/* ================= RESET ================= */
function resetData(){
    if(confirm("Clear all data?")){
        localStorage.removeItem("cgpaData");
        location.reload();
    }
window.resetData = resetData;
}

/* ================= DOTS ================= */
function createDots(){
    const dots = document.getElementById("dots");
    levels.forEach((_,i)=>{
        let d=document.createElement("span");
        d.className="dot";
        if(i===0)d.classList.add("active");

        d.onclick=()=>{
            currentIndex=i;
            updateSlide();
        };

        dots.appendChild(d);
    });
}

/* ================= SLIDE ================= */
function updateSlide(){
    const width = container.offsetWidth;

    container.style.transition = "transform 0.4s ease";
    container.style.transform = `translateX(-${currentIndex * width}px)`;

    document.querySelectorAll(".dot").forEach((d,i)=>{
        d.classList.toggle("active",i===currentIndex);
    });

    document.getElementById("levelTitle").innerText =
        levels[currentIndex] + " Level";

    prevTranslate = -currentIndex * width;
}

/* ================= SWIPE (TOUCH + MOUSE FIXED) ================= */
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let isDragging = false;
let moved = false;

/* TOUCH */
container.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    isDragging = true;
    moved = false;
});

container.addEventListener("touchmove", e => {
    if (!isDragging) return;

    let x = e.touches[0].clientX;
    let diff = x - startX;

    if (Math.abs(diff) > 10) moved = true;

    currentTranslate = prevTranslate + diff;

    container.style.transition = "none";
    container.style.transform = `translateX(${currentTranslate}px)`;
});

container.addEventListener("touchend", () => {
    handleSwipeEnd();
});

/* MOUSE (PC FIX) */
container.addEventListener("mousedown", e => {
    startX = e.clientX;
    isDragging = true;
    moved = false;
});

container.addEventListener("mousemove", e => {
    if (!isDragging) return;

    let x = e.clientX;
    let diff = x - startX;

    if (Math.abs(diff) > 10) moved = true;

    currentTranslate = prevTranslate + diff;

    container.style.transition = "none";
    container.style.transform = `translateX(${currentTranslate}px)`;
});

container.addEventListener("mouseup", handleSwipeEnd);
container.addEventListener("mouseleave", () => isDragging = false);

function handleSwipeEnd(){
    if (!isDragging) return;
    isDragging = false;

    if (!moved) return;

    let movement = currentTranslate - prevTranslate;

    if (movement < -50 && currentIndex < levels.length - 1) currentIndex++;
    else if (movement > 50 && currentIndex > 0) currentIndex--;

    updateSlide();
}

/* ================= SAVE ON EXIT ================= */
window.addEventListener("beforeunload", saveData);
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        saveData();
    }
});

/* ================= GLOBAL FIX ================= */
window.addCourseRow = addCourseRow;
window.removeRow = removeRow;

/* ================= INIT ================= */
buildInterface();
loadData();
calculateAll();
createDots();
updateSlide();