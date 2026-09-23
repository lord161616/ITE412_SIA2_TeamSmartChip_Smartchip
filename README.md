# SMARTCHIP: IoT-Based Mushroom Drying System

**Course:** ITE412 – System Integration and Architecture 2
**Team Name:** Team SmartChip 1
**Repository:** https://github.com/lord161616/ITE412_SIA2_TeamSmartChip_Smartchip

## Team Members & Roles

* **LordGlenn D. Adame** — Project Lead
* **Irene C. Jalotjot** — Documentation
* **Jeremy B. Abarra** — Diagram Designer
* **Nica Pauline Gan** — Presenter

## Project Summary

SmartChip is an IoT-based mushroom drying system designed to improve the monitoring and management of the mushroom drying process. The system integrates an ESP32-based hardware controller with a web-based application using React, Firebase Authentication, and Cloud Firestore. The system provides functions for drying-run management, sensor monitoring, scheduling, inventory management, notifications, analytics, and product reservation. The project demonstrates the integration of hardware, cloud services, and a web application into a centralized system.

## Repository Structure

```text
/docs
    Project documentation

/src
    SmartChip web application source code

/tests
    Test cases and testing documentation

/integration
    Integration scripts, configurations, and related files
```

## Technologies

* React
* Vite
* JavaScript
* Firebase Authentication
* Cloud Firestore
* ESP32
* Arduino IDE
* React Router
* Tailwind CSS
* Chart.js
* GitHub
* Vercel

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/lord161616/ITE412_SIA2_TeamSmartChip_Smartchip.git
```

### 2. Enter the project directory

```bash
cd ITE412_SIA2_TeamSmartChip_Smartchip
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Follow the Vite development-server address shown in the terminal.

## Collaboration Workflow

Team members should follow the Git workflow below:

1. Create a feature or documentation branch.
2. Make the required changes.
3. Stage the changes.
4. Commit the changes.
5. Push the branch to GitHub.
6. Open a Pull Request.
7. Request review from a teammate.
8. Resolve any conflicts if necessary.
9. Merge the Pull Request into `main`.

### Branch Naming

```text
feature/<short-description>
docs/<short-description>
fix/<short-description>
```

### Commit Message Examples

```text
feat: add new integration feature
docs: update project overview
test: add test documentation
fix: correct integration configuration
chore: update project structure
```

## Communication

**Primary communication channel:** MS Teams

The team uses MS Teams for project coordination, discussions, task assignments, and sharing project updates.

## Project Purpose

This repository is the team's working repository for **Performance Task 3 – Project Kickoff & Environment Setup** and will be used as a collaborative workspace for the system integration project throughout the course.




# React + Vite


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
