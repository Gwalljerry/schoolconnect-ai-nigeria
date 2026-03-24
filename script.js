const PASSWORD = 'teacher123'; // Change for production
const ENCRYPT_KEY = 'SchoolConnect2026';

// Nigerian WAEC Grading [web:1][web:5]
function getGrade(percentage) {
    if (percentage >= 75) return 'A1 (Excellent)';
    if (percentage >= 70) return 'B2 (Very Good)';
    if (percentage >= 65) return 'B3 (Good)';
    if (percentage >= 60) return 'C4 (Credit)';
    if (percentage >= 55) return 'C5 (Credit)';
    if (percentage >= 50) return 'C6 (Credit)';
    if (percentage >= 45) return 'D7 (Pass)';
    if (percentage >= 40) return 'E8 (Pass)';
    return 'F9 (Fail)';
}

function getRemark(percentage) {
    if (percentage >= 75) return 'Excellent! Keep it up. 👏';
    if (percentage >= 60) return 'Good performance. Aim higher! 📈';
    if (percentage >= 45) return 'Fair. Work harder. 💪';
    return 'Needs improvement. Seek help. ⚠️';
}

// Encrypt/Decrypt
function encrypt(data) { return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPT_KEY).toString(); }
function decrypt(encrypted) { try { return JSON.parse(CryptoJS.AES.decrypt(encrypted, ENCRYPT_KEY).toString(CryptoJS.enc.Utf8)); } catch { return null; } }

// Load saved results
function loadResults() {
    const encrypted = localStorage.getItem('encryptedResults');
    return encrypted ? decrypt(encrypted) || [] : [];
}
function saveResults(results) {
    localStorage.setItem('encryptedResults', encrypt(results));
}

// Login
document.getElementById('login-btn').addEventListener('click', () => {
    if (document.getElementById('teacher-password').value === PASSWORD) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('teacher-dashboard').classList.remove('hidden');
        document.getElementById('results-list').classList.remove('hidden');
        displayResults();
    } else {
        alert('Wrong password!');
    }
});

// Upload form
document.getElementById('score-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('student-name').value,
        examNumber: document.getElementById('exam-number').value,
        subject: document.getElementById('subject').value,
        ca1: parseFloat(document.getElementById('ca1').value),
        ca2: parseFloat(document.getElementById('ca2').value),
        exam: parseFloat(document.getElementById('exam').value),
        total: 0, percentage: 0, grade: '', remark: ''
    };
    data.total = data.ca1 + data.ca2 + data.exam;
    data.percentage = (data.total / 100) * 100;
    data.grade = getGrade(data.percentage);
    data.remark = getRemark(data.percentage);

    const results = loadResults();
    results.push(data);
    saveResults(results);
    displayResults();
    document.getElementById('score-form').reset();
    speak('Result uploaded securely!');
});

// Display results (teacher)
function displayResults() {
    const results = loadResults();
    const html = results.map(r => `
        <div class="result-card">
            <h4>${r.name} (${r.examNumber}) - ${r.subject}</h4>
            <p>Total: ${r.total}/100 | ${r.percentage.toFixed(1)}% | ${r.grade} | ${r.remark}</p>
            <button onclick="printCard('${r.examNumber}')">Print Card</button>
        </div>
    `).join('');
    document.getElementById('results-display').innerHTML = html || '<p>No results yet.</p>';
}

// Parent check
document.getElementById('check-result').addEventListener('click', () => {
    const examNum = document.getElementById('parent-exam-number').value;
    const results = loadResults();
    const result = results.find(r => r.examNumber === examNum);
    if (result) {
        document.getElementById('parent-result').innerHTML = `
            <div class="result-card">
                <h3>${result.name} - ${result.subject}</h3>
                <p>CA1: ${result.ca1}/30 | CA2: ${result.ca2}/30 | Exam: ${result.exam}/40</p>
                <p><strong>Total: ${result.total}/100 (${result.percentage.toFixed(1)}%)</strong></p>
                <p><strong>Grade: ${result.grade}</strong></p>
                <p>${result.remark}</p>
            </div>
        `;
    } else {
        document.getElementById('parent-result').innerHTML = '<p>Result not found.</p>';
    }
});

// Print single card
function printCard(examNum) {
    const results = loadResults();
    const result = results.find(r => r.examNumber === examNum);
    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html><head><title>Report Card</title>
        <style>body{font-family:Arial; padding:20px; max-width:600px; margin:auto;}
        .card{background:white; padding:40px; border:2px solid #4CAF50; border-radius:10px;}
        h1{text-align:center; color:#4CAF50;}</style></head>
        <body><div class="card">
        <h1>SchoolConnect Report Card</h1>
        <h2>${result.name} | Exam No: ${result.examNumber}</h2>
        <p><strong>Subject:</strong> ${result.subject}</p>
        <p>CA1: ${result.ca1}/30 | CA2: ${result.ca2}/30 | Exam: ${result.exam}/40</p>
        <h3>Total: ${result.total}/100 | ${result.percentage.toFixed(1)}% | ${result.grade}</h3>
        <p>${result.remark}</p>
        </div></body></html>
    `);
    printWin.document.close();
    printWin.print();
}

// Print all
document.getElementById('print-all').addEventListener('click', () => {
    window.print();
});

// Logout
document.getElementById('logout').addEventListener('click', () => {
    location.reload();
});

// Voice (unchanged)
function speak(text) {
    if ('speechSynthesis' in window) {
        speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
}
