# Plataforma para automação residencial arduino web integrada ao Twitter
<p> Trabalho da disciplina de WebServices do quarto período do curso de Sistemas para a Internet do IF Sudeste MG Barbacena.
  Dispositivo arduíno com uma lâmpada (simulada por um led) e um alarme controlados por um sensor de proximidade e um sensor de luminosidade que funcionam de acordo com as funções selecionada por um cliente web que consome a API de um servidor RESTfull para enviar comandos ao arduino.
  A conexão do arduino com o servidor é mediada por um middleware que utiliza Socket para comunicar com o servidor e Bluetooth para comunicar com o arduino.</p>

### Lista de funções da aplicação web
<ul>
  <li>
    <b> Controle da Lâmpada </b>
    <ul>
      <li><strong>Desativa a lâmpada</strong> - Mantém a lâmpada apagada independente dos sensores </li>
      <li><strong>Liga a lâmpada</strong> - Mantém a lâmpada acesa independente dos sensores </li>
      <li><strong>Ativa o modo automático</strong> - Ativa a lâmpada se alguma movimentação for detectada pelo sensor de proximidade e se a luminozidade do local for menor que 60% </li>
    </ul>
  </li>
  <li>
    <b> Controle do Sensor de Proximidade </b>
    <ul>
      <li><strong>Desativa o sensor</strong> - desativa as funções do sensor de proximidade </li>
      <li><strong>Ativa o sensor</strong> - Ativa as funções do sensor de proximidade </li>
      <li><strong>Ativa o sensor com o alarme</strong> - Ativa as funções do sensor de proximidade com o alarme. </li>
    </ul>
  </li>
</ul>

## Recursos
<table>
    <tr>
        <th> Cliente WEB </th>
        <th> Servidor RESTfull </th>
        <th> Middleware </th>
        <th> Arduino </th>
    </tr>
    <tr>
        <td>
            Javascript
            <br/> Jquery
            <br/> Materialize
            <br/> Ajax
            <br/> Chart.js
            <br/> Json
            <br/> Regexp
        </td>
        <td>
            Node.js
            <br/> express
            <br/> net.Socket
            <br/> nunjucks
            <br/> Json
        </td>
        <td>
            serial
            <br/> bluetooth
            <br/> socket
            <br/> threading
            <br/> json
            <br/> datetime
            <br/> tweepy
            <br/> re (expressão regular)
        </td>
        <td>
            Sonar HC-SR04
            <br/> Módulo Bluetooth HC-06
            <br/> Sensor de temperatura LM35
            <br/> Zumbador HY-05
            <br/> Sensor de luminozidade
            <br/> Arduino MEGA 2560
        </td>
    </tr>
</table>



## Página Web
![alt text](https://i.imgur.com/KUJFiHn.png)

## Arduino
![alt text](https://i.imgur.com/ejwcXfY.jpg)



