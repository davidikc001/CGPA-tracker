const levels = [100,200,300,400,500];
const semesters = ["First","Second"];
const container = document.getElementById("container");

let currentIndex = 0;

/* BUILD UI */
function buildInterface(){
    levels.forEach(level=>{
        let div = document.createElement("div");
        div.className = "level";

        let html = `<h3>${level} Level</h3>`;

        semesters.forEach(sem=>{
            let id = `${level}_${sem}`;
            html += `
<h4>${sem} Semester</h4>
<div>GPA: <span id="gpa_${id}">0.00</span></div>

<table>
<tr>
<th>Course</th>
<th>Unit</th>
<th>Grade</th>
</tr>
<tbody id="body_${id}"></tbody>
</table>

<button onclick="addCourseRow('${id}')">Add</button>
`;
        });

        html += `<div>Year GPA: <span id="year_${level}">0.00</span></div>`;
        div.innerHTML = html;
        container.appendChild(div);
    });
}

/* ADD ROW */
function addCourseRow(id, course="", unit="", grade=""){
    const tbody = document.getElementById("body_" + id);
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

    attachListeners();
}

/* REMOVE */
function removeRow(btn){
    btn.closest("tr").remove();
    calculateAll();
    saveData();
}

/* LISTENERS */
function attachListeners(){
    document.querySelectorAll("input, select").forEach(el=>{
        el.oninput = () => {
            calculateAll();
            saveData();
        };
    });
}

/* CALCULATE */
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

/* SAVE */
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

/* LOAD */
function loadData(){
    const data = JSON.parse(localStorage.getItem("cgpaData")) || {};

    for(const tbodyId in data){
        data[tbodyId].forEach(row=>{
            addCourseRow(
                tbodyId.replace("body_",""),
                row.course,
                row.unit,
                row.grade
            );
        });
    }

    calculateAll();
}

/* RESET */
function resetData(){
    if(confirm("Clear all data?")){
        localStorage.removeItem("cgpaData");
        location.reload();
    }
}

/* DOTS */
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

/* SLIDE */
function updateSlide(){
    let width = container.offsetWidth;
    container.style.transition="transform 0.4s ease";
    container.style.transform=`translateX(-${currentIndex*width}px)`;

    document.querySelectorAll(".dot").forEach((d,i)=>{
        d.classList.toggle("active",i===currentIndex);
    });

    document.getElementById("levelTitle").innerText = levels[currentIndex]+" Level";

    resetBlur();
}

/* SWIPE */
let startX=0, currentTranslate=0, prevTranslate=0, dragging=false;

container.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
    dragging=true;
});

container.addEventListener("touchmove", e=>{
    if(!dragging)return;

    let x = e.touches[0].clientX;
    let diff = x-startX;

    currentTranslate = prevTranslate + diff;

    container.style.transition="none";
    container.style.transform=`translateX(${currentTranslate}px)`;

    blurEffect();
});

container.addEventListener("touchend", ()=>{
    dragging=false;

    let moved = currentTranslate - prevTranslate;

    if(moved < -50 && currentIndex < levels.length-1) currentIndex++;
    if(moved > 50 && currentIndex > 0) currentIndex--;

    prevTranslate = -currentIndex * container.offsetWidth;

    updateSlide();
});

/* BLUR */
function blurEffect(){
    document.querySelectorAll(".level").forEach((el,i)=>{
        el.classList.toggle("blur", i !== currentIndex);
    });
}

function resetBlur(){
    document.querySelectorAll(".level").forEach(el=>{
        el.classList.remove("blur");
    });
}

/* INIT */
buildInterface();
createDots();
loadData();
attachListeners();