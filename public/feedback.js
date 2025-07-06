
let submit = document.getElementById('submit');
submit.addEventListener("click", function () {
  console.log('button clicked');
  submitFeedback();
});
let back = document.getElementById('back');
back.addEventListener('click', function () {
  console.log('button clicked');
  goBack();
});
function goBack() {
  window.history.back();
}

function submitFeedback() {
  let name = document.getElementById("name").value;
  let feedback = document.getElementById("feedback").value;

  if (name && feedback) {
    alert("Thank you for your feedback, " + name + "!");
    document.getElementById("name").value = "";
    document.getElementById("feedback").value = "";
  } else {
    alert("Please fill out all fields before submitting.");
  }
}

