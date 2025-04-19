let currentCategory = "";
let currentQuestionIndex = 0;
let score = 0;
let selectedQuestions = [];
let selectedOption = null;

// دالة لبدء الاختبار من صفحة front.html
function startQuiz(category) {
    currentCategory = category;
    window.location.href = `quiz.html?category=${category}`;
}

// تحميل الأسئلة عند فتح صفحة quiz.html
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get("category");

    if (currentCategory && quizQuestions[currentCategory]) {
        selectedQuestions = quizQuestions[currentCategory];
        document.getElementById("category-name").innerText = getCategoryName(currentCategory);
        document.getElementById("total-questions").innerText = selectedQuestions.length;
        if (document.getElementById("category-name-result")) {
            document.getElementById("category-name-result").innerText = getCategoryName(currentCategory);
        }

        // إظهار النافذة المنبثقة إذا كان المجال هو التعليق الصوتي
        const modal = document.getElementById("voiceOverModal");
        if (modal && currentCategory === "voice-over") {
            modal.style.display = "flex";
            document.body.classList.add("modal-open");
        }

        loadQuestion();
    } else {
        const quizBox = document.querySelector(".quiz-box");
        if (quizBox) {
            quizBox.innerHTML = "<p>خطأ: المجال غير موجود أو الأسئلة غير متوفرة. يرجى العودة إلى الصفحة الرئيسية.</p>";
        }
    }

    // تحميل النتيجة في صفحة result.html
    if (window.location.pathname.includes("result.html")) {
        const finalScore = localStorage.getItem("score") || 0;
        document.getElementById("score").innerText = `${finalScore}%`;
        const note = getResultNote(finalScore);
        document.getElementById("result-note").innerText = note;
    }

    // تحميل النتائج في صفحة features.html
    if (window.location.pathname.includes("features.html")) {
        loadQuizResults();
    }
});

// دالة لإغلاق النافذة المنبثقة للتعليق الصوتي
function closeModal() {
    const modal = document.getElementById("voiceOverModal");
    if (modal) {
        modal.style.display = "none";
        document.body.classList.remove("modal-open");
    }
}

// دالة لفتح النافذة المنبثقة في pricing.html
function openPricingModal() {
    const modal = document.getElementById("pricingModal");
    if (modal) {
        modal.style.display = "flex";
        document.body.classList.add("modal-open");
    }
}

// دالة لإغلاق النافذة المنبثقة في pricing.html
function closePricingModal() {
    const modal = document.getElementById("pricingModal");
    if (modal) {
        modal.style.display = "none";
        document.body.classList.remove("modal-open");
    }
}

// دالة لتحميل السؤال الحالي
function loadQuestion() {
    if (!selectedQuestions || selectedQuestions.length === 0) {
        const quizBox = document.querySelector(".quiz-box");
        quizBox.innerHTML = "<p>لا توجد أسئلة متاحة لهذا المجال.</p>";
        return;
    }

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    let questionText = currentQuestion.question;

    // استبدال النصوص الإنجليزية بـ <span> مع dir="ltr" لضمان العرض الصحيح
    questionText = questionText.replace(/(let|var|JavaScript|Python|Pandas|React|HTML|CSS|GitHub|String|parseInt|Photoshop|PNG|RGB|Lasso Tool|Raster|Vector|Illustrator|Grid|HEX|Pen Tool|Figma|Premiere Pro|MP4|Timeline|Razor Tool|After Effects|24 fps|WAV|Transition|Effect|CapCut|Keyframe|Audacity|Condenser|Noise Reduction|Adobe Audition|44\.1 kHz|Mono|Stereo|Pop Filter|WavePad)/g, 
        '<span class="ltr">$1</span>');

    document.getElementById("question-text").innerHTML = questionText;
    document.getElementById("question-number").innerText = currentQuestionIndex + 1;

    // تحديث شريط التقدم
    const progress = (currentQuestionIndex + 1) / selectedQuestions.length * 100;
    document.getElementById("progress").style.width = `${progress}%`;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";
    selectedOption = null;

    currentQuestion.options.forEach(option => {
        const btn = document.createElement("button");
        btn.innerText = option;
        btn.classList.add("option-btn");
        btn.onclick = () => checkAnswer(option, btn);
        optionsDiv.appendChild(btn);
    });
}

// دالة للتحقق من الإجابة وإضافة الوزن إلى النتيجة
function checkAnswer(option, button) {
    if (selectedOption) {
        selectedOption.classList.remove("selected");
    }

    button.classList.add("selected");
    selectedOption = button;

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    if (option === currentQuestion.correct) {
        score += currentQuestion.weight;
    }
    document.getElementById("next-btn").disabled = false;
}

// دالة للانتقال إلى السؤال التالي
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
        loadQuestion();
        document.getElementById("next-btn").disabled = true;
    } else {
        // حساب النسبة المئوية بناءً على الوزن الإجمالي
        const totalWeight = selectedQuestions.reduce((sum, question) => sum + question.weight, 0);
        const finalScore = Math.round((score / totalWeight) * 100);
        localStorage.setItem("score", finalScore);
        let quizResults = JSON.parse(localStorage.getItem("quizResults")) || [];
        quizResults.push({
            category: getCategoryName(currentCategory),
            score: score,
            totalWeight: totalWeight,
            percentage: finalScore
        });
        localStorage.setItem("quizResults", JSON.stringify(quizResults));
        window.location.href = "result.html";
    }
}

// دالة لإعادة تشغيل الاختبار
function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    window.location.href = "front.html";
}

// دالة لتحميل النتائج في صفحة features.html
function loadQuizResults() {
    const resultsContainer = document.getElementById("quiz-results");
    const quizResults = JSON.parse(localStorage.getItem("quizResults")) || [];

    if (quizResults.length === 0) {
        resultsContainer.innerHTML = "<p>لا توجد نتائج بعد. قم بإجراء اختبار أولاً!</p>";
        return;
    }

    let resultsHTML = "<table><tr><th>المجال</th><th>عدد الإجابات الصحيحة</th><th>نسبة النجاح</th></tr>";
    quizResults.forEach(result => {
        resultsHTML += `<tr>
            <td>${result.category}</td>
            <td>${result.score} من ${result.totalWeight}</td>
            <td dir="ltr">${result.percentage}%</td>
        </tr>`;
    });
    resultsHTML += "</table>";
    resultsContainer.innerHTML = resultsHTML;
}

// دالة لحذف جميع الإحصائيات
function clearAllStats() {
    if (confirm("هل أنت متأكد أنك تريد حذف جميع الإحصائيات؟")) {
        localStorage.removeItem("quizResults");
        loadQuizResults(); // إعادة تحميل الجدول ليظهر فارغًا
    }
}

// دالة لإرسال الاقتراحات في صفحة about.html
function submitSuggestion() {
    const suggestionText = document.getElementById("suggestionText").value;
    if (suggestionText.trim() === "") {
        alert("يرجى كتابة اقتراح قبل الإرسال!");
        return;
    }
    alert("تم إرسال اقتراحك بنجاح! شكرًا لمساهمتك.");
    document.getElementById("suggestionText").value = "";
}

// دالة للحصول على اسم المجال باللغة العربية
function getCategoryName(category) {
    switch (category) {
        case "Programming":
            return "البرمجة";
        case "designer":
            return "الجرافيك ديزاين";
        case "video-editing":
            return "المونتاج";
        case "voice-over":
            return "التعليق الصوتي";
        case "scriptwriting":
            return "السكريبت";
        default:
            return "";
    }
}

// دالة لتحديد الملاحظة بناءً على نسبة النجاح
function getResultNote(percentage) {
    if (percentage >= 0 && percentage <= 20) {
        return "المجال غير مناسب لك.";
    } else if (percentage >= 21 && percentage <= 40) {
        return "تحتاج إلى التعرف أكثر على طبيعة المجال والتفكير جيدًا قبل اختياره.";
    } else if (percentage >= 41 && percentage <= 70) {
        return "المجال مناسب لطبيعتك وتستطيع التطور فيه والعمل به.";
    } else if (percentage >= 71 && percentage <= 100) {
        return "المجال اخترع من أجلك!";
    } else {
        return "";
    }
}