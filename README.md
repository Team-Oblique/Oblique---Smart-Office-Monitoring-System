# 🏢 Oblique – Smart Office Monitoring System

> A real-time Smart Office Monitoring System that enables monitoring, control, and automation of office devices through a modern dashboard, REST API, WebSocket communication, and Discord integration.

---

## 📌 Overview

Oblique is an IoT-powered Smart Office Monitoring System designed to monitor electrical devices, simulate real-time power consumption, detect abnormal usage, and remotely control office appliances.

The system combines:

- 🚀 FastAPI backend
- 🌐 React dashboard
- 🔄 Real-time WebSocket updates
- 🤖 Discord Bot for remote control
- 📊 Live energy monitoring & alerts

The project was developed to demonstrate how IoT, Web APIs, and modern frontend technologies can work together to create a centralized smart office management platform.

---

# ✨ Features

### 🏠 Smart Device Management

- Monitor all office devices
- View device status
- Group devices by room
- Manual ON/OFF control
- Live state synchronization

---

### ⚡ Energy Monitoring

- Simulated live power consumption
- Room-wise monitoring
- Total office power usage
- Device-level energy tracking

---

### 🚨 Smart Alerts

Automatically detects:

- High power consumption
- Abnormal energy spikes
- Device overloads
- Active alerts dashboard

---

### 📡 Real-Time Communication

- WebSocket updates
- Instant device status changes
- Live dashboard refresh
- Broadcast events to connected clients

---

### 🤖 Discord Bot

Control the office without opening the dashboard.

Supported commands include:

- Device status
- Room status
- Toggle devices
- Usage information

---

### 🌐 REST API

Backend exposes REST endpoints for:

- Devices
- Usage
- Alerts
- Device control
- Health check

---

# 🛠 Tech Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons

---

## Backend

- FastAPI
- Uvicorn
- Pydantic
- WebSockets

---

## IoT Hardware

- Relay Modules
- Push Buttons
- Current Sensors (simulated)
- LEDs
- Wokwi Simulation

---

## Communication

- REST API
- WebSocket
- Discord API

---

# 🏗 System Architecture

```text
                           ┌────────────────────────┐
                           │      React Dashboard   │
                           │                        │
                           │  Device Control        │
                           │  Live Charts           │
                           │  Alerts               │
                           └──────────┬─────────────┘
                                      │
                          REST API + WebSocket
                                      │
                                      ▼
                  ┌──────────────────────────────────┐
                  │         FastAPI Backend          │
                  │                                  │
                  │ • REST API                       │
                  │ • WebSocket Manager              │
                  │ • Device Store                   │
                  │ • Alert Engine                   │
                  │ • Power Simulator                │
                  └───────┬───────────────┬──────────┘
                          │               │
                          │               │
                 REST API │               │ Internal Events
                          │               │
                          ▼               ▼
              ┌────────────────┐   ┌──────────────────┐
              │ Discord Bot    │   │ Alert Engine     │
              │                │   │                  │
              │ Device Control │   │ Detects Issues   │
              └────────────────┘   └──────────────────┘
                          │
                          │
                          ▼
                 Smart Office Devices

```

---

# 📂 Project Structure

```
Oblique/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── alerts/
│   │   ├── models/
│   │   ├── services/
│   │   ├── simulator/
│   │   ├── websocket/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── discord-bot/
│   ├── commands/
│   ├── listeners/
│   ├── bot.py
│   └── api_client.py
│
├── circuit/
│   ├── sketch.ino
│   └── diagram.json
│
└── docs/
```

---

# 🔄 Workflow

```text
ESP32 Sensors
      │
      ▼
Power Readings
      │
      ▼
FastAPI Backend
      │
 ┌────┴────────────┐
 │                 │
 ▼                 ▼
REST API      WebSocket
 │                 │
 ▼                 ▼
Dashboard     Live Updates
 │
 ▼
Discord Bot Commands
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/Oblique.git

cd Oblique
```

---

## 2. Backend

```bash
cd backend

pip install -r requirements.txt

python main.py
```

Backend runs on:

```
http://localhost:8000
```

---

## 3. Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 4. Discord Bot

Create a `.env` file from `.env.example`.

Then:

```bash
cd discord-bot

pip install -r requirements.txt

python bot.py
```

---

## 5. ESP32 Simulation

Open

```
circuit/
```

inside **Wokwi**.

Run the simulation to observe relay control and current sensor readings.

---

# 📡 API Endpoints

## Devices

| Method | Endpoint |
|----------|------------------|
| GET | `/devices` |
| GET | `/devices/{id}` |
| PATCH | `/devices/{id}` |

---

## Usage

| Method | Endpoint |
|----------|-----------|
| GET | `/usage` |

---

## Alerts

| Method | Endpoint |
|----------|------------|
| GET | `/alerts` |

---

## Health

| Method | Endpoint |
|----------|------------|
| GET | `/health` |

---

## WebSocket

```
ws://localhost:8000/ws
```

Provides:

- Live device updates
- Status changes
- Power usage
- Alert notifications

---

# 🤖 Discord Commands

Example commands:

```text
!status

!room 

!toggle 

!usage
```

---



# 🎯 Project Goals

- Centralized office monitoring
- Reduce unnecessary energy consumption
- Enable remote device management
- Provide real-time operational awareness
- Demonstrate scalable IoT architecture

---

# 👥 Team

**Oblique**

Smart Office Monitoring System

Built using modern IoT, FastAPI, React, WebSockets, and Discord integration.

---

# 📄 License

This project is intended for educational and hackathon purposes.
