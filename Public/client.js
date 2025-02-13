// public/client.js
let currentQuestionIndex = 0;
let questions = [];
let clientScore = 0;
let clientName = "";  // متغير لتخزين اسم العميل

// عند النقر على زر بدء اللعبة
document.getElementById('startGameBtn').addEventListener('click', () => {
  const nameInput = document.getElementById('clientNameInput').value.trim();
  if (!nameInput) {
    alert("يرجى إدخال اسمك للبدء");
    return;
  }
  clientName = nameInput;
  // إخفاء قسم إدخال الاسم وإظهار قسم اللعبة
  document.getElementById('usernameContainer').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  fetchQuestions();
});

function fetchQuestions() {
  fetch('/api/questions')
    .then(response => response.json())
    .then(data => {
      questions = data;
      if (questions.length > 0) {
        showQuestion();
      } else {
        alert('لا توجد أسئلة متوفرة حالياً.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('حدث خطأ أثناء تحميل الأسئلة.');
    });
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    // انتهاء اللعبة وعرض النتيجة
    alert("انتهت الأسئلة! نتيجتك: " + clientScore);
    // إنشاء معرّف جلسة فريد وإرسال النتيجة مع اسم العميل إلى الخادم
    const sessionId = Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    fetch('/api/client-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, name: clientName, score: clientScore })
    })
    .then(response => response.json())
    .then(data => {
      console.log("تم حفظ النتيجة", data);
    })
    .catch(err => console.error("خطأ في حفظ النتيجة", err));
    return;
  }

  const question = questions[currentQuestionIndex];
  
  document.getElementById('question-text').textContent = question.question;
  document.getElementById('question-image').src = question.image || '';
  
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = option;
    button.onclick = () => checkAnswer(index);
    optionsContainer.appendChild(button);
  });

  updateProgress();
  updateStats();
}

function checkAnswer(selectedIndex) {
  const question = questions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.option-btn');
  
  buttons.forEach(button => button.disabled = true);
  
  if (selectedIndex === question.correctIndex) {
    clientScore++;
    buttons[selectedIndex].classList.add('correct');
    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion();
    }, 1500);
  } else {
    buttons[selectedIndex].classList.add('wrong');
    buttons[question.correctIndex].classList.add('correct');
    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion();
    }, 2500);
  }
}

function updateProgress() {
  const progress = (currentQuestionIndex / questions.length) * 100;
  document.getElementById('progress-bar').style.width = progress + '%';
}

function updateStats() {
  document.getElementById('stats').textContent =
    `السؤال ${currentQuestionIndex + 1} من ${questions.length} | النقاط: ${clientScore}`;
}
