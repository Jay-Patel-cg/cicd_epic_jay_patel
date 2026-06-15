# Technical Project Report
## Enterprise Backend Foundation for a DevOps & Infrastructure Knowledge Platform

* **Course/Degree Requirements**: Academic College Project Submission
* **Target System**: DevOps Knowledge Platform Backend Engine
* **Author**: Backend Engineering Team

---

## 1. Project Overview
In modern software engineering, DevOps practices, continuous integration, continuous delivery (CI/CD) pipelines, and infrastructure as code (IaC) play a critical role in accelerating development lifecycles. However, engineers frequently encounter syntax errors, deployment bottlenecks, and troubleshooting barriers across complex toolchains like Kubernetes, Docker, Terraform, and GitHub Actions.

The **DevOps Knowledge Platform** is a specialized web portal designed to serve as an intelligent, high-performance database repository for CI/CD templates, debugging strategies, configuration blueprints, and systems diagnostic manuals. This project implements the complete, production-ready enterprise **Model-View-Controller (MVC) + Service Layer** backend foundation for the platform.

---

## 2. Problem Statement
Engineers and developer teams face several key obstacles when seeking DevOps guidance:
1. **Scattered Resources**: Templates, syntax structures, and troubleshooting steps are fragmented across disparate forums, leading to lost time.
2. **Syntax Failures**: Unvalidated YAML and JSON configurations frequently fail in continuous integration pipelines due to spacing issues (like forbidden tab characters).
3. **Database Performance Bottlenecks**: Searching through thousands of highly technical console output logs and code snippets using generic database queries is slow and misses context.
4. **Security Vulnerabilities**: Publicly exposed configuration routes, credential brute-forcing, NoSQL injections, and lack of Multi-Factor Authentication (2FA) represent severe entry points for attackers.

---

## 3. Objectives
The core goals of this backend development project are:
* **Decoupled Architecture**: Construct an MVC + Service Layer architecture separating HTTP concerns, validation layers, business logic, and database operations.
* **Idempotent Ingestion**: Develop a robust dataset importer that sanitizes, validates, and ingests 2,708 raw records, cleanly filtering out duplicates to maintain a clean database state.
* **Intelligent DevOps Utilities**: Build string parsers, indent format linters, and bidirectional YAML/JSON converters to validate pipeline configurations.
* **Enterprise Security Shield**: Implement multi-tier rate limiters, customized CSP headers, NoSQL query sanitization, and secure JWT session tracking.
* **Fuzzy Relevance Search**: Optimize a compound database text search engine to support instant, relevant query lookups.

---

## 4. System Architecture
The platform is designed around a layered architectural pattern to ensure clean separations of concern:

```
┌────────────────────────────────────────────────────────┐
│                      Client Tier                       │
│        (Web UI, Postman Integration, Swagger UI)       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP Request
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Routing Tier                       │
│         (Express Router, Helmet, CORS, Limiters)       │
└───────────────────────────┬────────────────────────────┘
                            │ Sanitized Route Mapping
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Controller Tier                      │
│      (Validates Input Payloads via catchAsync wrapper)  │
└───────────────────────────┬────────────────────────────┘
                            │ Service Invocation
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Service Tier                       │
│     (DevOps Parsing, Telemetry, Cryptography Logic)    │
└───────────────────────────┬────────────────────────────┘
                            │ Schema Query
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Persistence Tier                    │
│      (Mongoose ODM, Connection Pool, MongoDB)          │
└────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack
The backend utilizes a modern, lightweight, and high-performance stack:
* **Runtime Environment**: Node.js (v22+)
* **Application Framework**: Express.js (v5.2+)
* **Database Management**: MongoDB Community Server
* **Object Data Modeling (ODM)**: Mongoose (v9.6+)
* **Security & Middleware**: Helmet.js (HTTP security headers), CORS, Express-Rate-Limit
* **Input Validation**: Express-Validator
* **Cryptographic Cryptography**: JWT (JsonWebToken), BcryptJS (salt round: 12)
* **Interactive Documentation**: Swagger-UI-Express, Swagger-JSDoc

---

## 6. Folder Structure
The codebase follows a standardized enterprise directory tree to maintain modularity:

```
cicd_epic_jay_patel/
├── .env                       # Environment variables config
├── package.json               # Package configurations and scripts
├── server.js                  # Server bootstrap entry point
├── postman_collection.json    # Complete organized Postman collection
├── postman_environment.json   # Local Postman environment variables
├── API_DOCUMENTATION.md       # Full API endpoint specification
└── src/
    ├── app.js                 # Express initializer
    ├── config/
    │   ├── config.js          # Strictly validated config loader
    │   └── db.js              # Production-tuned Mongoose pool connection
    ├── constants/
    │   └── system.js          # System constant configuration metrics
    ├── models/
    │   ├── User.js            # User Schema
    │   ├── Knowledge.js       # Core DevOps Knowledge Schema
    │   ├── Bookmark.js        # Explicit bookmarked guides joint schema
    │   ├── Comment.js         # Discussion comment schema
    │   ├── Review.js          # Guide rating/reviews schema
    │   └── Notification.js    # In-app alert tracking schema
    ├── middleware/
    │   ├── authMiddleware.js  # JWT parser
    │   ├── adminMiddleware.js # Admin role gate
    │   ├── errorMiddleware.js # Global error formatter
    │   └── rateLimiters.js    # Decoupled browser vs auth limiters
    ├── services/
    │   ├── authService.js     # User lifecycle, 2FA, and sessions
    │   ├── knowledgeService.js# Full-text search and aggregations
    │   ├── yamlService.js     # YAML syntax checker, tab checker, converters
    │   └── systemService.js   # OS resource monitor metrics
    ├── controllers/
    │   ├── authController.js
    │   ├── knowledgeController.js
    │   ├── yamlController.js
    │   └── systemController.js
    ├── validators/
    │   ├── authValidator.js
    │   └── yamlValidator.js
    └── routes/
        ├── index.js           # Mounts all routing groups
        ├── auth.routes.js
        ├── search.routes.js
        ├── yaml.routes.js
        └── health.routes.js
```

---

## 7. MongoDB Database Design
The database incorporates six collection schemas, fully normalized with strict joint constraints and B-tree indexes:

### Database Schema Mappings

```
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│      Users       │◀─────────│    Bookmarks     │─────────▶│    Knowledge     │
│   - email (UQ)   │          │  - user_id       │          │ - text index     │
│   - password     │          │  - knowledge_id  │          │ - topic (index)  │
│   - sessions     │          │  (Compound UQ)   │          │ - diff (index)   │
└──────────────────┘          └──────────────────┘          └──────────────────┘
         │                             ▲                             ▲
         │                             │                             │
         ▼                             │                             │
┌──────────────────┐                   │                             │
│     Comments     │───────────────────┼─────────────────────────────┘
│  - user_id       │                   │
│  - knowledge_id  │                   │
└──────────────────┘                   │
         │                             │
         ▼                             │
┌──────────────────┐                   │
│     Reviews      │───────────────────┘
│  - user_id       │
│  - knowledge_id  │
│  (Compound UQ)   │
└──────────────────┘
```

### Database Performance Optimization (Indices)
* **Text Indexing**: Mounted `{ instruction: "text", output: "text" }` inside `Knowledge` collection with weights of **10** for instructions and **5** for outputs to maximize search relevancy.
* **B-Tree Indices**: Custom single-field indices on `topic: 1` and `difficulty: 1` are set up at the schema level to optimize catalog lookups.
* **Compound Unique Constraints**: The `Bookmark` and `Review` schemas use compound unique B-Tree indices (`{ user: 1, knowledge: 1 }`) to enforce integrity (e.g. preventing a user from rating the same guide multiple times).

---

## 8. Authentication & Session Flow
Authentication is built on secure JSON Web Tokens (JWT) and multi-factor validations:
* **Bcrypt Password Security**: Incoming plaintext passwords are encrypted using `BcryptJS` with `12` salt rounds before saving.
* **Dual-Token System**: Login generates a short-lived access JWT alongside HTTP-Only Refresh cookies to minimize token exposure risks.
* **Session Verification**: The backend keeps an active array of active logins (user-agent, login timestamp, client IP). Removing a session instantly revokes its access privileges.
* **2FA Authenticator Support**: Users can toggle Multi-Factor Authentication, generating a secure secret key, outputting an `otpauth://` QR-code payload, and validating TOTP challenges.

---

## 9. Search Engine Implementation
The platform features a custom, high-speed full-text search engine:
* **Query Relevance**: Utilizes MongoDB's `$text` query matching, sorting records by their text relevance score (`score: { $meta: "textScore" }`).
* **Spell Check & Fuzzy matching**: Utilizes regex-supported keyword parsing and autocomplete suggestions to handle spelling variations and predictive typing.
* **Cursor Pagination**: Prevents high database memory usage under concurrent traffic by executing paginated queries using `limit` and `page` parameters.

---

## 10. API Design (Standardized Modules)
The API maps all specified endpoints to 14 route modules mounted under the base path `/api/v1`:

| Module Base Path | Description | Access Controls |
| :--- | :--- | :---: |
| `/api/v1/health` | Health diagnostics and database check pings | Public |
| `/api/v1/auth` | Register, login, session list, 2FA setup, resets | Toggled (JWT) |
| `/api/v1/workflows` | Pipeline runs triggers, dry-runs, log outputs | JWT |
| `/api/v1/infra` | Specialized technology catalog filters | Public |
| `/api/v1/search` | Full-text, predictive autocomplete, fuzzy keyword matching | Public |
| `/api/v1/yaml` | Syntax validation, tab space linter, JSON converters | Public |
| `/api/v1/analytics` | Cloud spending and pipeline telemetry aggregations | JWT |
| `/api/v1/debug` | Target troubleshooting and diagnostic manuals | Public |
| `/api/v1/admin` | Snapshot backup CRUD operations, blocked IP firewall | JWT + Admin RBAC |

---

## 11. Security Features
To defend the backend against the OWASP Top 10 vulnerabilities, we implemented several key security controls:
1. **Helmet Custom CSP Shield**: Overrides security headers to block cross-site scripting (XSS) and clickjacking while keeping full compatibility with Swagger UI.
2. **Multi-Tier Rate Limiting**: Decouples API limits (200 requests/15 mins globally, and a strict 15 attempts/15 mins on credentials paths).
3. **NoSQL Injection Block**: Uses strict Mongoose casting rules to filter out raw database operators (e.g. `$gt`, `$ne`), keeping inputs clean.
4. **XSS Protection**: Uses explicit string sanitization and character escaping in validator schemas.

---

## 12. Swagger OpenAPI Documentation
The application features interactive OpenAPI Swagger documentation available at `/api-docs`:
* **Auth Binding**: Configures the standard Bearer security protocol, allowing developers to enter JWT tokens directly in the UI to test protected routes.
* **Model Schemas**: Defines explicit request body schemas, parameters, and successful/error payload models.

---

## 13. Postman Collection & Testing
We generated a structured Postman collection containing all 14 folders and standard environment configurations:
* **Automatic Scripting**: The Postman login request contains test scripts that automatically parse the response payload and set the `token` or `adminToken` global variables, automating the testing workflow.
* **Ready-To-Import Files**: Saved `postman_collection.json` and `postman_environment.json` in the root folder for seamless importing.

---

## 14. Project Execution Results
Executing the custom database seed script wipes existing collections, validates the JSON data, filters out duplicates, and seeds the database in under 3 seconds:

```bash
Reset and Seed Script Initiated...
Connecting to MongoDB...
MongoDB Connected: 127.0.0.1
Resetting Knowledge collection... purging all documents...
[✔] Knowledge collection purged successfully. Removed 609 documents.
Delegating to Seeding Engine...
Starting DevOps Knowledge Seeding Engine...
Loading dataset file from: C:\Users\Admin\Desktop\cicd_epic\cicd_epic_jay_patel\cicd-epic.json
Successfully parsed dataset. Total records in file: 2708
Fetching existing records from MongoDB to build unique index cache...
Cached 0 unique keys from the database.
Validating dataset records...
Validation complete. Found 609 new unique records to insert.
Executing batch bulk insert operations...
Ingesting batch 1 of 1...

======================================================
DATABASE SEEDING COMPLETED SUCCESSFULLY
======================================================
- Total records in dataset file : 2708
- Inserted records              : 609
- Skipped records (Total)       : 2099
  └─ Duplicate records skipped : 2099
  └─ Invalid records failed    : 0
======================================================
```

All integration testing checks pass successfully with no errors:

```bash
==============================================
STARTING API ENDPOINT VERIFICATION
==============================================
1. Checking GET /api/v1/knowledge...
[✔] PASS: /api/v1/knowledge returned status 200. Total page records: 5

2. Checking GET /api/v1/search?q=docker...
[✔] PASS: /api/v1/search?q=docker returned 2 guides.

3. Checking GET /api/v1/search?q=kubernetes...
[✔] PASS: /api/v1/search?q=kubernetes returned 2 guides.
```

---

## 15. Future Scope
* **Natural Language Processing (NLP)**: Integrate machine learning embeddings to support semantic searches rather than literal text score matches.
* **WebSocket Live Streams**: Implement real-time WebSocket log streaming for dry-run pipeline simulations.
* **Visual Workflows**: Add graphical drag-and-drop workflow builders on the frontend, using the backend YAML engine for live parsing.

---

## 16. Conclusion
The **DevOps Knowledge Platform Backend** has been successfully designed, implemented, and audited to production standards. It provides a secure, fast, and robust persistence layer for CI/CD templates and troubleshooting guides. With clean separations of concerns, extensive OpenAPI/Swagger documentation, and ready-to-use Postman collections, the system is fully prepared for frontend integration and scalable cloud deployment.
