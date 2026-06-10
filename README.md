# RentFlow - Internal Operations Portal

RentFlow is a high-performance, private B2B property management system engineered to modernize operations for rental businesses currently reliant on legacy spreadsheet ecosystems (Excel/CSV). 

Built with a secure-by-design, "private cloud" infrastructure mentality, RentFlow transitions manual data tracking into a centralized, robust relational data platform while maintaining strict air-gapped data ownership.

## Key Architecture Pillars
* **Relational Persistence:** Migrates flat Excel tracking into structured PostgreSQL transactions via Prisma ORM.
* **S3 Compatible Object Storage:** Local file and document lifecycle mirroring utilizing MinIO.
* **Intelligent Operational Analytics:** Purpose-built, performant reporting interfaces replacing manual spreadsheet auditing.

---

## Technical Stack (Local Environment)

* **Frontend Framework:** Next.js 14+ (React) using TypeScript
* **Design System:** Tailwind CSS + Shadcn/UI (Nova Design Preset via Radix Primitives)
* **Backend Architecture:** Node.js (NestJS Blueprint Ecosystem)
* **Database Layer:** PostgreSQL 16
* **Object Store Middleware:** MinIO (Local S3 Engine)
* **Infrastructure Virtualization:** Docker Compose

---

## Local Setup & Installation

Follow these steps to spin up the entire application infrastructure locally.

### Prerequisites
Ensure you have the following global dependencies installed on your system:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Node.js (v18 or higher)](https://nodejs.org/)

### Infrastructure Virtualization (Containers)
From the root of the project, spin up the local database and S3-compatible storage cluster:

docker-compose up -d

PostgreSQL Listening Port: 5432
MinIO Object Console: http://localhost:9001 (Credentials: minio_admin / minio_password123)

### Frontend Execution
Navigate to the frontend container and initialize the development instance:

cd frontend
npm install
npm run dev

### Bucket initialization
Open your browser and go to http://localhost:9001.

    Log in using the credentials we set up in the docker file:

        Username: minio_admin
        Password: minio_password123

This will open up the MinIO Object Browser Console, which looks and acts like a local version of the AWS S3 Console.

**Create your first bucket**

To get it ready for our upcoming frontend work, let's create a bucket to hold the apartment files:

    Once logged into the MinIO console, click on Buckets in the sidebar.

    Click Create Bucket.

    Name it rentflow-local and hit save.
