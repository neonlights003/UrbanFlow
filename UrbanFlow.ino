#include <MFRC522.h>
#include <MFRC522Extended.h>
#include <deprecated.h>
#include <require_cpp11.h>

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>
#include <SPI.h>
#include <MFRC522.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo gateServo;

// RFID Pins
#define SS_PIN 10
#define RST_PIN 9

MFRC522 rfid(SS_PIN, RST_PIN);

// Sensors
const int IR1 = 2;     // Entry Sensor
const int IR2 = 3;     // Exit Sensor

const int SERVO_PIN = 5;
const int BUZZER = 6;

int totalSlots = 4;
int availableSlots = 4;
int carCount=0;
bool car1 = false;
bool car2=false;
bool car3=false;
bool car= false;
bool entryTriggered = false;
bool exitTriggered = false;

void setup()
{
  Serial.begin(9600);

  pinMode(IR1, INPUT);
  pinMode(IR2, INPUT);
  pinMode(BUZZER, OUTPUT);

  gateServo.attach(SERVO_PIN);
  gateServo.write(0);

  lcd.init();
  lcd.backlight();

  SPI.begin();
  rfid.PCD_Init();

  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("UrbanFlow");
  lcd.setCursor(0,1);
  lcd.print("System Ready");

  delay(2000);
  lcd.clear();
}

void loop()
{
  displayStatus();

  // ENTRY
  if(digitalRead(IR1) == HIGH && !entryTriggered)
  {
    entryTriggered = true;

    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("Scan RFID");

    while(!checkRFID())
    {
    }

    if(availableSlots > 0)
    {
     availableSlots--;
     Serial.print("Slots Left: ");
Serial.println(availableSlots);
carCount++;

Serial.print("Car ");
Serial.print(carCount);
Serial.println(" Occupied");

Serial.print("Available Slots: ");
Serial.println(availableSlots);

if(availableSlots == 0)
{
   Serial.println("PARKING FULL");
}

      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("Vehicle Entry");
      lcd.setCursor(0,1);
      lcd.print("Gate Opening");

      tone(BUZZER, 2000);
      delay(300);
      noTone(BUZZER);

      gateServo.write(180);
      delay(3000);

      gateServo.write(0);

      delay(1000);
    }
    else
    {
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("Parking Full");
      lcd.setCursor(0,1);
      lcd.print("No Slots");

      tone(BUZZER,1000);
      delay(1000);
      noTone(BUZZER);

      delay(1500);
    }
  }

  if(digitalRead(IR1) == LOW)
  {
    entryTriggered = false;
  }

  // EXIT
  if(digitalRead(IR2) == HIGH && !exitTriggered)
  {
    exitTriggered = true;

    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("Scan RFID");

    while(!checkRFID())
    {
    }

    if(availableSlots < totalSlots)
    {
      availableSlots++;

      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("Vehicle Exit");
      lcd.setCursor(0,1);
      lcd.print("Thank You");

      tone(BUZZER,2000);
      delay(300);
      noTone(BUZZER);

      gateServo.write(90);
      delay(3000);

      gateServo.write(0);

      delay(1000);
    }
  }

  if(digitalRead(IR2) == LOW)
  {
    exitTriggered = false;
  }
}

void displayStatus()
{
  lcd.setCursor(0,0);
  lcd.print("Slots Left:");
  lcd.print(availableSlots);
  lcd.print(" ");

  lcd.setCursor(0,1);
  lcd.print("UrbanFlow Ready");
}

bool checkRFID()
{
  if (!rfid.PICC_IsNewCardPresent())
    return false;

  if (!rfid.PICC_ReadCardSerial())
    return false;

  Serial.print("Card UID: ");

  for (byte i = 0; i < rfid.uid.size; i++)
  {
    Serial.print(rfid.uid.uidByte[i], HEX);
    Serial.print(" ");
  }

  Serial.println();

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  return true;
}
