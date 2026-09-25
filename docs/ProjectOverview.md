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


## Documentation Contribution Update 2 from different account 

This section was prepared by Irene C. Jalotjot as part of the SmartChip project documentation. The documentation provides an overview of the system objectives, proposed scope, stakeholders, technologies, and integration components of the project.
