#coding: utf-8

import serial
import bluetooth
import socket
from hashlib import md5
import os
import sys
import threading
from time import sleep
import json
import datetime
from collections import Counter
import re
import tweepy
from keys import *

MAC_ARDUINO = '20:16:10:25:34:24'
HOST = '127.0.0.1'
PORT = 8888

def adiciona_ocorrencia():
	agora = datetime.datetime.today()

	with open('data','a+') as f:
		f.write('{}/{};{}:{}@'.format(str(agora.day).zfill(2),str(agora.month).zfill(2),str(agora.hour).zfill(2),str(agora.minute).zfill(2))) # DD/MM;HH:MM@DD/MM;HH:MM@
	
	print('Publicando no twitter.')
	api.update_status('Presença detectada às {}:{} de {}/{}/{}'.format(str(agora.hour).zfill(2),str(agora.minute).zfill(2),str(agora.day).zfill(2),str(agora.month).zfill(2),str(agora.year).zfill(4)))


def dados_ocorrencias():
	try:
		dados = ''
		with open('data','r') as f:
			dados = f.read()
		dados.replace('\n','')
		dados = dados.split('@')[:-1]
		dt = ''
		for x in dados:
			dt += x[:8]+'@'
		dt.replace('\n','')
		#dados = ''.join(x[:8] for x in dados)
		dados = dict(Counter(dt.split('@')))
		if '' in dados:
			dados.pop('')
		dados['erro'] = False 
		return json.dumps(dados)
	except:
		return json.dumps({'erro':True})

sock_bt = bluetooth.BluetoothSocket( bluetooth.RFCOMM )
print 'Conectando ao bluetooth...'
try:
	sock_bt.connect((MAC_ARDUINO, 1))
	print 'Bluetooth Conectado.'
except:
	print 'Não foi possível conectar ao bluetooth. O bluetooth esta aguardando conexão?'
	sys.exit(0)

auth = tweepy.OAuthHandler(ckey, csecret)
auth.set_access_token(akey, asecret)
api = tweepy.API(auth)

sock_mid = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock_mid.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sock_mid.bind((HOST, PORT))

try:
	while True:
		print 'Aguardando conexão com o servidor node...'
		sock_mid.listen(2)
		con, addr1 = sock_mid.accept()
		print 'Conectado com '+addr1[0]+':'+str(addr1[1])

		try:
			while True:
				print 'Aguardando instrução do servidor node...'
				data = con.recv(1024)
				try:
					dt = json.loads(str(data))
					sock_bt.send(dt['estado'])
					if(dt['equipamento'] == 'info'):
						if(dt['estado'] == 'T' or dt['estado'] == 'X'):
							ret = str(sock_bt.recv(1024)).replace('\n','')
						elif (dt['estado'] == 'S'):  # prox sensor
							ret = str(sock_bt.recv(1024))
							ret = ret[-1]
							if(ret == 'P'):
								threading.Thread(target=adiciona_ocorrencia, args=[]).start()
						else: # dt['estado'] == 'D'
							ret = dados_ocorrencias()
						con.send(ret)
					else:
						con.send('ack')
					
					print 'Eviado o comando "'+dt['equipamento']+':'+dt['estado']+'" para o arduino.'
				except Exception as f:
					print f
					con.send('erro')		
					
		except socket.error:
			print 'Erro ao receber informações do servidor node. Há conexão com o servidor?'
		finally:
			con.close()
except:
	pass
finally:
	sock_bt.close()
	con.close()
	sock_mid.close()

'''
# Região de memória que será usada para informar à thread do bluetooth que há informação para enviar
enviar_bluetooth = False
terminar_theads_bluetooth = False
terminar_middleware = False
info = ''

def escuta_bluetooth(sock):
	while terminar_theads_bluetooth == False:
		retorno = sock.recv(1024)
		print 'Retorno: ' + retorno

def envia_bluetooth(sock):
	while terminar_theads_bluetooth == False:
		global enviar_bluetooth
		global info
		if enviar_bluetooth == True :
			sock.send(info)
			enviar_bluetooth = False
			info = ''		
		sleep(0.3) # 300ms

def servidor_node(s):
	while terminar_middleware == False:
		print 'Aguardando conexão com o servidor node...'
		s.listen(2)
		con, addr1 = s.accept()
		print 'Conectado com '+addr1[0]+':'+str(addr1[1])

		terminar_theads_bluetooth = False
		t1.start()
		t2.start()

		conexao_node = True
		while conexao_node == True:
			try:
				data = con.recv(1024)
				try:
					dt = json.parse(data)
					con.send('ack')
					info = dt['estado']
					enviar_bluetooth = True
				except:
					con.send('erro')		
					
			except socket.error:
				print 'Erro ao receber informações do servidor node. Há conexão com o servidor?'
				terminar_theads_bluetooth = True
				conexao_node = False
		con.close()

sock = bluetooth.BluetoothSocket( bluetooth.RFCOMM )
try:
	print 'Conectando ao bluetooth...'
	sock.connect(('20:16:10:25:34:24', 1))
	print 'Bluetooth Conectado.'
except:
	print 'Não foi possível conectar ao bluetooth. O bluetooth esta aguardando conexão?'
	sys.exit(0)

t1 = threading.Thread(target=escuta_bluetooth, args=[sock])
t2 = threading.Thread(target=envia_bluetooth, args=[sock])

HOST = '127.0.0.1'
PORT = 8888
s1 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s1.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s1.bind((HOST, PORT))

t3 = threading.Thread(target=servidor_node, args=[s1])

t3.start()

raw_input('Pressione ENTER a qualquer momento para terminar a execução...\n')

terminar_theads_bluetooth = True
terminar_middleware = True

s1.close()
sock.close()

sleep(1)

print 'Fim da execução do middleware.'

sys.exit(0)
'''