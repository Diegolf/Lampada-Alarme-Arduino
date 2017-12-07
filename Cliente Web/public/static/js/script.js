$(document).ready(function(){

	var local = window.location.href.split('8000')[0]+'8000/';
	var conectado = false;
	var est = 'S';
	var prox_detec = false;
	var bt_button = $('#bt_button');

	var colapID = -1;
	var labels = [];
	var data = [];
	var contador = 0;
	var chartTemp;
	var chartProx;

	bt_button.click(function(){
		Materialize.toast('Conectando ao Middleware...', 4000);
		bt_button.html('bluetooth_searching');
		bt_button.attr('title','Conectando ...');
		$('#link_bt_button').removeClass('pulse');

		$.ajax({
			url: local+'middleware',
			success: function (e) {
				console.log('Middleware: '+ e.data);
				Materialize.toast('Conectado.', 4000);
				conectado = true;
				bt_button.html('bluetooth_connected');
				bt_button.attr('title','Conectado ao Middleware.');
			},
			error: function (e) {
				conectado = false;
				console.log('Ocorreu um erro ao tentar conectar com o middleware. O middleware esta aguardando/aceitando conexões?');
				Materialize.toast('Erro ao conectar com o Middleware. O middleware esta aguardando/aceitando conexões?', 4000);
				reset_conexao();	
			},
			type: 'POST',
			data: '',
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			processData: false
		});

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

		var este = $(this);
		$.ajax({
			url: local+'controle',
			success: function (e) {
				if (e.erro == false){
					console.log('Retorno: '+ e.data);
					$('.lamp').children().removeClass('darken-3').addClass('darken-4');
					este.children().removeClass('darken-4').addClass('darken-3');
					Materialize.toast(este.attr('title'),4000);
				}
				else{
					console.log('Retorno: '+ e.data);
					Materialize.toast('Ocorreu um erro ao tentar mudar o estado da lâmpada.',4000);
				}
			},
			error: function (e) {
				ok = false
				console.log('Ocorreu um erro ao tentar mudar o estado da lâmpada.');
				Materialize.toast('Ocorreu um erro ao tentar mudar o estado da lâmpada.',4000);
			},
			type: 'POST',
			data: JSON.stringify({'equipamento':'lampada','estado': estado}),
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			processData: false
		});

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

		var este = $(this);
		$.ajax({
			url: local+'controle',
			success: function (e) {
				if (e.erro == false){
					console.log('Retorno: '+ e.data);
					$('.prox').children().removeClass('darken-3').addClass('darken-4');
					este.children().removeClass('darken-4').addClass('darken-3');
					Materialize.toast(este.attr('title'),4000);
				}else{
					Materialize.toast('Ocorreu um erro ao tentar mudar o estado do sensor de proximidade.',4000);
					console.log('Retorno: '+ e.data);
				}
			},
			error: function (e) {
				Materialize.toast('Ocorreu um erro ao tentar mudar o estado do sensor de proximidade.',4000);
				console.log('Ocorreu um erro ao tentar mudar o estado do sensor de proximidade. Há conexão com o middleware?');
			},
			type: 'POST',
			data: JSON.stringify({'equipamento':'proximidade', 'estado': estado}),
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			processData: false
		});
	});

	function atv(){
		if(!conectado){
			return;
		}
		$.ajax({
			url: local+'info',
			success: function (e) {
				if(e.erro == true){
					console.log('Conexão com Middleware perdida.');
					Materialize.toast('Conexão com Middleware perdida.',4000);
					reset_conexao();
				}else{
					if(e.detec == 3){
						if(/\d{2}\.\d{2}/.test(e.data)){
							Materialize.toast('Temperatura: '+e.data+' ºC',4000);
						}else{
							atv();
						}
					}else if(e.detec == 0){
						atv();
					}
				}
			},
			error: function (e) {
			},
			type: 'POST',
			data: JSON.stringify({'equipamento':'info', 'estado': 'T'}),
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			processData: false
		});
	}
	$('#tp').click(function(){
		atv()
	});

	window.setInterval(function(){
		if(!conectado){
			return;
		}
		$.ajax({
			url: local+'info',
			success: function (e) {
				if(e.erro == true){
					console.log('Conexão com Middleware perdida.');
					Materialize.toast('Conexão com Middleware perdida.',4000);
					reset_conexao();
				}else{
					if(e.detec == 1){
						if(prox_detec == false){
							console.log(e.data);
							Materialize.toast(e.data,25000);
							prox_detec = true;						
						}
					}else if(e.detec == 2){
						prox_detec = false;
						Materialize.Toast.removeAll();
						console.log(e.data);
						Materialize.toast(e.data,5000);
					}else if(e.detec == 3){
						if (est == 'X'){
							if(/\d{1,3}/.test(e.data) && e.data != 0){
								data.push(String(e.data));
								labels.push(++contador);
							}
						}else if(est == 'T'){
							if(/\d{2}\.\d{2}/.test(e.data)){
								data.push(String(e.data));
								labels.push(++contador);
							}
						}
						
						if(colapID == 1){
							chartTemp.update();
						}else if(colapID == 2){
							chartProx.update();
						}
					}
				}
			},
			error: function (e) {
				
			},
			type: 'POST',
			data: JSON.stringify({'equipamento':'info', 'estado': est}),
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			processData: false
		});
	}, 800);

	$('#temp_chart').click(function(){ 
		if(!conectado){
			Materialize.toast('Não há conexão com o Middleware.',4000);
			return;
		}
		contador = 0;
		data = [];
		labels = [];

		switch(colapID){
			default: colapID = 1; est = 'T'; break;
			case 1:	colapID = -1; est = 'S'; break;
		}

		var ctx = document.getElementById("chartTemp").getContext('2d');
		chartTemp = new Chart(ctx, {
		    			type: 'line',
		    			data: {
		    				labels: labels,
		    				datasets: [{
		    					label: 'Gráfico de temperatura em tempo real (em ºC)',
		    					data: data,
		    					backgroundColor: 'rgba(99, 132, 132, 0.8)',
		    					borderColor: 'rgba(0,0,0,1)',
		    					borderWidth: 1
		    				}]
		    			},
		    			options: {
		    				scales: {
		    					yAxes: [{
		    						ticks: {
		    							beginAtZero:true
		    						}
		    					}]
		    				}
		    			}
		    		});

	});

	$('#prox_chart').click(function(){ 
		if(!conectado){
			Materialize.toast('Não há conexão com o Middleware.',4000);
			return;
		}
		switch(colapID){
			default: colapID = 2; est = 'X'; break;
			case 2:	colapID = -1; est = 'S'; break;
		}

		contador = 0;
		data = [];
		labels = [];

		var ctx = document.getElementById("chartProx").getContext('2d');
		chartProx = new Chart(ctx, {
		    			type: 'line',
		    			data: {
		    				labels: labels,
		    				datasets: [{
		    					label: 'Gráfico de proximidade em tempo real (em Centímetros)',
		    					data: data,
		    					backgroundColor: 'rgba(99, 132, 132, 0.8)',
		    					borderColor: 'rgba(0,0,0,1)',
		    					borderWidth: 1
		    				}]
		    			},
		    			options: {
		    				scales: {
		    					yAxes: [{
		    						ticks: {
		    							beginAtZero:true
		    						}
		    					}]
		    				}
		    			}
		    		});
	});

	$('#hprox_chart').click(function(){
		if(!conectado){
			Materialize.toast('Não há conexão com o Middleware.',4000);
			return;
		}
		dados = '';
		$.ajax({
			url: local+'data',
			success: function (e) {
				e = JSON.parse(e);
				if (e.erro == true){
					console.log('Retorno: '+ e.data);
					Materialize.toast('Erro ao ler dados do Middleware',4000);
					return;
				}
				else{
		    		var labels = [];
		    		var data = [];
		    		delete e['erro'];
		    		var chaves  = Object.keys(e);
		    		chaves.sort();
		    		for (var key in chaves){
		    			console.log(chaves[key]);
		    			data.push(e[chaves[key]]);
		    			labels.push(String(chaves[key]).replace(';',' ') + ' horas');
		    		}
		    		var ctx = document.getElementById("myChart").getContext('2d');
		    		myChart = new Chart(ctx, {
		    			type: 'line',
		    			data: {
		    				labels: labels,
		    				datasets: [{
		    					label: 'Movimentação durante o período',
		    					data: data,
		    					backgroundColor: 'rgba(99, 132, 132, 0.8)',
		    					borderColor: 'rgba(0,0,0,1)',
		    					borderWidth: 1
		    				}]
		    			},
		    			options: {
		    				scales: {
		    					yAxes: [{
		    						ticks: {
		    							beginAtZero:true
		    						}
		    					}]
		    				}
		    			}
		    		});
		    	}
		    },
		    error: function (e) {
		    	console.log('Ocorreu um erro ao tentar ler os dados do Middleware.');
		    	Materialize.toast('Ocorreu um erro ao tentar ler os dados do Middleware.',4000);
		    	return;
		    },
		    type: 'GET',
		    data: '',
		    contentType: 'application/json;charset=UTF-8',
		    cache: false,
		    processData: false
		});
	});

	function reset_conexao(){
		conectado = false;
		bt_button.html('bluetooth_disabled');
		$('#link_bt_button').addClass('pulse');
		bt_button.attr('title','Conectar Bluetooth');
	}

});