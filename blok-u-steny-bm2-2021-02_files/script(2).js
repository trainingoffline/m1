$(function(){

	$(document).on("submit", "form.vote-form", function(e) {
		
		var data = [];

		// переберём все элементы input, textarea и select формы с id="myForm "
		$(this).find('input, textarea, select').each(function(){
			
			//console.log(this.type);
			if (this.type != 'hidden' && this.type != 'submit')
			{
				if (this.type == 'radio')
				{
					if ($(this).prop('checked'))
						data.push($(this).val());
				}
				else if (!!$(this).val())
				{
					data.push($(this).val());
				}
			}
		});
		
		console.log(data.length);
		console.log(data);
		
		if (data.length > 0)
		{
			console.log('true');
			return true;
		}
		
		BX.closeWait();
		return false;
	});

});