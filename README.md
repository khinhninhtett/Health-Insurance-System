# 🏥 Health Insurance Management System (HIMS)

[![Status](https://img.shields.io/badge/Status-Development-yellow)]()
[![Core-Engine](https://img.shields.io/badge/Legacy-COBOL_Integration-red)]()
[![Architecture](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20COBOL-blue)]()

A robust Health Insurance System bridging modern web-based member portals with mission-critical legacy insurance calculation engines.

---

## 🚀 System Architecture
This platform follows a **"Modern-Front-Legacy-Back"** pattern:
*   **Frontend:** A responsive **React.js** interface for members and providers.
*   **Middleware:** A **Node.js** API layer that handles orchestration, authentication, and secure communication.
*   **Core Engine:** A **COBOL**-based backend mainframe/subsystem that handles high-precision actuarial math, premium calculations, and long-term historical insurance data.

---

## 🏗 Key Features
*   **Member Dashboard:** React-based portal for policy viewing and claim submissions.
*   **REST-COBOL Bridge:** The Node.js layer translates JSON web requests into fixed-length record formats required by the COBOL modules.
*   **Actuarial Calculation Engine:** High-performance, time-tested COBOL routines for policy pricing and risk assessment.
*   **Claim Adjudication:** Automated workflows that interface between the modern database and legacy records.

---

## 💻 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, TypeScript, TailwindCSS |
| **Middleware** | Node.js, Express, Axios |
| **Legacy Core** | COBOL (GnuCOBOL/MicroFocus) |
| **Data Interface** | JSON-to-EBCDIC/Fixed-Width Conversion |
| **Database** | PostgreSQL + Legacy VSAM/Flat Files |

---

## 🔒 Data Integrity & Security
*   **Encapsulation:** The COBOL core is isolated; only the Node.js API layer can communicate with the calculation routines.
*   **Validation:** Strict input sanitization in Node.js prevents legacy system buffer overflows or injection errors.
*   **Auditability:** Every transaction is logged at both the API level and the legacy mainframe execution level.

---

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
*   Node.js (v20+)
*   GnuCOBOL (for local testing of core routines)
*   Docker Desktop

### 2. Setup
```bash
# Clone the repository
git clone [repository-url]

# Install Node dependencies
cd server
npm install

# Build the React frontend
cd ../client
npm install
npm run build
