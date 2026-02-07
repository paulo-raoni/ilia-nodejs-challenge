# 📖 Table of Contents

1. [Original Challenge Description](#the-challenge)
2. [Project Structure & Architecture](#project-structure--architecture)
3. [Authentication](#authentication)
4. [Business Rules](#business-rules)
5. [Running the Project Locally](#running-the-project-locally)
6. [Running Unit Tests](#running-unit-tests)
7. [Test Coverage](#run-coverage-for-all-workspaces)
8. [OpenAPI & Swagger UI](#openapi--swagger-ui)

> ℹ️ The original challenge description is kept intact below.  
> Project-specific explanations, architecture details and execution instructions
> are documented **after the original content**.



---

## ília - Code Challenge NodeJS
**English**
##### Before we start ⚠️
**Please create a fork from this repository**

## The Challenge:
One of the ília Digital verticals is Financial and to level your knowledge we will do a Basic Financial Application and for that we divided this Challenge in 2 Parts.

The first part is mandatory, which is to create a Wallet microservice to store the users' transactions, the second part is optional (*for Seniors, it's mandatory*) which is to create a Users Microservice with integration between the two microservices (Wallet and Users), using internal communications between them, that can be done in any of the following strategies: gRPC, REST, Kafka or via Messaging Queues and this communication must have a different security of the external application (JWT, SSL, ...), **Development in javascript (Node) is required.**

![diagram](diagram.png)

### General Instructions:
## Part 1 - Wallet Microservice

This microservice must be a digital Wallet where the user transactions will be stored 

### The Application must have

    - Project setup documentation (readme.md).
    - Application and Database running on a container (Docker, ...).
    - This Microservice must receive HTTP Request.
    - Have a dedicated database (Postgres, MySQL, Mongo, DynamoDB, ...).
    - JWT authentication on all routes (endpoints) the PrivateKey must be ILIACHALLENGE (passed by env var).
    - Configure the Microservice port to 3001. 
    - Gitflow applied with Code Review in each step, open a feature/branch, create at least one pull request and merge it with Main(master deprecated), this step is important to simulate a team work and not just a commit.

## Part 2 - Microservice Users and Wallet Integration

### The Application must have:

    - Project setup documentation (readme.md).
    - Application and Database running on a container (Docker, ...).
    - This Microservice must receive HTTP Request.   
    - Have a dedicated database(Postgres, MySQL, Mongo, DynamoDB...), you may use an Auth service like AWS Cognito.
    - JWT authentication on all routes (endpoints) the PrivateKey must be ILIACHALLENGE (passed by env var).
    - Set the Microservice port to 3002. 
    - Gitflow applied with Code Review in each step, open a feature/branch, create at least one pull request and merge it with Main(master deprecated), this step is important to simulate a teamwork and not just a commit.
    - Internal Communication Security (JWT, SSL, ...), if it is JWT the PrivateKey must be ILIACHALLENGE_INTERNAL (passed by env var).
    - Communication between Microservices using any of the following: gRPC, REST, Kafka or via Messaging Queues (update your readme with the instructions to run if using a Docker/Container environment).

#### In the end, send us your fork repo updated. As soon as you finish, please let us know.

#### We are available to answer any questions.


Happy coding! 🤓




---

## Project Structure & Architecture

This project uses a **monorepo** approach to organize the solution and keep each microservice
isolated, while allowing shared infrastructure code where appropriate.

```
.
├── apps
│   ├── transactions   # Wallet Microservice (port 3001)
│   └── users          # Users Microservice (port 3002)
│
├── packages
│   └── shared         # Shared code (JWT, errors, env loader, logger)
│
├── docs
│   └── openapi        # OpenAPI YAMLs provided by the challenge
│
├── scripts            # Helper scripts (token generation)
├── docker-compose.yml
├── .env.example
└── README.md
```

### Technical Choices
- Node.js (JavaScript)
- Fastify for HTTP layer
- Docker & Docker Compose
- JWT authentication
- Separate JWT secret for internal service-to-service communication
- Strict separation of concerns
- No sensitive values hardcoded

---

## Authentication

### External JWT
Used for all external HTTP requests.

Environment variable:
```
JWT_EXTERNAL_SECRET=ILIACHALLENGE
```

### Internal JWT
Used exclusively for internal communication between microservices.

Environment variable:
```
JWT_INTERNAL_SECRET=ILIACHALLENGE_INTERNAL
```

Helper scripts are available to generate tokens locally:
```
JWT_EXTERNAL_SECRET=... npm run token:external -- <userId>
JWT_INTERNAL_SECRET=... npm run token:internal -- <userId>
```

---


## Business Rules

- A user **cannot be deleted** if their wallet balance is not zero.
- This rule is enforced by the Users service through secure internal communication
  with the Transactions (Wallet) service using an internal JWT.



## Running the Project Locally

### Prerequisites
- Docker Desktop
- WSL2 (Ubuntu recommended)
- Node.js 18+ (or 20)

### Steps

> All commands below must be executed **inside the project root directory**.

A recommended workflow is:
- Open the project in **VS Code**
- Use **“Open Folder”** and select the repository root
- Open the integrated terminal
- Make sure the terminal is using **Ubuntu (WSL)**  
  (VS Code usually opens the terminal already at the project root when using WSL)

Alternatively, you can open the Ubuntu terminal manually and navigate to the project folder.

Once inside the project root, run:

```
cp .env.example .env
npm install
docker compose up -d --build
```


### Quick Test
```
TOKEN=$(node scripts/generate-external-token.js user-123)

curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/status
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/status
```

If both endpoints respond successfully, the environment is correctly set up.


---

## Running Unit Tests

This project includes **unit tests focused on business use cases**, without requiring
a running database or HTTP server.

Tests are implemented at the **application layer (use cases)** for each microservice,
using in-memory or mocked repositories to validate business rules and edge cases.

### Run all unit tests

To execute all unit tests for every microservice in the monorepo, run:

```bash
npm test
```

This command runs the test script in all workspaces that define it,
including the Transactions and Users microservices.

### Transactions (Wallet) microservice

Unit tests for the Transactions service cover wallet-related business logic such as:
- Creating transactions (credit / debit)
- Listing transactions
- Calculating balances

Run the Transactions unit tests with:

```bash
npm -w @ilia/transactions test
```
### Users microservice

Unit tests for the Users service cover authentication and user management logic, including:

- User creation
- Authentication (login)
- Listing users
- Fetching a user by ID
- Updating users
- Deleting users

Run the Users unit tests with:

```bash
npm -w @ilia/users test
```

> ⚠️ **Important notes**
>
> - Tests are executed using **Jest**, running directly in each workspace.
> - Jest is executed with `node --experimental-vm-modules` to ensure compatibility with ESM modules on Node.js 20.
> - The warning displayed by Node.js is expected and does not indicate a failure.
> - No database containers are required to run unit tests.


### Run coverage for all workspaces

```bash
npm run test:coverage
```


---


## OpenAPI & Swagger UI

The OpenAPI specs provided by the challenge are available under:

- `docs/openapi/ms-users.yaml`
- `docs/openapi/ms-transactions.yaml`

> ℹ️ Swagger UI is provided as a **developer aid only**.
> It runs in a separate Docker Compose file and does not affect
> the application runtime or production setup.

The Swagger UI containers use derived OpenAPI files prepared specifically
for interactive usage under `docs/openapi/swagger/`.

### Run Swagger UI via Docker

This project provides an optional Docker Compose file to run Swagger UI without
changing the main application stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.swagger.yml up -d
```

Then open:

- Users: http://localhost:8081
- Transactions: http://localhost:8082

CORS is enabled at the HTTP layer to allow browser-based tools
(such as Swagger UI) while keeping business logic unaffected.


### How to authorize (Users & Transactions Swagger)

This project exposes **two separate Swagger UIs**, one for each microservice.  
Because of that, it is expected (and normal) that the authorization process must be done
independently in each Swagger UI.

---

#### Users Swagger (port 8081)

1. Open the Users Swagger UI:  
   http://localhost:8081

2. Create a user (if it does not exist yet):  
   - Endpoint:  
     `POST /users`

3. Generate an external access token:  
   - Endpoint:  
     `POST /auth`  
   - Copy the value returned in `access_token`.

4. In the top-right corner of Swagger UI, click **Authorize** and paste:  
   `Bearer <access_token>`

---

#### Transactions Swagger (port 8082)

1. Open the Transactions Swagger UI:  
   http://localhost:8082

2. Click **Authorize**.

3. Paste the **same external token** obtained from the Users Swagger:  
   `Bearer <access_token>`

> This token allows access to the **public wallet endpoints**.

---

#### Internal Transactions Endpoint

The endpoint below **does NOT accept the external token**:

`GET /internal/balance/{userId}`

It requires an **internal token**, used exclusively for service-to-service communication.

This token is normally generated and used internally by the system.
For **manual testing and debugging purposes** (e.g. Swagger UI),
an internal token can be generated as shown below.

##### Generate internal token (manual testing)

Run the following command from the project root:

```bash
docker compose exec -T transactions-api sh -lc \
'USER_ID="<USER_ID_AQUI>" node -e "const jwt=require(\"jsonwebtoken\"); const sub=process.env.USER_ID; if(!sub) throw new Error(\"Missing USER_ID\"); console.log(jwt.sign({sub,internal:true}, process.env.JWT_INTERNAL_SECRET,{expiresIn:\"5m\"}))"'

```

Copy the generated token and, in the Transactions Swagger UI:

1. Click **Authorize**
2. Paste:  
   `Bearer <internal_token>`

---

📌 **Important note**

- There are **two independent Swagger UIs**
- Each one keeps its own authorization state
- Authorizing in one **does not automatically authorize the other**

This is expected behavior.