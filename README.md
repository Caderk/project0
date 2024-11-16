# Personal Web Application to Showcase Personal Projects

This project is a full-stack web application designed to showcase personal projects and demonstrate proficiency in modern web development technologies. It features a responsive frontend built with Next.js and TypeScript, it interacts with a backend API built using Express.js, and is fully containerized using Docker and Docker Compose for both development and production environments.

## Overview

Frontend Service: A Next.js application that provides a user-friendly interface for managing inventory items. It utilizes React hooks, TypeScript interfaces, and CSS Modules for styling. The frontend communicates with the backend service through RESTful APIs and implements real-time updates using Server-Sent Events (SSE).

Inventory Service: An Express.js API that handles CRUD operations for inventory items. It includes server-side validation with Joi, unique ID generation with UUID, and real-time data broadcasting to connected clients via SSE.

Nginx Reverse Proxy: Configured as a reverse proxy to route traffic between the frontend and backend services. In the production environment, Nginx handles SSL/TLS encryption using Let's Encrypt certificates and redirects HTTP traffic to HTTPS for secure communication.

## Features

Real-Time Updates: Implements SSE to provide live updates to the frontend when inventory data changes, eliminating the need for polling.

Responsive Design: Uses CSS Grid and media queries to ensure the application is accessible and looks great on all devices.

API Documentation: Provides comprehensive API documentation in JSON format, detailing all available endpoints, methods, and data models.

Error Handling and Validation: Incorporates robust error handling on both the client and server sides, with clear user feedback and data validation to maintain data integrity.

Dockerized Deployment: Utilizes Docker and Docker Compose to streamline the setup and deployment process, ensuring consistency across different environments.

## Technologies Used

### Frontend Service:
Next.js
React
TypeScript
CSS Modules
ESLint

### Inventory Service:
Node.js
Express.js
Joi for validation
UUID for unique identifiers
SSE for real-time communication

### DevOps:
Docker & Docker Compose
Nginx
Let's Encrypt for SSL certificates
Morgan for HTTP request logging
Nodemon for development automation