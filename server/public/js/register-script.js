var modal = document.querySelector(".modal");
var trigger = document.querySelector(".trigger");
var closeButton = document.querySelector(".close-button");
var sep = document.getElementById("sepId");
var sepText = document.getElementById("sepTextId");
function toggleModal() {
    modal.classList.toggle("show-modal");
    sep.classList.toggle("hide");
    sepText.classList.toggle("hide");
}
function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}
trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
	