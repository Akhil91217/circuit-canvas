export interface ProjectTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  components: Array<{ type: string; x: number; y: number }>;
  connections: Array<{ from: string; fromPin: string; to: string; toPin: string }>;
  code: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'weather-station',
    name: 'Weather Station',
    icon: '🌤️',
    description: 'ESP32 + BME280 + OLED display with MQTT publishing',
    components: [
      { type: 'esp32', x: 200, y: 100 },
      { type: 'bme280', x: 450, y: 100 },
      { type: 'oled-display', x: 450, y: 250 },
    ],
    connections: [
      { from: 'esp32', fromPin: '3v3', to: 'bme280', toPin: 'vcc' },
      { from: 'esp32', fromPin: 'gnd1', to: 'bme280', toPin: 'gnd' },
      { from: 'esp32', fromPin: 'gpio21', to: 'bme280', toPin: 'sda' },
      { from: 'esp32', fromPin: 'gpio22', to: 'bme280', toPin: 'scl' },
      { from: 'esp32', fromPin: '3v3', to: 'oled-display', toPin: 'vcc' },
      { from: 'esp32', fromPin: 'gnd2', to: 'oled-display', toPin: 'gnd' },
      { from: 'esp32', fromPin: 'gpio21', to: 'oled-display', toPin: 'sda' },
      { from: 'esp32', fromPin: 'gpio22', to: 'oled-display', toPin: 'scl' },
    ],
    code: `#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_BME280 bme;

const char* ssid = "YourSSID";
const char* password = "YourPassword";
const char* mqttServer = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  
  if (!bme.begin(0x76)) {
    Serial.println("BME280 not found!");
  }
  
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.display();
  
  Serial.println("Weather Station Ready!");
}

void loop() {
  float temp = bme.readTemperature();
  float humidity = bme.readHumidity();
  float pressure = bme.readPressure() / 100.0;
  
  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("Temp: "); display.print(temp); display.println(" C");
  display.print("Hum:  "); display.print(humidity); display.println(" %");
  display.print("Pres: "); display.print(pressure); display.println(" hPa");
  display.display();
  
  Serial.print("T:"); Serial.print(temp);
  Serial.print(" H:"); Serial.print(humidity);
  Serial.print(" P:"); Serial.println(pressure);
  
  delay(2000);
}`,
  },
  {
    id: 'smart-home-sensor',
    name: 'Smart Home Sensor Node',
    icon: '🏠',
    description: 'Arduino + PIR + DHT22 + Buzzer with motion alarm',
    components: [
      { type: 'arduino-uno', x: 200, y: 100 },
      { type: 'pir-sensor', x: 450, y: 80 },
      { type: 'humidity-sensor', x: 450, y: 200 },
      { type: 'buzzer', x: 450, y: 320 },
      { type: 'led', x: 550, y: 200 },
    ],
    connections: [
      { from: 'arduino-uno', fromPin: '5v', to: 'pir-sensor', toPin: 'vcc' },
      { from: 'arduino-uno', fromPin: 'gnd1', to: 'pir-sensor', toPin: 'gnd' },
      { from: 'arduino-uno', fromPin: 'd2', to: 'pir-sensor', toPin: 'signal' },
      { from: 'arduino-uno', fromPin: '5v', to: 'humidity-sensor', toPin: 'vcc' },
      { from: 'arduino-uno', fromPin: 'gnd2', to: 'humidity-sensor', toPin: 'gnd' },
      { from: 'arduino-uno', fromPin: 'd4', to: 'humidity-sensor', toPin: 'data' },
      { from: 'arduino-uno', fromPin: 'd8', to: 'buzzer', toPin: 'positive' },
      { from: 'arduino-uno', fromPin: 'd13', to: 'led', toPin: 'anode' },
    ],
    code: `#include <DHT.h>

#define PIR_PIN 2
#define DHT_PIN 4
#define BUZZER_PIN 8
#define LED_PIN 13
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);
bool alarmArmed = true;

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  dht.begin();
  Serial.println("Smart Home Sensor Node Ready!");
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (motion == HIGH && alarmArmed) {
    Serial.println("⚠️ Motion detected!");
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 2000, 500);
  } else {
    digitalWrite(LED_PIN, LOW);
    noTone(BUZZER_PIN);
  }
  
  Serial.print("Temp: "); Serial.print(temp);
  Serial.print("°C  Humidity: "); Serial.print(humidity);
  Serial.println("%");
  
  delay(1000);
}`,
  },
  {
    id: 'robot-car',
    name: 'Robot Car Controller',
    icon: '🤖',
    description: 'Arduino + L298N motor driver + Ultrasonic obstacle avoidance',
    components: [
      { type: 'arduino-uno', x: 200, y: 100 },
      { type: 'motor-driver', x: 450, y: 100 },
      { type: 'ultrasonic-sensor', x: 450, y: 280 },
      { type: 'servo-motor', x: 200, y: 350 },
    ],
    connections: [
      { from: 'arduino-uno', fromPin: 'd5', to: 'motor-driver', toPin: 'ena' },
      { from: 'arduino-uno', fromPin: 'd6', to: 'motor-driver', toPin: 'in1' },
      { from: 'arduino-uno', fromPin: 'd7', to: 'motor-driver', toPin: 'in2' },
      { from: 'arduino-uno', fromPin: 'd9', to: 'motor-driver', toPin: 'in3' },
      { from: 'arduino-uno', fromPin: 'd10', to: 'motor-driver', toPin: 'in4' },
      { from: 'arduino-uno', fromPin: 'd11', to: 'motor-driver', toPin: 'enb' },
      { from: 'arduino-uno', fromPin: 'd3', to: 'ultrasonic-sensor', toPin: 'trig' },
      { from: 'arduino-uno', fromPin: 'd4', to: 'ultrasonic-sensor', toPin: 'echo' },
      { from: 'arduino-uno', fromPin: 'd12', to: 'servo-motor', toPin: 'signal' },
    ],
    code: `#include <Servo.h>

#define TRIG_PIN 3
#define ECHO_PIN 4
#define ENA 5
#define IN1 6
#define IN2 7
#define IN3 9
#define IN4 10
#define ENB 11
#define SERVO_PIN 12

Servo scanServo;
int motorSpeed = 200;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);
  scanServo.attach(SERVO_PIN);
  scanServo.write(90);
  Serial.println("Robot Car Ready!");
}

long getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  return pulseIn(ECHO_PIN, HIGH) * 0.034 / 2;
}

void moveForward() {
  analogWrite(ENA, motorSpeed);
  analogWrite(ENB, motorSpeed);
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void turnRight() {
  analogWrite(ENA, motorSpeed);
  analogWrite(ENB, motorSpeed);
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, HIGH);
}

void stopMotors() {
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}

void loop() {
  long distance = getDistance();
  Serial.print("Distance: "); Serial.print(distance); Serial.println(" cm");
  
  if (distance > 30) {
    moveForward();
  } else {
    stopMotors();
    delay(200);
    turnRight();
    delay(400);
  }
  
  delay(100);
}`,
  },
  {
    id: 'iot-dashboard',
    name: 'IoT Dashboard Device',
    icon: '📊',
    description: 'ESP32 + multiple sensors + OLED + MQTT telemetry',
    components: [
      { type: 'esp32', x: 200, y: 100 },
      { type: 'bme280', x: 450, y: 80 },
      { type: 'light-sensor', x: 450, y: 180 },
      { type: 'oled-display', x: 450, y: 300 },
    ],
    connections: [
      { from: 'esp32', fromPin: '3v3', to: 'bme280', toPin: 'vcc' },
      { from: 'esp32', fromPin: 'gnd1', to: 'bme280', toPin: 'gnd' },
      { from: 'esp32', fromPin: 'gpio21', to: 'bme280', toPin: 'sda' },
      { from: 'esp32', fromPin: 'gpio22', to: 'bme280', toPin: 'scl' },
      { from: 'esp32', fromPin: 'gnd2', to: 'light-sensor', toPin: 'pin2' },
      { from: 'esp32', fromPin: 'adc0', to: 'light-sensor', toPin: 'pin1' },
      { from: 'esp32', fromPin: '3v3', to: 'oled-display', toPin: 'vcc' },
      { from: 'esp32', fromPin: 'gnd1', to: 'oled-display', toPin: 'gnd' },
      { from: 'esp32', fromPin: 'gpio21', to: 'oled-display', toPin: 'sda' },
      { from: 'esp32', fromPin: 'gpio22', to: 'oled-display', toPin: 'scl' },
    ],
    code: `#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <PubSubClient.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
Adafruit_BME280 bme;

#define LDR_PIN 36

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  bme.begin(0x76);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  Serial.println("IoT Dashboard Ready!");
}

void loop() {
  float temp = bme.readTemperature();
  float hum = bme.readHumidity();
  float pres = bme.readPressure() / 100.0;
  int light = analogRead(LDR_PIN);
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("=== IoT Dashboard ===");
  display.print("Temp: "); display.print(temp, 1); display.println("C");
  display.print("Hum:  "); display.print(hum, 0); display.println("%");
  display.print("Pres: "); display.print(pres, 0); display.println("hPa");
  display.print("Light: "); display.println(light);
  display.display();
  
  delay(2000);
}`,
  },
  {
    id: 'security-alarm',
    name: 'Security Alarm System',
    icon: '🔒',
    description: 'Arduino + PIR + Keypad + Buzzer + LCD for code-based arming',
    components: [
      { type: 'arduino-uno', x: 200, y: 100 },
      { type: 'pir-sensor', x: 450, y: 80 },
      { type: 'keypad', x: 450, y: 200 },
      { type: 'buzzer', x: 200, y: 380 },
      { type: 'lcd-16x2', x: 450, y: 350 },
      { type: 'led', x: 550, y: 80 },
    ],
    connections: [
      { from: 'arduino-uno', fromPin: 'd2', to: 'pir-sensor', toPin: 'signal' },
      { from: 'arduino-uno', fromPin: '5v', to: 'pir-sensor', toPin: 'vcc' },
      { from: 'arduino-uno', fromPin: 'gnd1', to: 'pir-sensor', toPin: 'gnd' },
      { from: 'arduino-uno', fromPin: 'd8', to: 'buzzer', toPin: 'positive' },
      { from: 'arduino-uno', fromPin: 'd13', to: 'led', toPin: 'anode' },
    ],
    code: `#include <Keypad.h>
#include <LiquidCrystal.h>

#define PIR_PIN 2
#define BUZZER_PIN 8
#define LED_PIN 13

LiquidCrystal lcd(A0, A1, A2, A3, A4, A5);

String password = "1234";
String input = "";
bool armed = false;
bool alarm = false;

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  lcd.begin(16, 2);
  lcd.print("Security System");
  lcd.setCursor(0, 1);
  lcd.print("Enter code...");
  Serial.println("Security Alarm System Ready!");
}

void loop() {
  if (armed) {
    int motion = digitalRead(PIR_PIN);
    if (motion == HIGH) {
      alarm = true;
      Serial.println("🚨 INTRUDER ALERT!");
      lcd.clear();
      lcd.print("!! ALARM !!");
      digitalWrite(LED_PIN, HIGH);
      tone(BUZZER_PIN, 3000);
    }
  }
  
  if (!alarm) {
    lcd.setCursor(0, 1);
    lcd.print(armed ? "ARMED    " : "DISARMED ");
    digitalWrite(LED_PIN, armed ? HIGH : LOW);
  }
  
  delay(200);
}`,
  },
];
