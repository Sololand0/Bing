<!-- views/admin.ejs -->
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <title>صفحة الإدارة - إضافة اختبار جديد</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="admin-container">
    <h2>إضافة اختبار جديد</h2>
    <form id="addQuestionForm">
      <div>
        <label for="question">السؤال:</label>
        <input type="text" id="question" name="question" required>
      </div>
      <div>
        <label for="image">رابط الصورة:</label>
        <input type="text" id="image" name="image">
      </div>
      <div>
        <label for="options">الاختيارات (مفصولة بفاصلة):</label>
        <input type="text" id="options" name="options" required>
      </div>
      <div>
        <label for="correctIndex">رقم الاختيار الصحيح (0,1,2,...):</label>
        <input type="number" id="correctIndex" name="correctIndex" required>
      </div>
      <button type="submit">أضف الاختبار</button>
    </form>
    <div id="message"></div>
  </div>

  <script>
    document.getElementById('addQuestionForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const question = document.getElementById('question').value;
      const image = document.getElementById('image').value;
      const optionsStr = document.getElementById('options').value;
      const correctIndex = parseInt(document.getElementById('correctIndex').value, 10);
      // تحويل سلسلة الاختيارات إلى مصفوفة
      const options = optionsStr.split(',').map(opt => opt.trim());

      fetch('/api/add-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, image, options, correctIndex })
      })
      .then(response => response.json())
      .then(data => {
        document.getElementById('message').textContent = data.message;
        document.getElementById('addQuestionForm').reset();
      })
      .catch(err => {
        console.error(err);
        document.getElementById('message').textContent = 'حدث خطأ أثناء إضافة الاختبار';
      });
    });
  </script>
</body>
</html>
