var express = require('express');
var nunjucks = require('nunjucks');
var app = express();
var fs = require("fs");
var path = __dirname + "/";
var net = require('net');
var client = new net.Socket();

nunjucks.configure('views', {
	autoescape: true,
	express: app
});

app.use(express.static(__dirname + '/public'))
app.get(['/index.html','/'], function (req, res) {
	res.render('index.html');
});

app.get('/teste', function(req, res){
	client.write(JSON.stringify({'teste':'teste'}));

	// data da resposta do cliente
	client.on('data', function(data){
		res.json({'data': ''+data});
	});
});

app.post('/controle', function(req, res){
	res.writeHead(200, {"Content-Type": "application/json"});
	if (!conectado){
		return res.end(JSON.stringify({'erro': true, 'data':'Não há conexão com o middleware.'}));
	}
	// data da requisicao
	req.on('data', function(data){
		client.write(String(data));
	});

	var resp = '';
	client.on('data', function(data){
		if (data == 'ack'){
			resp = {'erro':false,'data':'Requisição enviada para o middleware.'};
		}else{
			resp = {'erro':true,'data':'Requisição enviada para o middleware, mas sem reporta.'};
		}
		res.end(JSON.stringify(resp));
	});

});

app.post('/info', function(req, res){
	res.writeHead(200, {"Content-Type": "application/json"});
	if (!conectado){
		return res.end(JSON.stringify({'erro': true, 'data':'Não há conexão com o middleware.'}));
	}
	// data da requisicao
	req.on('data', function(data){
		client.write(String(data));
		var resp = '';
		client.on('data', function(data){
			var dat = String(data).slice(-1);
			if (dat == 'A'){
				//if(prox_detec == false){
				//	prox_detec = true;
					resp = {'detec':1,'data':'O sensor de proximidade detectou movimentação.'};
				//}else{
				//	resp = {'detec':0,'data':data};
				//}
				
			}else if(dat == 'P'){
				resp = {'detec':2,'data':'A movimentação detectada saiu da área do sensor de proximidade.'};
			}else if(dat == 'p'){
				resp = {'detec':0,'data':'Nada detectado pelo sensor de proximidade'};
				//prox_detec = false;
			}else{ // data == sensor de temperatura
				resp = {'detec':3,'data':String(data)};
			}
			res.end(JSON.stringify(resp));
		});
	});	
});

app.get('/data', function(req, res){
	res.writeHead(200, {"Content-Type": "application/json"});
	if (!conectado){
		return res.end(JSON.stringify({'erro': true, 'data':'Não há conexão com o middleware.'}));
	}
	// data da requisicao
	
	client.write(JSON.stringify({'equipamento':'info','estado': 'D'}));
	var resp = '';
	client.on('data', function(data){
		var dat = String(data);
		res.end(JSON.stringify(dat));
	});

});

var conectado = false;
app.post('/middleware', function(req, res){
	if(conectado == true){
		res.json({'erro':false, 'data': 'Conexão estabelicida com o middleware'});
	}else{
		client.on('close', function(){
			conectado = false;
		});
	  //client.setTimeout(3000);
	  client.connect(8888,'127.0.0.1', function(){
	  	conectado = true;
	  	console.log('Conectado com o middleware');
	  	res.json({'erro':false, 'data': 'Conexão estabelicida com o middleware'});
	  });
	}
});

var server = app.listen(8000, "127.0.0.1", function () {

	var host = server.address().address
	var port = server.address().port

	console.log("Servidor escutando em: http://%s:%s", host, port)

});