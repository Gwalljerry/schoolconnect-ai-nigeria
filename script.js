// Grading logic (Nigerian standard)
function calculateGrade(total) {
    if (total >= 70) return { grade: 'A', remark: 'Excellent performance, keep it up! 👏' };
    if (total >= 60) return { grade: 'B', remark: 'Good job, aim higher! 📈' };
    if (total >= 50) return { grade: 'C', remark: 'Fair, work harder. 💪' };
    if (total >= 40) return { grade: 'D', remark: 'Needs improvement in all areas. 📚' };
    return { grade: 'F', remark: 'Student needs urgent help in reading and math. ⚠️' };
}

// Form submission
document.getElementById('score-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const ca1 = parseFloat(document.getElementById('ca1').value);
    const ca2 = parseFloat(document.getElementById('ca2').value);
    const exam = parseFloat(document.getElementById('exam').value);

    const total = ca1 + ca2 + exam;
    const average = total / 100 * 100; // Out of 100
    const { grade, remark } = calculateGrade(total);

    document.getElementById('result-content').innerHTML = `
        <h3>${name}'s Results</h3>
        <div class="grid">
            <strong>CA1:</strong> <span>${ca1}/30</span>
            <strong>CA2:</strong> <span>${ca2}/30</span>
            <strong>Exam:</strong> <span>${exam}/40</span>
            <strong>Total:</strong> <span>${total}/100</span>
            <strong>Average:</strong> <span>${average.toFixed(2)}%</span>
            <strong>Grade:</strong> <span>${grade}</span>
        </div>
        <p><strong>Smart Suggestion:</strong> ${remark}</p>
    `;

    document.getElementById('teacher-mode').classList.remove('active');
    document.getElementById('teacher-mode').classList.add('hidden');
    document.getElementById('result-display').classList.remove('hidden');
    speak('Result calculated successfully!');
});

// Voice Feedback (Web Speech API - works offline on most devices)
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }
}

document.getElementById('voice-feedback').addEventListener('click', () => speak('Welcome to SchoolConnect AI Lite. Enter scores to calculate results.'));

// Save Offline (localStorage)
document.getElementById('save-result').addEventListener('click', () => {
    const results = JSON.parse(localStorage.getItem('results') || '[]');
    results.push({
        name: document.getElementById('student-name').value,
        total: parseFloat(document.getElementById('ca1').value) + parseFloat(document.getElementById('ca2').value) + parseFloat(document.getElementById('exam').value),
        grade: calculateGrade(/* total */).grade
    });
    localStorage.setItem('results', JSON.stringify(results));
    speak('Results saved offline!');
});

// Student Preview
document.getElementById('student-preview').addEventListener('click', () => {
    document.getElementById('result-display').classList.add('hidden');
    document.getElementById('student-mode').classList.remove('hidden');
    document.getElementById('student-result').innerHTML = document.getElementById('result-content').innerHTML;
});

document.getElementById('new-calc').addEventListener('click', () => {
    document.getElementById('score-form').reset();
    document.getElementById('result-display').classList.add('hidden');
    document.getElementById('teacher-mode').classList.remove('hidden');
    document.getElementById('teacher-mode').classList.add('active');
    document.getElementById('student-mode').classList.add('hidden');
});
