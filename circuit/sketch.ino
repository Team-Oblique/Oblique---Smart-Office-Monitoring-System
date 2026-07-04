// Wokwi simulation sketch — 5 independently switched LEDs (led1..led5)
// Pin numbers below are matched to the ACTUAL wiring in diagram.json,
// not just picked in order. Each button drives one relay IN pin, and
// each relay's NO contact drives exactly one LED — no shared pins,
// so pressing one button can only ever affect that one LED.
//
// Physical button -> LED mapping (per diagram.json):
//   btn3 (GPIO26) -> relay1 -> led1   (already worked before this fix)
//   btn1 (GPIO22) -> relay3 -> led2
//   btn2 (GPIO25) -> relay2 -> led3
//   btn5 (GPIO27) -> relay5 -> led4
//   btn4 (GPIO12) -> relay6 -> led5   (relay6 IN moved from GPIO19 to GPIO21
//                                      in diagram.json so it no longer shares
//                                      a pin with relay5)

// ---- Relay control (turns each LED on/off) ----
const int RELAY_LED1 = 18; // relay1
const int RELAY_LED2 = 16; // relay3
const int RELAY_LED3 = 17; // relay2
const int RELAY_LED4 = 19; // relay5
const int RELAY_LED5 = 21; // relay6 (rewired from 19 -> 21)

// ---- Manual pushbuttons, one per LED, matched to real wiring ----
const int BTN_LED1 = 26; // btn3
const int BTN_LED2 = 22; // btn1
const int BTN_LED3 = 25; // btn2
const int BTN_LED4 = 27; // btn5
const int BTN_LED5 = 12; // btn4

// ---- Current sensing, one potentiometer per LED (all on ADC1 pins) ----
const int CT_LED1_ADC = 34; // pot2
const int CT_LED2_ADC = 32; // pot1
const int CT_LED3_ADC = 33; // pot5
const int CT_LED4_ADC = 35; // pot3
const int CT_LED5_ADC = 36; // pot4 (VP)

const float CT_CALIBRATION = 0.045;
const int ADC_MIDPOINT = 2048;

unsigned long lastPrint = 0;
const unsigned long PRINT_INTERVAL_MS = 1000;

// Relay state + last button reading, tracked per LED so each toggles independently
bool led1State = true, led2State = true, led3State = true, led4State = true, led5State = true;
bool lastBtn1 = HIGH, lastBtn2 = HIGH, lastBtn3 = HIGH, lastBtn4 = HIGH, lastBtn5 = HIGH;

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_LED1, OUTPUT);
  pinMode(RELAY_LED2, OUTPUT);
  pinMode(RELAY_LED3, OUTPUT);
  pinMode(RELAY_LED4, OUTPUT);
  pinMode(RELAY_LED5, OUTPUT);

  pinMode(BTN_LED1, INPUT_PULLUP);
  pinMode(BTN_LED2, INPUT_PULLUP);
  pinMode(BTN_LED3, INPUT_PULLUP);
  pinMode(BTN_LED4, INPUT_PULLUP);
  pinMode(BTN_LED5, INPUT_PULLUP);

  digitalWrite(RELAY_LED1, HIGH);
  digitalWrite(RELAY_LED2, HIGH);
  digitalWrite(RELAY_LED3, HIGH);
  digitalWrite(RELAY_LED4, HIGH);
  digitalWrite(RELAY_LED5, HIGH);
}

float readCurrentRMS(int pin, int samples = 200) {
  long sumSq = 0;
  for (int i = 0; i < samples; i++) {
    int raw = analogRead(pin);
    int centered = raw - ADC_MIDPOINT;
    sumSq += (long)centered * centered;
    delayMicroseconds(100);
  }
  float meanSq = (float)sumSq / samples;
  return sqrt(meanSq) * CT_CALIBRATION;
}

// Each button is checked and handled completely separately -- no shared
// variables, no loop, no array -- so one press can only ever toggle
// the one relay pin tied to it.
void checkButton(int btnPin, bool &lastReading, int relayPin, bool &state, const char* name) {
  bool reading = digitalRead(btnPin);
  if (lastReading == HIGH && reading == LOW) {
    state = !state;
    digitalWrite(relayPin, state ? HIGH : LOW);
    Serial.print("-- Button: "); Serial.print(name);
    Serial.println(state ? " ON --" : " OFF --");
    delay(200); // debounce
  }
  lastReading = reading;
}

void loop() {
  checkButton(BTN_LED1, lastBtn1, RELAY_LED1, led1State, "led1");
  checkButton(BTN_LED2, lastBtn2, RELAY_LED2, led2State, "led2");
  checkButton(BTN_LED3, lastBtn3, RELAY_LED3, led3State, "led3");
  checkButton(BTN_LED4, lastBtn4, RELAY_LED4, led4State, "led4");
  checkButton(BTN_LED5, lastBtn5, RELAY_LED5, led5State, "led5");

  // "On" status comes straight from the tracked relay state rather than a
  // separate sense pin, since there's no sense wiring in the diagram to
  // read back from.
  float led1Current = led1State ? readCurrentRMS(CT_LED1_ADC) : 0.0;
  float led2Current = led2State ? readCurrentRMS(CT_LED2_ADC) : 0.0;
  float led3Current = led3State ? readCurrentRMS(CT_LED3_ADC) : 0.0;
  float led4Current = led4State ? readCurrentRMS(CT_LED4_ADC) : 0.0;
  float led5Current = led5State ? readCurrentRMS(CT_LED5_ADC) : 0.0;

  if (millis() - lastPrint > PRINT_INTERVAL_MS) {
    Serial.print("{");
    Serial.print("\"led1_on\":"); Serial.print(led1State ? "true" : "false"); Serial.print(",");
    Serial.print("\"led1_current_a\":"); Serial.print(led1Current, 2); Serial.print(",");
    Serial.print("\"led2_on\":"); Serial.print(led2State ? "true" : "false"); Serial.print(",");
    Serial.print("\"led2_current_a\":"); Serial.print(led2Current, 2); Serial.print(",");
    Serial.print("\"led3_on\":"); Serial.print(led3State ? "true" : "false"); Serial.print(",");
    Serial.print("\"led3_current_a\":"); Serial.print(led3Current, 2); Serial.print(",");
    Serial.print("\"led4_on\":"); Serial.print(led4State ? "true" : "false"); Serial.print(",");
    Serial.print("\"led4_current_a\":"); Serial.print(led4Current, 2); Serial.print(",");
    Serial.print("\"led5_on\":"); Serial.print(led5State ? "true" : "false"); Serial.print(",");
    Serial.print("\"led5_current_a\":"); Serial.print(led5Current, 2);
    Serial.println("}");
    lastPrint = millis();
  }

  delay(50);
}
