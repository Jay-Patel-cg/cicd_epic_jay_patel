# API Documentation - DevOps Knowledge Platform

Welcome to the **DevOps Knowledge Platform API Documentation**. This document provides comprehensive reference details for all endpoints, structured by logical business modules.

---

## Centralized JSON Envelope Pattern
All API responses conform to a unified production JSON envelope to simplify client parsing:

### Success Payload Example
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {}
}
```

### Error Payload Example
```json
{
  "success": false,
  "message": "Detailed error validation diagnostics",
  "error": {
    "status": 400,
    "errors": []
  }
}
```

---

## 1. Health Module
System availability and database connection diagnostics.

### GET /api/v1/health
* **Endpoint Name**: Get API Health Status
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/v1/health`
* **Description**: Returns the active operational status of the server process, current database connection state, node runtime version, and application uptime metrics.
* **Authentication Required**: No
* **Request Parameters**: None
* **Query Parameters**: None
* **Request Body**: None
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "DevOps Knowledge Platform API is healthy",
    "data": {
      "uptime": 124.52,
      "timestamp": "2026-06-01T15:10:00.000Z",
      "status": "UP",
      "env": "development"
    }
  }
  ```

---

## 2. Authentication & Session Module
User account registrations, JWT validations, active logins monitoring, and Multi-Factor Authentications (2FA).

### POST /api/v1/auth/register
* **Endpoint Name**: Register User Account
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/v1/auth/register`
* **Description**: Create new regular user credentials. Filters email collisions.
* **Authentication Required**: No
* **Request Parameters**: None
* **Query Parameters**: None
* **Request Body (application/json)**:
  ```json
  {
    "name": "Jane DevOps",
    "email": "jane@devops.com",
    "password": "Password123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "60b8d5c4f1a2c3d4e5f6a7b8",
        "name": "Jane DevOps",
        "email": "jane@devops.com",
        "role": "user"
      }
    }
  }
  ```
* **Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Email is already registered"
  }
  ```

### POST /api/v1/auth/login
* **Endpoint Name**: Authenticate User
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/v1/auth/login`
* **Description**: Authenticate user credentials, generate signed JWT token, and track connection sessions. Protected by strict rate limits.
* **Authentication Required**: No
* **Request Parameters**: None
* **Query Parameters**: None
* **Request Body (application/json)**:
  ```json
  {
    "email": "jane@devops.com",
    "password": "Password123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "60b8d5c4f1a2c3d4e5f6a7b8",
        "name": "Jane DevOps",
        "email": "jane@devops.com",
        "role": "user"
      }
    }
  }
  ```

### GET /api/v1/auth/profile
* **Endpoint Name**: Fetch User Profile
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/v1/auth/profile`
* **Description**: Retrieve active user information based on Bearer token identification.
* **Authentication Required**: Yes (Bearer Token)
* **Request Parameters**: None
* **Query Parameters**: None
* **Request Body**: None
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile fetched successfully",
    "data": {
      "user": {
        "id": "60b8d5c4f1a2c3d4e5f6a7b8",
        "name": "Jane DevOps",
        "email": "jane@devops.com",
        "role": "user"
      }
    }
  }
  ```

---

## 3. Search and Discovery Module
Autocomplete prefix lookup, relevance text score matching, and category filtering.

### GET /api/v1/search
* **Endpoint Name**: Full Text Query Search
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/v1/search`
* **Description**: Matches string queries against indexed fields (`instruction` and `output`).
* **Authentication Required**: No
* **Request Parameters**: None
* **Query Parameters**:
  * `q` (String, required): Search query keywords.
  * `topic` (String, optional): Specialized category filter.
  * `page` (Number, default `1`): Pagination page.
  * `limit` (Number, default `10`): Items limit.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Full text search executed successfully",
    "data": {
      "records": [
        {
          "_id": "60b8d5c4f1a2c3d4e5f6a7b9",
          "instruction": "How to spin up a Docker Compose multi-service build?",
          "output": "version: '3.8'\nservices:...",
          "topic": "docker",
          "difficulty": "intermediate",
          "views": 42,
          "likes": 5
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "pages": 1
      }
    }
  }
  ```

### GET /api/v1/search/autocomplete
* **Endpoint Name**: Prefix Autocomplete Suggestions
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/v1/search/autocomplete`
* **Description**: Instant predictive term retrieval for typing suggestions.
* **Authentication Required**: No
* **Request Parameters**: None
* **Query Parameters**:
  * `q` (String, required): Query prefix string.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Autocomplete suggestions fetched",
    "data": ["kubernetes pod", "kubernetes configmap", "kubernetes ingress"]
  }
  ```

---

## 4. Infrastructure Catalog Module
Targeted category streams for orchestration instances and container tools.

### GET /api/v1/infra/:topic
* **Endpoint Name**: Fetch Technology Catalog
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/v1/infra/:topic`
* **Description**: High-speed catalog retrieval for specific technologies (e.g. `k8s`, `docker`, `terraform`, `aws`, `gcp`, `azure`).
* **Authentication Required**: No
* **Request Parameters**:
  * `topic` (Path string, required): Technology category.
* **Query Parameters**:
  * `page` (Number, default `1`): Pagination offset.
  * `limit` (Number, default `10`): Ingest count.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Catalog records fetched successfully",
    "data": {
      "records": [
        {
          "instruction": "Set up k8s cluster metrics server",
          "output": "kubectl apply -f https://...",
          "topic": "kubernetes",
          "difficulty": "expert"
        }
      ],
      "pagination": { "total": 181, "page": 1, "limit": 10, "pages": 19 }
    }
  }
  ```

---

## 5. Workflow Operations Module
Pipeline dry-runs simulation triggers, history logs, metrics, and cloning.

### POST /api/v1/workflows/:id/run
* **Endpoint Name**: Trigger Dry-Run Simulation
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/v1/workflows/:id/run`
* **Description**: Simulate dry-run execution of the target DevOps configuration to test output telemetry.
* **Authentication Required**: Yes (Bearer Token)
* **Request Parameters**:
  * `id` (Path String, required): MongoDB Knowledge ID.
* **Query Parameters**: None
* **Request Body**: None
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Workflow dry-run triggered successfully",
    "data": {
      "runId": "run_9a8b7c6d5e4f3a2b",
      "status": "completed",
      "durationMs": 420,
      "logsUrl": "/api/v1/workflows/60b8d5c4f1a2c3d4e5f6a7b9/logs",
      "metrics": {
        "cpuUsage": 18.5,
        "memoryUsage": 128
      }
    }
  }
  ```

---

## 6. YAML Utilities Module
YAML structure syntactic validator, indentation rules checker, templates compile merges, and format converters.

### POST /api/v1/yaml/validate
* **Endpoint Name**: Validate YAML Format
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/v1/yaml/validate`
* **Description**: Verifies raw string formats for standard alignment.
* **Authentication Required**: No
* **Request Parameters**: None
* **Query Parameters**: None
* **Request Body (application/json)**:
  ```json
  {
    "content": "apiVersion: apps/v1\nkind: Deployment"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "YAML is syntactically valid",
    "data": {
      "valid": true
    }
  }
  ```
* **Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "YAML validation failed",
    "error": {
      "message": "missed comma flow map..."
    }
  }
  ```

### POST /api/v1/yaml/lint
* **Endpoint Name**: Lint Indentation Tab Check
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/v1/yaml/lint`
* **Description**: Scans yaml payload looking for invalid tab characters (`\t`) and reports exact lines.
* **Authentication Required**: No
* **Request Parameters**: None
* **Query Parameters**: None
* **Request Body (application/json)**:
  ```json
  {
    "content": "apiVersion: v1\n\tkind: Pod"
  }
  ```
* **Success Response (200 OK - Issues Flagged)**:
  ```json
  {
    "success": true,
    "message": "Linting evaluation complete",
    "data": {
      "errors": [
        {
          "line": 2,
          "severity": "error",
          "message": "Tab character found. Use standard spaces for YAML indentation."
        }
      ]
    }
  }
  ```

---

## 7. System Diagnostics & Telemetry Module
Telemetry Prometheus plaintext exporter and system load summaries.

### GET /api/v1/monitoring/prometheus
* **Endpoint Name**: Prometheus Exporter Metrics
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/v1/monitoring/prometheus`
* **Description**: Standard plaintext scrapable monitor strings representing server system uptime, active connection pool metrics, and registration counts.
* **Authentication Required**: No
* **Request Parameters**: None
* **Query Parameters**: None
* **Request Body**: None
* **Success Response (200 OK - text/plain)**:
  ```text
  # HELP system_uptime_seconds Overall server uptime in seconds
  # TYPE system_uptime_seconds gauge
  system_uptime_seconds 3804.18
  
  # HELP active_db_connections Current active Mongoose connections count
  # TYPE active_db_connections gauge
  active_db_connections 12
  ```

---

## 8. Collaboration and Engagement Module
Timeline comments discussion threads and ratings reviews.

### POST /api/v1/comments/:workflowId
* **Endpoint Name**: Add Discussion Comment
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/v1/comments/:workflowId`
* **Description**: Publish a new discussion thread under a specific knowledge guide.
* **Authentication Required**: Yes (Bearer Token)
* **Request Parameters**:
  * `workflowId` (Path String, required): Guide Knowledge ID.
* **Request Body (application/json)**:
  ```json
  {
    "comment": "Outstanding multi-stage docker configurations!"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Comment posted successfully",
    "data": {
      "id": "60b8d5c4f1a2c3d4e5f6a7c1",
      "comment": "Outstanding multi-stage docker configurations!",
      "user": "60b8d5c4f1a2c3d4e5f6a7b8",
      "createdAt": "2026-06-01T15:15:00.000Z"
    }
  }
  ```

---

## 9. Administrative Module
Database backup JSON CRUD management and blocked malicious IP firewall rules.

### POST /api/v1/admin/backups/create
* **Endpoint Name**: Create Database Point-In-Time Backup
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/v1/admin/backups/create`
* **Description**: Safely export all active database documents into a structured JSON backup archive.
* **Authentication Required**: Yes (Bearer Token + Admin Role Required)
* **Request Parameters**: None
* **Request Body**: None
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Database backup archive created successfully",
    "data": {
      "backupId": "backup_1464733200",
      "filename": "backup_20260601T151000.json",
      "sizeBytes": 23669000,
      "createdAt": "2026-06-01T15:10:00.000Z"
    }
  }
  ```
* **Error Response (403 Forbidden - Regular User)**:
  ```json
  {
    "success": false,
    "message": "Forbidden - Administrator credentials required"
  }
  ```

### POST /api/v1/admin/security/block-ip
* **Endpoint Name**: Block Malicious IP
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/v1/admin/security/block-ip`
* **Description**: Insert specific IP strings to immediate denial configurations, returning 403 Forbidden payload dynamically.
* **Authentication Required**: Yes (Bearer Token + Admin Role Required)
* **Request Parameters**: None
* **Request Body (application/json)**:
  ```json
  {
    "ip": "192.168.1.150"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "IP 192.168.1.150 has been blocked successfully."
  }
  ```
