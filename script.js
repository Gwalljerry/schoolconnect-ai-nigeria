const PASSWORDS = { admin: 'admin2026', teacher: 'teacher123' };
const ENCRYPT_KEY = 'SchoolConnectAI2026';

// Data structures
let currentUser = null;
let students = [];
let classes = {}; // {className: {teacher: '', students: []}}
let results = [];

// Load/Save (encrypted)
function encrypt(data) { return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPT_KEY).toString(); }
function decrypt(encrypted) { try { return JSON.parse(CryptoJS.AES.decrypt(encrypted, ENCRYPT_KEY).toString(CryptoJS.enc.Utf8)); } catch { return null; } }
function loadData(key) { const enc = localStorage.getItem(key); return enc ? decrypt(enc) || [] : []; }
function saveData(key, data) { localStorage.setItem(key, encrypt(data)); }

// Init on load
function init() {
    students = loadData('students');
    classes = loadData('classes') || {};
    results = loadData('results');
}
init();

// Login
document.getElementById('login-btn').addEventListener('click', () => {
    const role = document.getElementById('user-role').value;
    const pass = document.getElementById('user-password').value;
    if (PASSWORDS[role] === pass) {
        currentUser = { role, name: role === 'admin' ? 'School Admin' : 'Teacher' };
        document.getElementById('login-screen').classList.add('hidden');
        if (role === 'admin') {
            document.getElementById('admin-dashboard').classList.remove('hidden');
        } else {
            document.getElementById('teacher-dashboard').classList.remove('hidden');
            loadTeacherClass();
        }
        document.getElementById('parent-screen').classList.add('hidden'); // Hide parent for logged in
    } else {
        alert('Invalid credentials!');
    }
});

// Excel Upload (Admin)
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
                name: row.Name || row.name,
                examNumber: row['Exam Number'] || row['exam_number'],
                class: row.Class || row['class']
            }));
            saveData('students', students);
            alert(`${students.length} students uploaded!`);
        };
        reader.readAsArrayBuffer(file);
    }
});

// Create Class & Assign (Admin)
document.getElementById('create-class').addEventListener('click', () => {
    const className = document.getElementById('new-class').value;
    const teacher = document.getElementById('assign-teacher').value;
    if (className && teacher) {
        classes[className] = { teacher, students: students.filter(s => s.class === className).map(s => s.examNumber) };
        saveData('classes', classes);
        alert(`Class ${className} assigned to ${teacher}`);
        document.getElementById('new-class').value = '';
        document.getElementById('assign-teacher').value = '';
    }
});

// Teacher: Load assigned class
function loadTeacherClass() {
    const assigned = Object.entries(classes).find(([_, c]) => c.teacher === currentUser.name);
    if (assigned) {
        const [className] = assigned;
        document.getElementById('teacher-class').textContent = `Class: ${className}`;
        const classStudents = students.filter(s => classes[className].students.includes(s.examNumber));
        const select = document.getElementById('student-select');
        select.innerHTML = classStudents.map(s => `<option value="${s.examNumber}">${s.name} (${s.examNumber})</option>`).join('');
        loadSubjects(className);
    } else {
        document.getElementById('teacher-class').textContent = 'No class assigned. Contact admin.';
    }
}

// Dynamic subjects input
function loadSubjects(className) {
    const subjects = ['English', 'Math', 'Biology', 'Physics', 'Chemistry']; // Demo subjects
    const html = subjects.map(sub => `
        <div class="input-group">
            <label>${sub} - CA1/CA2/Exam:</label>
            <input type="number" name="ca1_${sub}" min="0" max="30" placeholder="CA1">
            <input type="number" name="ca2_${sub}" min="0" max="30" placeholder="CA2">
            <input type="number" name="exam_${sub}" min="0" max="40" placeholder="Exam">
        </div>
    `).join('');
    document.getElementById('subjects-inputs').innerHTML = html;
}

// Teacher upload results
document.getElementById('score-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const examNumber = document.getElementById('student-select').value;
    const student = students.find(s => s.examNumber === examNumber);
    const formData = new FormData(e.target);
    const subjects = ['English', 'Math', 'Biology', 'Physics', 'Chemistry'];
    subjects.forEach(sub => {
        const ca1 = parseFloat(formData.get(`ca1_${sub}`));
        const ca2 = parseFloat(formData.get(`ca2_${sub}`));
        const exam = parseFloat(formData.get(`exam_${sub}`));
        if (ca1 || ca2 || exam) {
            const total = (ca1 || 0) + (ca2 || 0) + (exam || 0);
            const percentage = (total / 100) * 100;
            results.push({
                studentName: student.name,
                examNumber,
                subject: sub,
                ca1: ca1 || 0, ca2: ca2 || 0, exam: exam || 0,
                total, percentage, grade: getGrade(percentage), remark: getRemark(percentage)
            });
        }
    });
    saveData('results', results);
    alert('Results uploaded!');
});

// Parent check (unchanged, but enhanced)
document.getElementById('check-result').addEventListener('click', () => {
    // Same as before, but shows all subjects
    const examNum = document.getElementById('parent-exam-number').value;
    const studentResults = results.filter(r => r.examNumber === examNum);
    if (studentResults.length) {
        document.getElementById('parent-result').innerHTML = studentResults.map(r => `
            <div class="result-card">
                <h4>${r.subject}</h4>
                <p>Total: ${r.total}/100 | ${r.grade} | ${r.remark}</p>
            </div>
        `).join('');
    } else {
        document.getElementById('parent-result').innerHTML = '<p>No results found.</p>';
    }
});

// Print all (teacher/admin)
document.getElementById('print-all').addEventListener('click', () => window.print());

// AI Chat (fake responses for engagement)
document.getElementById('ai-send').addEventListener('click', () => {
    const query = document.getElementById('ai-input').value.toLowerCase();
    let response = 'How can I help?';
    if (query.includes('result')) response = 'Check your exam number in Parent Portal.';
    if (query.includes('news')) response = 'Latest: Exams next week!';
    if (query.includes('grade')) response = 'Grades: A1=75%+, F9<40%. Study hard!';
    document.getElementById('ai-response').textContent = `🤖 AI: ${response}`;
    document.getElementById('ai-input').value = '';
});

// Logout (all)
document.querySelectorAll('#logout').forEach(btn => {
    btn.addEventListener('click', () => {
        currentUser = null;
        location.reload();
    });
});

// WAEC Grade/Remark (unchanged)
function getGrade(p) {
    if (p >= 75) return 'A1'; if (p >= 70) return 'B2'; if (p >= 65) return 'B3'; if (p >= 60) return 'C4';
    if (p >= 55) return 'C5'; if (p >= 50) return 'C6'; if (p >= 45) return 'D7'; if (p >= 40) return 'E8';
    return 'F9';
}
function getRemark(p) {
    if (p >= 75) return 'Outstanding!'; if (p >= 60) return 'Well done!'; if (p >= 45) return 'Improve.'; return 'Needs help.';
}

// Voice
function speak(text) { if ('speechSynthesis' in window) speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }
