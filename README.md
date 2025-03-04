# Special Subject Application FE

A frontend application for solving Stable Matching and Game Theory problems using MOEA Framework. This application connects to the [GA-Application-Java](https://github.com/FitHanuSpecialSubject/GA-Application-Java) backend.

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version >= 16.x.x recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

Verify installation by running:

```bash
node -v
npm -v
```

## Installation

Clone this repository and navigate to the project directory:

```bash
git clone https://github.com/FitHanuSpecialSubject/GA-Webapp.git
cd GA-Webapp
```

Install dependencies:

```bash
npm install
```

## Running the Project

Start the development server:

```bash
npm run dev
# or
npm start
```

Open your browser and navigate to the displayed local URL (typically [http://localhost:5173](http://localhost:5173)).

## Building for Production

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed.

## Available Scripts

In the project directory, you can run:

- `npm start` or `npm run dev`: Starts the development server using Vite
- `npm run build`: Builds the app for production to the `dist` folder
- `npm run lint`: Runs ESLint to check code quality
- `npm run lint-fix`: Runs Prettier to format code
- `npm run stop`: Shuts down development server (useful for Maven integration)

## Project Overview

This application provides a user interface for:

1. Data generation for Stable Matching and Game Theory problems
2. Viewing and manipulating problem characteristics
3. Importing and exporting Excel data
4. Visualizing results using charts and graphs

## Backend Connection

This frontend connects to a Java-based backend implementing MOEA Framework for solving optimization problems. The backend repository is available at:
[https://github.com/FitHanuSpecialSubject/GA-Application-Java](https://github.com/FitHanuSpecialSubject/GA-Application-Java)

## Technologies

- React 18
- Vite (build tool)
- Bootstrap 5
- ExcelJS for spreadsheet manipulation
- Chart.js for data visualization
- React Router for navigation
- WebSockets for real-time communication