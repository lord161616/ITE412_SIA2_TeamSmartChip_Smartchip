# SmartChip Integration Architecture

## System Integration Flow

The SmartChip system integrates the web application, Firebase Cloud Firestore, and the ESP32-based drying controller.

```text
+----------------------+
|   SmartChip Web App  |
| React + Vite         |
+----------+-----------+
           |
           | Read / Write Data
           v
+----------------------+
| Firebase Cloud       |
| Firestore            |
+----------+-----------+
           |
           | Device Commands
           | Status Updates
           v
+----------------------+
| ESP32 Controller     |
| SmartChip Dehydrator |
+----------+-----------+
           |
           | Controls
           v
+----------------------+
| Sensors / Heater /   |
| Fan / LCD            |
+----------------------+

Users
  |
  v
SmartChip Web App
  |
  v
Firebase Authentication


Integration Components
Web Application

The React-based web application provides the interface for authorized users to monitor and manage the SmartChip drying system.

Firebase Cloud Firestore

Cloud Firestore serves as the central cloud data layer for application data, drying-run information, inventory, and device coordination.

ESP32 Controller

The ESP32 communicates with the cloud system and controls the physical drying equipment based on authorized system commands.

Physical Hardware


The ESP32 interacts with temperature and humidity sensors, the heater, fan, LCD display, and physical control buttons.

Data Flow
A user interacts with the SmartChip web application.
The web application authenticates the user through Firebase Authentication.
Application data and device commands are coordinated through Cloud Firestore.
The ESP32 receives authorized device commands from the cloud system.
The ESP32 controls the physical drying hardware.
Device status and sensor information are reported back to the cloud system.
The web application displays the updated system information to authorized users.

## Diagram Designer Contribution update 2 different github acc

This document was prepared and maintained by Jeremy B. Abarra as part of the SmartChip project integration documentation. It describes how the web application, Firebase Cloud Firestore, and ESP32 device communicate as integrated components.
