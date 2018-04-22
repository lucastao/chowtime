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

function submit(form) {
	$.ajax({
		url: "/register",
		method: "POST",
		data: {
			"regEmail": document.getElementsByName("regEmail")[0].value,
			"regPassword": document.getElementsByName("regPassword")[0].value,
			"confPassword": document.getElementsByName("conf-password")[0].value
		},
		success: function(data) {
			alert("Account successfully created.");
		},
		error: function(error) {
			alert(error.responseText);
		}
	});
}

function login(form) {
	$.ajax({
		url: "/login",
		method: "POST",
		data: {
			"email": document.getElementsByName("email")[0].value,
			"password": document.getElementsByName("password")[0].value
		},
		success: function(data) {
			//alert(window.location.pathname);
			//window.location.replace("http://localhost:6211/server/src/html/home-user.html");
			//var myWindow = window.open("","_self");
			document.open('text/html');
			document.write(data);
			document.close();
			//myWindow.document.write(data);
			//$("html").html(data);
			//window.location.href = data;
		},
		error: function(error) {
			alert(error.responseText);
		}
	});
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
