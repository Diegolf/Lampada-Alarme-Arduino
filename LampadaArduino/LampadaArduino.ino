#include <NewPing.h> // Sonar
#include <NewTone.h> // Zumbador

// Define o pino do led (que representa uma lâmpada)
#define PORTA_LED 2   

// Define o pino do sensor de luminozidade
#define SENSOR_LM A0

// Define os pinos trigger e echo do sensor ultrasonico
#define PINO_TRIGGER 4
#define PINO_ECHO 5

// Define o pino a ser utilizado pelo ZUMBADOR (que representa o alarme)
#define ZUMBADOR 7

// Define o tempo limite para a lâmpada e o alarme permanecerem acessos após sua ativação.
#define LIMITE_TEMPO 5000

// Define a distância máxima na qual o sensor de proximidade vai confirmar uma presença, em CM.
#define DIST_PROX 10

// Define a porcentagem de luminozidade máxima para acender a lâmpada 
#define LUMI_MAX 70

long millisAnterior = 0; // Tempo em que foi detectado alguma presença pela última vez.
boolean ativo = false; // Indicia se a lâmpada ou o alarme foram ativados por uma presença

// Variáveis utilizadas pelo ZUMBADOR
float sinVal;
int toneVal;

// Variável utilizada pelo sensor de temperatura
int lm35 = A1;

// Variáveis responsáveis por indicar o modo de funcionamento selecionado pelo usuário
int px = 2; // Proximidade: 0 - Desativado; 1 - Com Alarme ; 2 - Sem Alarme
int ld = 1; // Lâmpada: 0 - Desativada ; 1 - Automático ; 2 - Ativada

// Variável que recebe os valores lidos pelo módulo bluetooth
char comando;

// Inicializa o sensor de proximidade e define a distância máxima como 4 metros
NewPing sonar(PINO_TRIGGER, PINO_ECHO, 400);

void setup(){  
  Serial.begin(9600);
  Serial3.begin(9600);
  pinMode(PORTA_LED, OUTPUT);
  pinMode(SENSOR_LM,INPUT_PULLUP);

  if ( ld == 2)
    digitalWrite(PORTA_LED, HIGH);
}  

void loop(){  

  proximidade();
  if(ativo)
    verificarTempo();  

  while(Serial3.available()){
    comando = Serial3.read();
    if (comando  != 13 && comando != 10)
      executaRequisicao();
  }
  
  delay(30); 
}  

/* Lê o valor do sensor de luminozidade, mapeia para porcentagem e age sobre a
  lâmpada de acordo com o valor lido e a função atualmente configurada para a lâmpada:
    0. Mantém a lâmpada apagada idependentemente do valor lido ; 
    1. Acende a lâmpada caso a luminozidade do local esteja < 60% ;
    3. Acende a lâmpada. */
void luminozidade(){
  if(ld == 0){
    digitalWrite(PORTA_LED, LOW);
    
  }else if (ld == 1){
    int lm = analogRead(SENSOR_LM); // Lê o valor fornecido pelo sensor
    lm = map(lm, 0, 1023, 100, 0); // Mapeia a luminozidade lida para 0 a 100
    
    if (lm < LUMI_MAX){ // menos que 60% de luminozidade     
      digitalWrite(PORTA_LED, HIGH); // Acende a Lâmpada
    }else{
      digitalWrite(PORTA_LED, LOW);  // Apaga/Mantém apagada a Lâmpada
    }
      
  }else if( ld == 2){
    digitalWrite(PORTA_LED, HIGH);
  }
  
}

/* Lê o valor do sensor de temperatura e envia o valor recebido por Bluetooh */
void temperatura(){
  Serial3.println((float(analogRead(lm35))*5/(1023))/0.01);
}

/* Lê o valor do sensor de proximidade três vezes (para evitar possíveis falsos positivos onde
 o valor do sensor pode variar de formas inesperadas e sem motivo), caso algo seja detectado próximo, 
 age de acordo com a função atualmente configurada: 
  0. Desativado.
  1. Executa a função que controla a Lâmpada e ativa o alarme;
  2. Executa a função que controla a Lâmpada sem ativar o alarme;*/
void proximidade(){

 if (px != 0){
   // Faz a leitura três vezes para validação
   unsigned int d1,d2,d3;
   d1 = sonar.ping_cm(); 
   d2 = sonar.ping_cm(); 
   d3 = sonar.ping_cm();
  
   // Valida se há algo na distancia de 10cm do sensor; > 0 pois erros na leitura retornam 0.
   if( (d1 > 0 && d1 < DIST_PROX) && (d2 > 0 && d2 < DIST_PROX) && (d3 > 0 && d3 < DIST_PROX)){
     luminozidade();
     ativo = true;
     millisAnterior = millis();
   }
 } // ld != 0
} // proximidade()

/* Desliga o alarme e a Lâmpada caso o tempo de 10 segundos tenha expirado*/
void verificarTempo(){
  
  if (px == 1){  
    tocaAlarme();
  }

  unsigned long millisAtual = millis();

  // Verifica se o tempo se esgotou
  if (millisAtual - millisAnterior > LIMITE_TEMPO){
  //noNewTone(ZUMBADOR);
    if(ld == 1)
      digitalWrite(PORTA_LED, LOW);  
    ativo = false;
    Serial3.println("P200"); // Proximidade - OK
  }   
  
} // verificarTempo()

/* Valida e executa a requisição de acordo com os seguintes valores:
  'T' - Retorna o valor da temperatura pelo módulo bluetooth;
  'l' - Desativa a lâmpada;
  'A' - Configura a Lâmpada para o modo automático;
  'L' - Liga a lâmpada;
  'p' - Desativa o sensor de proximidade;
  'P' - Ativa o sensor de proximidade sem alarme;
  'W' - Ativa o sensor de proximidade com alarme; */
void executaRequisicao(){ 
  switch(comando){
    case ('T') : temperatura(); break; 
    case ('l') : ld = 0; luminozidade(); break; 
    case ('A') : ld = 1; digitalWrite(PORTA_LED, LOW); break; 
    case ('L') : ld = 2; luminozidade(); break; 
    case ('p') : px = 0; break; 
    case ('P') : px = 2; break; 
    case ('W') : px = 1; break; 
    default: break;
  }
}
 
void tocaAlarme(){
  for (int x=0; x<100; x++) {
  // convertendo de graus a radianos
    sinVal = (sin(x*(3.1412/180)));     
    toneVal = 2000+(int(sinVal*1000));
    NewTone(ZUMBADOR, toneVal);
    delay(3);
  }
  noNewTone();
}

