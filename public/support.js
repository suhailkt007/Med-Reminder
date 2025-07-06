let back=document.getElementById('back');
back.addEventListener('click',function(){
    console.log('button clicked');
    goBack();
});
function goBack() {
    window.location.href = "main.html";
}
let submit=document.getElementById('submit');
submit.addEventListener('click',function(){
    console.log('button clicked');
    submitSupportRequest();
});
function submitSupportRequest() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let message = document.getElementById("message").value;
    
    if (name && email && message) {
        alert("Your support request has been submitted. We will contact you soon.");
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("message").value = "";
    } else {
        alert("Please fill out all fields before submitting.");
    }
}
