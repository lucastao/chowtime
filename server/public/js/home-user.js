function submit_recipe() {
	$.ajax({
		url: "/submit_recipe",
		method: "POST",
		data: {
			"name": document.getElementsByName("recipe-name")[0].value,
			"description": document.getElementsByName("recipe-description")[0].value ,
			"ingredients": document.getElementsByName("recipe-ingredients")[0].value ,
			"procedure": document.getElementsByName("recipe-procedure")[0].value
		},
		success: function(data) {
			alert(data);
		},
		error: function(error) {
			alert(error.responseText);
		} 
	});	
}
