// ================= COUNTER ANIMATION =================

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const target = +counter.getAttribute("data-target");

    let count = 0;

    const updateCounter = () => {

        const increment = target / 100;

        if (count < target) {

            count += increment;

            counter.innerText = Math.ceil(count);

            setTimeout(updateCounter, 20);

        } else {

            counter.innerText = target;
        }
    };

    updateCounter();

});

// ================= GREEN PLEDGE =================

const pledgeBtn =
document.getElementById("pledgeBtn");

if(pledgeBtn){

    pledgeBtn.addEventListener("click", function(){

        const message =
        document.getElementById("pledgeMessage");

        message.innerHTML =
        "✅ Thank you for taking the Green Pledge! Together we can create a cleaner and more sustainable future.";

        message.style.color = "#ffffff";

        pledgeBtn.innerHTML =
        "🌱 Pledge Taken";

        pledgeBtn.disabled = true;

        pledgeBtn.style.opacity = "0.8";

        pledgeBtn.style.cursor = "default";

    });

}


// ================= QUIZ =================

function answerQuiz(correct){

    const result =
    document.getElementById("quizResult");

    if(correct){

        result.innerHTML =
        "✅ Correct! Cars generally emit more CO₂ per passenger than buses.";

        result.style.color = "#2d6a4f";

    }else{

        result.innerHTML =
        "❌ Incorrect. Cars usually emit more CO₂ per passenger than buses.";

        result.style.color = "#c62828";
    }
}