# RentFlow - Property Management Platform

**A modern, full-stack property management system designed to replace spreadsheet-based rental business operations.**

RentFlow is a comprehensive B2B web application that digitizes and centralizes property management workflows. Built for rental businesses still relying on Excel and CSV files, RentFlow provides a secure, scalable alternative that maintains complete data ownership while delivering powerful analytics and streamlined operations.

## Why RentFlow?

Many property management companies and individual landlords still manage their entire operation through spreadsheets. This approach leads to:
- **Data fragmentation** across multiple files and versions
- **Manual errors** from duplicate entries and formula mistakes
- **No audit trail** for critical business changes
- **Limited scalability** as the portfolio grows
- **Security risks** with files stored on local machines

RentFlow solves these problems by providing a centralized, secure platform that grows with your business.

## Key Features

### For Business Operations
✅ **Tenant Management** - Track tenant information, lease agreements, and communication history in one place
✅ **Property Portfolio** - Manage multiple properties with detailed records, documents, and status tracking
✅ **Document Storage** - Securely store and organize lease agreements, invoices, and property photos
✅ **Financial Tracking** - Monitor payments, expenses, and profitability with built-in reporting
✅ **Analytics Dashboard** - Visualize key metrics like occupancy rates, revenue trends, and maintenance costs

### For Technical Excellence
✅ **Full-Stack Modern Architecture** - Next.js frontend with NestJS backend
✅ **Type-Safe Development** - TypeScript throughout the entire codebase
✅ **Relational Database** - PostgreSQL with Prisma ORM for data integrity
✅ **Cloud-Ready Storage** - S3-compatible object storage (MinIO for local development)
✅ **Containerized Deployment** - Docker Compose for consistent environments

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (React), TypeScript |
| **UI/UX** | Tailwind CSS, Shadcn/UI, Radix Primitives |
| **Backend** | NestJS 11, Node.js |
| **Database** | PostgreSQL 16 |
| **Storage** | MinIO (S3-compatible) |
| **Infrastructure** | Docker Compose |

## Project Structure

```
RentFlow/
├── frontend/      # Next.js application with React components
├── backend/       # NestJS API with business logic
├── docker-compose.yml  # Container orchestration
└── README.md      # This file
```

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for database and storage)
- [Node.js v18+](https://nodejs.org/) (for frontend and backend)

### Quick Setup

1. **Start the infrastructure** (PostgreSQL + MinIO):
   ```bash
   docker-compose up -d
   ```

2. **Set up the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Set up the backend:**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

4. **Initialize MinIO storage:**
   - Visit http://localhost:9001
   - Login: `minio_admin` / `minio_password123`
   - Create a bucket named `rentflow-local`

### Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **MinIO Console:** http://localhost:9001
- **PostgreSQL:** localhost:5432

## What This Project Demonstrates

This project showcases a complete, production-ready full-stack application with:

🎯 **Full-Stack Development** - End-to-end ownership from UI to database
🎯 **Modern Tooling** - Next.js, NestJS, TypeScript, Prisma, Tailwind
🎯 **Architectural Best Practices** - Clean separation of concerns, modular design
🎯 **DevOps Skills** - Docker containerization, multi-service orchestration
🎯 **Problem-Solving** - Addressing real business pain points with technical solutions
🎯 **Security Mindset** - Private-by-default, air-gapped capable architecture

## Ideal For

- Property management companies looking to modernize operations
- Landlords with growing portfolios needing better organization
- Developers interested in full-stack TypeScript applications
- Teams wanting to understand modern web application architecture

---

**Built with ❤️ by Ricardo Sebastián Pineda de León | Copyright © 2026**
