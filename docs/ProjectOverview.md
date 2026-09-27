# Project Overview

## 1. System Objectives

The SmartChip project aims to develop an integrated IoT-based mushroom drying system that improves the monitoring, management, and control of the mushroom drying process.

The system addresses the difficulty of manually monitoring drying conditions and managing drying operations. It integrates an ESP32-based hardware controller with a web application and cloud services to provide centralized monitoring and management.

The system is intended to benefit farm owners, operators, and other authorized users by providing access to drying status, sensor information, scheduling, inventory information, and other system functions through a web-based interface.

## 2. Proposed Scope

The project integrates the following major components:

### Web Application

The React-based web application provides the user interface for managing and monitoring the SmartChip system.

Planned modules include:

* Dashboard
* Notifications
* Scheduler
* Sensor Monitoring
* Inventory Management
* Drying Run Management
* History
* Analytics
* User Management
* Shop/Reservation

### IoT Hardware

The ESP32 serves as the hardware controller for the drying system. It communicates with the cloud system and controls the physical drying process based on authorized commands.

The hardware integration includes:

* ESP32 controller
* Temperature and humidity sensors
* Heater control
* Fan control
* LCD display
* Physical control buttons

### Cloud Integration

Firebase services are used to connect the web application and IoT device.

The project uses:

* Firebase Authentication for user authentication
* Cloud Firestore for application and device data
* Firestore-based communication between the web application and ESP32

### In-Scope Features

For the initial integration project, the team will focus on:

* User authentication and access control
* Web application and cloud integration
* ESP32 and cloud communication
* Drying-run management
* Sensor monitoring
* Scheduling
* Inventory management
* System notifications
* Testing of integrated components

### Out-of-Scope Features

The following items may be outside the initial scope of the integration activities:

* Large-scale commercial deployment
* Advanced predictive drying algorithms
* Industrial automation beyond the current prototype
* Integration with external payment gateways
* Large-scale multi-farm deployment

## 3. Stakeholders

### Farm Owner / Administrator

The farm owner or administrator is responsible for overseeing the drying operation and managing the system. The stakeholder needs reliable information about drying runs, inventory, users, and system status.

### System Operator

The system operator uses the SmartChip application to monitor and manage drying operations. The operator needs accurate sensor information, drying status, and controls for authorized operations.

### Customer

Customers are users who may view available dried mushroom products and interact with the product reservation functionality.

### Project Team

The project team is responsible for designing, developing, integrating, testing, documenting, and presenting the SmartChip system.

## 4. Tools & Technologies

### Programming Languages and Frameworks

* JavaScript
* React
* Vite

### Cloud Services

* Firebase Authentication
* Cloud Firestore

### Hardware

* ESP32
* Temperature and humidity sensors
* LCD display
* Heater
* Fan
* Solid State Relay (SSR)

### Development Tools

* Visual Studio Code
* Arduino IDE
* Git
* GitHub

### Front-End Libraries

* React Router
* Tailwind CSS
* Chart.js

### Integration Approach

The project uses cloud-based integration through Firebase Cloud Firestore. The web application communicates with Firestore to manage system data and authorized device commands. The ESP32 connects to the cloud system to receive authorized commands, report device status, and coordinate the physical drying process.

### Testing

Testing will include functional testing of the web application, integration testing between the web application and Firebase, and testing of communication between the ESP32 and the cloud system.

## 5. Project Repository Structure


/docs
    Project documentation

/src
    Web application source code

/tests
    Test cases and testing documentation

/integration
    Integration scripts and configurations

## Documentation Responsibility

The documentation component records the project's objectives, scope, stakeholders, technologies, integration approach, and other important project information. Proper documentation helps the team maintain a clear understanding of the system throughout development.

## Messaging Workflow

SmartChip implements a producer-consumer messaging pattern to demonstrate asynchronous communication between the Drying Scheduler and the drying processing module. The Scheduler acts as the producer by creating a drying request containing the batch ID, target temperature, and drying duration. Instead of processing the request immediately, the request is placed into a message queue.

The Consumer retrieves each drying request asynchronously and validates the requested drying parameters. Requests within the configured operating temperature range of 30°C to 75°C are approved, while requests outside the normal range are rejected.

This messaging workflow demonstrates how separate SmartChip modules can communicate without requiring the producer and consumer to process a request at the same time. The current prototype uses a Node.js in-memory queue for demonstration purposes. The concept can later be extended to a dedicated messaging middleware platform such as RabbitMQ or integrated with the existing Firestore and ESP32 command architecture.

## High-Level System Overview

### Major Modules/Subsystems

The SmartChip system is composed of several major modules that work together to provide IoT-based mushroom drying, monitoring, inventory management, and product reservation.

1. **User Authentication and Access Control**  
   This module manages user registration, login, authentication, user roles, account types, and access permissions. SmartChip supports different roles such as Customer, Viewer, Operator, and Administrator.

2. **Drying Schedule and Run Management**  
   This module allows authorized staff or operators to schedule and manage mushroom drying operations. It manages the selected batch, target temperature, drying duration, drying run status, and START/STOP operations.

3. **Device and Sensor Monitoring**  
   This module connects the web application with the ESP32 SmartChip device. The ESP32 receives commands from the system and sends machine status, temperature, humidity, heartbeat, and other device information to the system.

4. **Inventory Management**  
   This module manages mushroom batches throughout the drying process. Inventory can progress through statuses such as Fresh, Scheduled, Drying, Dried, and Archived. The module also makes available dried stock visible to the Shop module.

5. **Shop and Reservation Management**  
   This module allows customers to view available dried mushroom products and submit reservations. Reservations are based on the availability of dried mushroom inventory.

### External Systems/Interfaces

SmartChip uses several external technologies and services to support its operation. **Firebase Authentication** is used to authenticate users and manage secure access to the application. **Cloud Firestore** is used as the main database for storing user information, inventory records, drying runs, device states, commands, and reservation records. The **ESP32 SmartChip Device** serves as the hardware interface between the software system and the physical drying machine. The ESP32 communicates with the system through Firestore and provides sensor and machine status information.

### Data Flow Summary

Data flows through SmartChip between users, the web application, Cloud Firestore, and the ESP32 device. Customers and staff interact with the React-based SmartChip application. User authentication requests are processed through Firebase Authentication, while application data is stored in Cloud Firestore. Staff can create drying schedules and manage drying runs, which update the appropriate inventory and device records. When a drying operation is started, the system sends a START command to the ESP32 through the device command mechanism. The ESP32 processes the command and sends machine status, temperature, humidity, and heartbeat information back to the system. The web application uses this information to display the current condition of the drying machine. After a drying operation is completed, the corresponding inventory batch can be recorded as dried stock and made available for customer reservation.