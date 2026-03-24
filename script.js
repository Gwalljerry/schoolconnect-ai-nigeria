const PASSWORDS = { admin: 'admin2026', teacher: 'teacher123' };
const ENCRYPT_KEY = 'SchoolConnectAI2026';

let currentUser = null;
let students = [];
let classes = {};
let results = [];

function encrypt(data) { return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPT_KEY).toString(); }
function decrypt(encrypted) { try { return JSON.parse(CryptoJS.AES.decrypt(encrypted, ENCRYPT_KEY).toString(CryptoJS.enc.Utf8)); } catch { return null; } }
function loadData(key) { const enc = localStorage.getItem(key); return enc ? decrypt(enc) || [] : []; }
function saveData(key, data) { localStorage.setItem(key, encrypt(data)); }

function init() {
    students = loadData('students');
    classes = loadData('classes') || {};
    results = loadData('results');
}
init();

function getGrade(p) {
    if (p >= 75) return 'A1'; if (p >= 70) return 'B2'; if (p >= 65) return 'B3'; if (p >= 60) return 'C4';
    if (p >= 55) return 'C5'; if (p >= 50) return 'C6'; if (p >= 45) return 'D7'; if (p >= 40) return 'E8';
    return 'F9';
}
function getRemark(p) { if (p >= 75) return 'Outstanding! 👏'; if (p >= 60) return 'Well done! 📈'; if (p >= 45) return 'Improve 💪'; return 'Needs help ⚠️'; }

// Login
document.getElementById('login-btn').addEventListener('click', () => {
    const role = document.getElementById('user-role').value;
    const pass = document.getElementById('user-password').value;
    if (PASSWORDS[role] === pass) {
        currentUser = { role, name: role === 'admin' ? 'School Admin' : 'Teacher' };
        document.getElementById('login-screen').classList.add('hidden');
        document.querySelectorAll('.mode').forEach(m => m.classList.add('hidden'));
        document.getElementById(role === 'admin' ? 'admin-dashboard' : 'teacher-dashboard').classList.remove('hidden');
        if (role === 'teacher') loadTeacherClass();
    } else {
        alert('❌ Wrong password!');
    }
});

// Excel Upload
document.getElementById('process-excel').addEventListener('click', () => {
    const file = document.getElementById('excel-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);
            students = json.map(row => ({
                name: row.Name || row.name || row['Student Name'],
                examNumber: row['Exam Number'] || row['exam_number'] || row['Exam No'],
                class: row.Class || row['class'] || row['Class Name']
            })).filter(s => s.name && s.examNumber);
            saveData('students', students);
            alert(`✅ ${students.length} students uploaded!`);
        };
        reader.readAsArrayBuffer(file);
    }
});

// Create Class
document.getElementById('create-class').addEventListener('click', () => {
    const className = document.getElementById('new-class').value.trim();
    const teacherInput = document.getElementById('assign-teacher').value.trim();
    const teacher = teacherInput || 'Teacher';
    if (className) {
        classes[className] = { 
            teacher, 
            students: students.filter(s => s.class === className).map(s => s.examNumber) 
        };
        saveData('classes', classes);
        alert(`✅ Class ${className} assigned to ${teacher}`);
        document.getElementById('new-class').value = '';
        document.getElementById('assign-teacher').value = '';
    }
});

// Teacher Class Load
function loadTeacherClass() {
    const assignedClass = Object.entries(classes).find(([_, c]) => c.teacher === currentUser.name)[0];
    if (assignedClass) {
        const [className] = assignedClass;
        document.getElementById('teacher-class').textContent = `Class: ${className}`;
        const classStudents = students.filter(s => classes[className]?.students?.includes(s.examNumber));
        document.getElementById('student-select').innerHTML = classStudents.map(s => 
            `<option value="${s.examNumber}">${s.name} (${s.examNumber})</option>`
        ).join('');
        loadSubjects();
    } else {
        document.getElementById('teacher-class').innerHTML = 'No class assigned. <br>Contact Admin.';
    }
}

function loadSubjects() {
    const subjects = ['English', 'Math', 'Biology', 'Physics', 'Chemistry'];
    document.getElementById('subjects-inputs').innerHTML = subjects.map(sub => `
        <div class="input-group">
            <label>${sub}</label>
            <input type="number" name="ca1_${sub}" min="0" max="30" placeholder="CA1">
            <input type="number" name="ca2_${sub}" min="0" max="30" placeholder="CA2">
            <input type="number" name="exam_${sub}" min="0" max="40" placeholder="Exam">
        </div>
    `).join('');
}

// Teacher Upload
document.getElementById('score-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const examNumber = document.getElementById('student-select').value;
    const student = students.find(s => s.examNumber === examNumber);
    const formData = new FormData(e.target);
    const subjects = ['English', 'Math', 'Biology', 'Physics', 'Chemistry'];
    subjects.forEach(sub => {
        const ca1 = parseFloat(formData.get(`ca1_${sub}`)) || 0;
        const ca2 = parseFloat(formData.get(`ca2_${sub}`)) || 0;
        const exam = parseFloat(formData.get(`exam_${sub}`)) || 0;
        if (ca1 + ca2 + exam > 0) {
            const total = ca1 + ca2 + exam;
            results.push({
                studentName: student.name, examNumber, subject: sub,
                ca1, ca2, exam, total, percentage: total, grade: getGrade(total), remark: getRemark(total)
            });
        }
    });
    saveData('results', results);
    alert('✅ Results saved!');
});

// Parent Check
document.getElementById('check-result').addEventListener('click', () => {
    const examNum = document.getElementById('parent-exam-number').value;
    const studentResults = results.filter(r => r.examNumber === examNum);
    if (studentResults.length) {
        document.getElementById('parent-result').innerHTML = studentResults.map(r => `
            <div class="result-card">
                <h4>${r.subject}: ${r.grade}</h4>
                <p>${r.ca1}/30 + ${r.ca2}/30 + ${r.exam}/40 = ${r.total}/100</p>
                <p>${r.remark}</p>
            </div>
        `).join('');
    } else {
        document.getElementById('parent-result').innerHTML = '<p>❌ No results found</p>';
    }
});

// AI Chat
document.getElementById('ai-send').addEventListener('click', () => {
    const q = document.getElementById('ai-input').value.toLowerCase();
    let resp = 'Ask about grades, news, or results!';
    if (q.includes('grade')) resp = 'A1=75+, F9<40. WAEC standard!';
    if (q.includes('exam')) resp = 'Check your 10-digit exam number.';
    document.getElementById('ai-response').textContent = `🤖 ${resp}`;
    document.getElementById('ai-input').value = '';
});

// Print & Logout
document.getElementById('print-all').addEventListener('click', () => window.print());
document.querySelectorAll('#logout').forEach(btn => btn.addEventListener('click', () => location.reload()));

function debugTeacher() {
    alert(`Classes: ${JSON.stringify(Object.keys(classes))}\nStudents: ${students.length}\nYour name: ${currentUser?.name}`);
}

function speak(text) { if ('speechSynthesis' in window) speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }
