# 📖 Table of Contents

1. [Original Challenge Description](#the-challenge)
2. [Project Structure & Architecture](#project-structure--architecture)
3. [Authentication](#authentication)
4. [Running the Project Locally](#running-the-project-locally)

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
npm run token:external
npm run token:internal
```

---

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

