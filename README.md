# Enterprise Resource Planning (ERP) Solution

A comprehensive ERP solution built with MERN stack (MongoDB, Express.js, React, Node.js) and TypeScript, featuring microservices architecture and role-based access control.

## Features

- **Sales Management**
  - Track sales transactions
  - Generate sales reports (daily, weekly, monthly)
  - Sales history and analytics

- **Inventory Management**
  - Stock level tracking
  - Low-stock alerts
  - Inventory history
  - Product management

- **Customer Management**
  - Customer profiles
  - Purchase history
  - Loyalty points system
  - Customer analytics

- **Point of Sale (POS)**
  - Simple and intuitive interface
  - Quick checkout process
  - Receipt generation
  - Real-time inventory updates

- **Analytics and Reporting**
  - Sales analytics with visualizations
  - Inventory reports
  - Customer insights
  - Performance metrics

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Redux Toolkit for state management
  - Material-UI for components
  - Chart.js for visualizations
  - Axios for API communication

- **Backend**
  - Node.js with Express.js
  - TypeScript
  - MongoDB with Mongoose
  - JWT for authentication
  - Microservices architecture

## Microservices

1. **Authentication Service** (Port 4000)
   - User management
   - Role-based access control
   - JWT token handling

2. **Sales Service** (Port 4001)
   - Sales transactions
   - Sales reporting
   - POS operations

3. **Inventory Service** (Port 4002)
   - Stock management
   - Product catalog
   - Low-stock alerts

4. **Customer Service** (Port 4003)
   - Customer data management
   - Loyalty program
   - Purchase history

5. **Analytics Service** (Port 4004)
   - Report generation
   - Data visualization
   - Business insights

## Role-Based Access

1. **Super Admin**
   - Full system access
   - Company/shop registration
   - Permission management
   - User management

2. **Admin**
   - Full access to all modules
   - User management
   - System configuration

3. **Manager**
   - Access to sales, inventory, and customer modules
   - Report viewing
   - Staff management

4. **Cashier**
   - POS access
   - Basic sales transactions
   - Customer lookup

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- TypeScript

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/erp-solution.git
   cd erp-solution
   ```

2. Install dependencies for all services:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend service dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   Create `.env` files in both frontend and backend directories following the `.env.example` templates.

4. Start the services:
   ```bash
   # Start backend services
   cd backend
   npm run dev

   # Start frontend
   cd frontend
   npm start
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend services: http://localhost:4000-4004

## API Documentation

Detailed API documentation is available in the [Postman Collection](./postman/ERP-Solution.postman_collection.json).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 