$(document).ready(function(){

	var conectado = false;
	var bt_button = $('#bt_button');
	bt_button.click(function(){
		Materialize.toast('Conectando ao Middleware...', 4000);
		bt_button.html('bluetooth_searching');
		bt_button.attr('title','Conectando ...');
		$('#link_bt_button').removeClass('pulse');

		$.ajax({
			url: window.location.href+'middleware',
				success: function (e) {
					console.log('Middleware: '+ e.data);
					conectado = true;
				},
				error: function (e) {
					conectado = false;
					console.log('Ocorreu um erro ao tentar conectar com o middleware. O middleware esta aguardando/aceitando conexões?');
				},
				type: 'POST',
				data: '',
				contentType: 'application/json;charset=UTF-8',
				cache: false,
				processData: false
		});
		
		if(conectado){
			bt_button.html('bluetooth_connected');
			bt_button.attr('title','Conectado ao Middleware.');
			Materialize.toast('Conectado.', 4000);
		}else{
			bt_button.html('bluetooth_disabled');
			$('#link_bt_button').addClass('pulse');
			bt_button.attr('title','Conectar Bluetooth');
			Materialize.toast('Erro ao conectar com o Middleware. O middleware esta aguardando/aceitando conexões?', 4000);
		}
	});

	$('.lamp').click(function() {
		if(!conectado){
			Materialize.toast('Não há conexão com o Middleware.',4000);
			return;
		}

		var lamp = $(this).attr('value');
		var estado;
		if (lamp == 'acende'){
			estado = 'L';
		}else if(lamp == 'desativa'){
			estado = 'l';
		}else if(lamp == 'automatica'){
			estado = 'A';
		}else{
			console.log('Valor inválido para o controle da Lâmpada.');
			return;
		}

		var ok = false;
		$.ajax({
			url: window.location.href+'controle',
				success: function (e) {
					if (e.erro == true){
						ok = false;
						console.log('Ocorreu um erro ao tentar mudar o estado da lâmpada. Há conexão com o middleware?');
					}
					else{
						ok = true;
						console.log('Retorno: '+ e.data);
					}
				},
				error: function (e) {
					ok = false
					console.log('Ocorreu um erro ao tentar mudar o estado da lâmpada.');
				},
				type: 'POST',
				data: JSON.stringify({'equipamento':'lampada','estado': estado}),
				contentType: 'application/json;charset=UTF-8',
				cache: false,
				processData: false
		});

		if(ok){
			$('.lamp').children().removeClass('darken-3').addClass('darken-4');
			$(this).children().removeClass('darken-4').addClass('darken-3');
			Materialize.toast($(this).attr('title'),4000);
		}else{
			Materialize.toast('Ocorreu um erro ao tentar mudar o estado da lâmpada.',4000);
		}
	});

	$('.prox').click(function() {
		if(!conectado){
			Materialize.toast('Não há conexão com o Middleware.',4000);
			return;
		}

		var arg = $(this).attr('value');
		var estado;
		if (arg == 'desativa'){
			estado = 'p';
		}else if(arg == 'ativa-sem-alarme'){
			estado = 'P';
		}else if(arg == 'ativa-com-alarme'){
			estado = 'W';
		}else{
			console.log('Valor inválido para o sensor de proximidade.');
			return;
		}

		var ok = false;
		$.ajax({
			url: window.location.href+'controle',
				success: function (e) {
					if (e.erro == true){
						ok = false;
						console.log('Ocorreu um erro ao tentar mudar o estado do sensor de proximidade. Há conexão com o middleware?');
					}else{
						ok = true;
						console.log('Retorno: '+ e.data);
					}
				},
				error: function (e) {
					console.log('Ocorreu um erro ao tentar mudar o estado do sensor de proximidade.');
				},
				type: 'POST',
				data: JSON.stringify({'equipamento':'proximidade', 'estado': estado}),
				contentType: 'application/json;charset=UTF-8',
				cache: false,
				processData: false
		});

		if(ok){
			$('.prox').children().removeClass('darken-3').addClass('darken-4');
			$(this).children().removeClass('darken-4').addClass('darken-3');
			Materialize.toast($(this).attr('title'),4000);
		}else{
			Materialize.toast('Ocorreu um erro ao tentar mudar o estado do sensor de proximidade.',4000);
		}
		
	});

	
	$('.collapsible').collapsible({
	    accordion: false, // A setting that changes the collapsible behavior to expandable instead of the default accordion style
	    onOpen: function(el) { console.log('Open'); }, // Callback for Collapsible open
	    onClose: function(el) {} // Callback for Collapsible close
	    // Para temperatura, mudar o valor da variável que busca a cada segundo a proximidade para 'T'
	});


});
/*
GRAFICO DE TEMPERATURA E DE PROXIMIDADE
PROXIMIDADE LE UM BD DO MIDDLEWARE
TEMPERATURA É GERADO DINAMICAMENTE


*/