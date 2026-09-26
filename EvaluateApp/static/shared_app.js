/* Evalvate Shared Data & Logic */

const DEFAULT_DB = {
  users: [
    { username: 'ProfSharma', password: 'pass123', usertype: 'Faculty', email: 'prof.sharma@school.edu' },
    { username: 'Meghana', password: 'pass123', usertype: 'Student', email: 'meghana@school.edu' }
  ],
  marksConfig: [
    { from: 1, to: 5, marks: 10 }
  ],
  evaluations: [
    {
      rollNumber: '2026CS101',
      studentName: 'Meghana G',
      totalMax: 30,
      totalAwarded: 21.69,
      records: [
        {
          question: 'Explain the process of photosynthesis in green plants.',
          studentAnswer: 'Plants convert sunlight, water, and carbon dioxide into oxygen and sugar energy.',
          maxMarks: 10,
          awardedMarks: 7.16,
          similarity: '89.5%'
        },
        {
          question: 'What is an algorithm and why is it important?',
          studentAnswer: 'An algorithm is a clear set of step-by-step rules or instructions to solve problems.',
          maxMarks: 10,
          awardedMarks: 7.38,
          similarity: '92.2%'
        },
        {
          question: 'What is an operating system?',
          studentAnswer: 'An operating system controls hardware devices and runs software applications on computers.',
          maxMarks: 10,
          awardedMarks: 7.15,
          similarity: '88.7%'
        }
      ]
    },
    {
      rollNumber: '2026CS102',
      studentName: 'Rahul V',
      totalMax: 30,
      totalAwarded: 19.50,
      records: [
        { question: 'Explain photosynthesis', studentAnswer: 'Process where plants use sun light.', maxMarks: 10, awardedMarks: 6.20, similarity: '78%' },
        { question: 'What is an algorithm?', studentAnswer: 'Code steps to complete tasks.', maxMarks: 10, awardedMarks: 6.80, similarity: '80%' },
        { question: 'Operating system?', studentAnswer: 'Windows and Linux system software.', maxMarks: 10, awardedMarks: 6.50, similarity: '76%' }
      ]
    },
    {
      rollNumber: '2026CS103',
      studentName: 'Ananya K',
      totalMax: 30,
      totalAwarded: 26.20,
      records: [
        { question: 'Explain photosynthesis', studentAnswer: 'Photosynthesis uses chlorophyll, carbon dioxide and sunlight to produce glucose.', maxMarks: 10, awardedMarks: 8.80, similarity: '95%' },
        { question: 'What is an algorithm?', studentAnswer: 'A precise finite sequence of computer instructions solving mathematical problems.', maxMarks: 10, awardedMarks: 8.90, similarity: '94%' },
        { question: 'Operating system?', studentAnswer: 'System software managing memory, processes, CPU scheduling and IO devices.', maxMarks: 10, awardedMarks: 8.50, similarity: '92%' }
      ]
    }
  ]
};

function getDB() {
  const data = localStorage.getItem('evalvate_db');
  if (!data) {
    localStorage.setItem('evalvate_db', JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_DB;
  }
}

function saveDB(db) {
  localStorage.setItem('evalvate_db', JSON.stringify(db));
}

// Global modal for demo details
function openDemoDetailsModal() {
  let modal = document.getElementById('global-demo-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-demo-modal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(5px);';
    modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; max-width:640px; width:100%; padding:30px; position:relative; box-shadow:0 25px 50px rgba(0,0,0,0.3); font-family:'DM Sans', sans-serif;">
        <button onclick="document.getElementById('global-demo-modal').remove()" style="position:absolute; top:18px; right:18px; border:none; background:#edf1e7; width:32px; height:32px; border-radius:50%; font-size:18px; cursor:pointer; font-weight:bold;">×</button>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="font-size:24px;">⚡</span>
          <h2 style="margin:0; font-family:'Manrope', sans-serif; font-size:22px; color:#222;">Demo Details & Credentials</h2>
        </div>
        <p style="color:#666; font-size:14px; margin-bottom:20px;">Use these pre-configured test credentials and sample papers to explore the entire evaluation workflow.</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
          <div style="background:#f9fbf8; border:1px solid #e1e7dc; border-radius:10px; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4 style="margin:0; color:#2a3b22;">Faculty Portal</h4>
              <span style="background:#eaf2e1; color:#395a1e; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px;">EXAMINER</span>
            </div>
            <p style="font-size:12px; color:#666; margin:6px 0 10px;">Define marks, evaluate papers, view leaderboards.</p>
            <div style="font-family:monospace; background:#fff; padding:8px; border-radius:6px; font-size:12px; border:1px solid #ddd; margin-bottom:12px;">
              Username: <b>ProfSharma</b><br>
              Password: <b>pass123</b>
            </div>
            <a class="button button-teal" style="display:block; text-align:center; height:36px; line-height:36px; padding:0; font-size:12px; color:#fff;" href="FacultyLogin.html">Go to Faculty Login →</a>
          </div>

          <div style="background:#f9fbf8; border:1px solid #e1e7dc; border-radius:10px; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4 style="margin:0; color:#2a3b22;">Student Portal</h4>
              <span style="background:#e7f0fa; color:#1a528e; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px;">CANDIDATE</span>
            </div>
            <p style="font-size:12px; color:#666; margin:6px 0 10px;">View question-wise breakdown and awarded scores.</p>
            <div style="font-family:monospace; background:#fff; padding:8px; border-radius:6px; font-size:12px; border:1px solid #ddd; margin-bottom:12px;">
              Username: <b>Meghana</b><br>
              Password: <b>pass123</b><br>
              Demo Roll: <b>2026CS101</b>
            </div>
            <a class="button button-dark" style="display:block; text-align:center; height:36px; line-height:36px; padding:0; font-size:12px; color:#fff;" href="StudentLogin.html">Go to Student Login →</a>
          </div>
        </div>

        <div style="background:#edf5fd; border:1px solid #b6d4fe; border-radius:10px; padding:14px; font-size:13px; color:#084298;">
          <b>Included Sample Test Files:</b>
          <div style="margin-top:4px;">• <code>Faculty_Reference_Key.pdf</code> (Reference answers for Q1, Q2, Q3)</div>
          <div>• <code>Student_Answer_Sheet.pdf</code> (Student transcribed answers)</div>
          <div style="margin-top:8px;">
            <a href="DemoDetails.html" style="font-weight:bold; text-decoration:underline;">View Complete Project Documentation & Evaluation Demo →</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}
