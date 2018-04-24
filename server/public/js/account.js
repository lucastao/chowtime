function change_password() {
	if ($('#new-pwd').val() != $('#conf-new-pwd').val()) {
		alert("New passwords must match.");
		return;
	} else if ($('#new-pwd').val() == $('old-pwd').val()) {
		alert("Password must be different");
		return;
	}
	$.ajax({
		url: "/changePassword",
		method: "POST",
		data: {
			old: $('#old-pwd').val(),
			pwd: $('#new-pwd').val()
		},
		success: function(data) {
			alert("Password changed.");
		},
		error: function(error) {
			alert(error.responseText);
		}	
	});
}

function delete_account() {
	$.ajax({
		url: "/deleteAccount",
		method: "POST",
		data: {
		},
		success: function(data) {
			alert("Account has been deleted");
			document.open('text/html');
			document.write(data);
			document.close();
		},
		error: function(error) {
			alert(error.responseText);
		}
	});
}
