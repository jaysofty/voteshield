# VoteShield

### Election Integrity Monitoring & Investigation Platform

VoteShield is a graph-powered election integrity monitoring application designed to help election monitors identify suspicious relationships between voters, voter cards, polling units, voting devices, and voting attempts.

The system records voting activity and automatically evaluates relationships in the graph to detect potentially suspicious behavior such as:

* Duplicate voter-card usage
* Multiple voter identities associated with the same voting device
* Suspicious relationships between voting attempts
* Repeated activity that requires investigation

The application provides a monitoring dashboard where election administrators can review activity, inspect alerts, and investigate suspicious voting relationships.
---

## Features

### Election integrity dashboard

The dashboard provides an overview of the current monitoring state, including:

* Registered voters
* Voting attempts
* Flagged attempts
* Active alerts
* Recent voting activity
* Detection summary
* Resolved investigations

### Voter registry

Election monitors can:

* View registered voters
* Search voters
* View voter-card information
* View assigned polling units
* View previous voting activity
* Record a new voting attempt

### Voting activity recording

A voting attempt records the relationship between:

* Voter card
* Polling unit
* Voting device

The system automatically runs integrity checks after an attempt is recorded.

### Automated detection

VoteShield currently detects suspicious patterns including:

#### Duplicate card usage

A voter card being used again after a completed voting attempt.

#### Unusual device activity

Multiple voter identities being associated with the same voting device.

### Alerts

Detected integrity events are surfaced as alerts with information such as:

* Alert type
* Severity
* Associated voting attempt
* Voter
* Polling unit
* Voting device

### Investigation

Investigators can inspect suspicious attempts and trace the relationships that caused an alert.

---

# Why a Graph Database?

Election integrity is fundamentally a relationship problem.

A traditional relational database can store voters, devices, polling units and voting attempts effectively, but investigating relationships across those entities often requires several joins.

For example:

> Has this voter card already been used?

Or:

> Has this voting device been associated with another voter?

Or:

> Which voters have interacted with the same device?

These questions become relationship traversals.

A graph database represents those relationships directly.

Instead of thinking only in terms of tables:

```text
Voter
VoterCard
Device
PollingUnit
VotingAttempt
```

VoteShield models the connections between those entities:

```text
(Voter)-[:OWNS]->(VoterCard)
(VoterCard)-[:USED_IN]->(VotingAttempt)
(VotingAttempt)-[:AT_POLLING_UNIT]->(PollingUnit)
(VotingAttempt)-[:USED_DEVICE]->(Device)
```

This makes relationship-based integrity checks natural graph queries.

For example, identifying multiple voters associated with the same device can be expressed as a graph traversal rather than reconstructing the relationship through multiple relational joins.

The graph model also makes it easier to extend the system later with additional entities and relationships such as:

* Polling agents
* Locations
* Election events
* Voter registration centers
* Authentication devices
* Geographic relationships

The primary reason for using a graph database is therefore not simply storing election records. It is **efficiently representing and investigating relationships between election entities**.

---

# Architecture

```text
                         ┌─────────────────────┐
                         │       Browser       │
                         │   VoteShield UI     │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP
                                    ▼
                         ┌─────────────────────┐
                         │     Next.js App     │
                         │                     │
                         │ Dashboard           │
                         │ Voters              │
                         │ Alerts              │
                         │ Investigation       │
                         │ API Routes          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ VoteShield          │
                         │ Repository Layer    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      CognoDB        │
                         │    Graph Database   │
                         └─────────────────────┘
```

---

# Data Model

VoteShield uses a graph model built around election entities and their relationships.

### Core entities

```text
Voter
  │
  │ OWNS
  ▼
VoterCard
  │
  │ USED_IN
  ▼
VotingAttempt
  │                 │
  │ AT_POLLING_UNIT │ USED_DEVICE
  ▼                 ▼
PollingUnit       Device
```

### Conceptual graph

```text
┌──────────┐
│  Voter   │
└────┬─────┘
     │ OWNS
     ▼
┌────────────┐
│ VoterCard  │
└─────┬──────┘
      │
      │ USED_IN
      ▼
┌─────────────────┐
│ VotingAttempt   │
└────┬────────┬───┘
     │        │
     │        │ USED_DEVICE
     │        ▼
     │     ┌────────┐
     │     │ Device │
     │     └────────┘
     │
     │ AT_POLLING_UNIT
     ▼
┌──────────────┐
│ PollingUnit  │
└──────────────┘
```

This model allows the application to traverse from a suspicious voting attempt to the entities connected to it.

---

# Example Integrity Relationships

### Normal voting activity

```text
Voter
  │
  ▼
VoterCard
  │
  ▼
VotingAttempt
  ├──► PollingUnit
  └──► Device
```

### Duplicate voter-card usage

```text
VoterCard
  │
  ├──► VotingAttempt 1
  │
  └──► VotingAttempt 2
```

The second attempt can be flagged because the card already has a completed voting attempt.

### Shared device relationship

```text
Voter A
  │
  ▼
VotingAttempt A
  │
  ▼
Device 01
  ▲
  │
VotingAttempt B
  ▲
  │
Voter B
```

The graph makes the shared-device relationship directly queryable.

---

# Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React

### Backend

* Next.js API routes
* TypeScript
* Repository pattern

### Database

* CognoDB
* Cypher

### DevOps

* Docker
* Docker Compose
* GitHub Actions
* Vercel

### Runtime

* Node.js 22

---

# Project Structure

```text
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── voters/
│   │   ├── alerts/
│   │   └── investigate/
│   │
│   ├── api/
│   │   ├── alerts/
│   │   ├── devices/
│   │   ├── voters/
│   │   ├── voting-options/
│   │   └── voting-attempts/
│   │
│   └── components/
│
├── hooks/
├── lib/
│   └── cognodb/
├── repositories/
└── types/
```

---

# Prerequisites

Before running VoteShield locally, install:

* Node.js 22+
* npm
* Git
* Docker Desktop (optional, for containerized execution)
* A CognoDB instance

---

# Creating a CognoDB Instance

VoteShield requires a CognoDB graph database instance.

Create a CognoDB instance using the CognoDB platform and obtain the following credentials:

```env
COGNODB_URI=
COGNODB_USERNAME=
COGNODB_PASSWORD=
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Then configure:

```env
COGNODB_URI=your-cognodb-uri
COGNODB_USERNAME=your-cognodb-username
COGNODB_PASSWORD=your-cognodb-password
```

Do not commit `.env.local` or database credentials to GitHub.

---

# Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd VoteShield
```

Install dependencies:

```bash
npm ci
```

Configure environment variables:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Loading Graph Data

The repository contains the data-loading scripts used to populate the graph.

Run the appropriate seed/data-loading script:

```bash
npm run seed
```

If the repository uses a different script name, replace the command above with the corresponding script from `package.json`.

The seed process creates the initial election entities and their relationships.

---

# Cypher Queries

The main integrity checks are implemented using Cypher queries.

## Duplicate voter-card usage

The duplicate-card detection traverses voting attempts associated with the same voter card.

Conceptually:

```cypher
MATCH (card:VoterCard)-[:USED_IN]->(attempt:VotingAttempt)
WITH card, collect(attempt) AS attempts
WHERE size(attempts) > 1
RETURN card, attempts
```

This identifies voter cards associated with multiple voting attempts.

---

## Shared device detection

The shared-device detection looks for multiple voter identities connected to the same voting device.

Conceptually:

```cypher
MATCH (voter1:Voter)-[:OWNS]->(card1:VoterCard)
      -[:USED_IN]->(attempt1:VotingAttempt)
      -[:USED_DEVICE]->(device:Device)

MATCH (voter2:Voter)-[:OWNS]->(card2:VoterCard)
      -[:USED_IN]->(attempt2:VotingAttempt)
      -[:USED_DEVICE]->(device)

WHERE voter1 <> voter2

RETURN voter1, voter2, device
```

This exposes relationships where the same device has been associated with different voters.

---

# API

The application exposes API routes for interacting with the graph.

Examples include:

```text
GET  /api/voters
GET  /api/devices
GET  /api/alerts
GET  /api/voting-options
POST /api/voting-attempts
```

The exact request and response structures can be found in the corresponding route handlers and TypeScript types.

---

# Recording a Voting Attempt

A monitor selects:

1. Voter card
2. Polling unit
3. Voting device

The application sends the attempt to the API.

The backend then:

```text
Receive voting attempt
        ↓
Create graph relationship
        ↓
Run integrity checks
        ↓
Detect suspicious relationships
        ↓
Create alert if necessary
        ↓
Return result to UI
```

A clean attempt is displayed as successfully recorded.

A suspicious attempt is flagged and can be investigated from the alert.

---

# Docker

VoteShield includes a production Docker configuration using Node.js 22.

Build the image:

```bash
docker compose build
```

Start the application:

```bash
docker compose up
```

The application will be available at:

```text
http://localhost:3000
```

Stop the application:

```bash
docker compose down
```

Environment variables are supplied to the container through Docker Compose.

---

# CI/CD

VoteShield uses GitHub Actions to automate quality checks and Docker builds.

The CI pipeline performs:

```text
Push / Pull Request
        ↓
Install dependencies
        ↓
TypeScript check
        ↓
Lint
        ↓
Next.js production build
        ↓
Docker build
```

The workflow helps prevent broken code from being merged and verifies that the application can be built successfully.

---

# Deployment

The application is deployed using Vercel.

Production environment variables must be configured in the Vercel project:

```env
COGNODB_URI
COGNODB_USERNAME
COGNODB_PASSWORD
```

The GitHub repository is connected to Vercel so that changes pushed to the production branch can trigger a new deployment.

**Production URL:**

`TODO: ADD VERCEL URL`

---

# Screenshots

## Dashboard

![VoteShield Dashboard](screenshots/dashboard.png)

The dashboard provides a high-level view of voting activity and detected integrity events.

## Voter Registry

![Voter Registry](screenshots/voters.png)

The voter registry allows monitors to search registered voters and record voting activity.

## Record Voting Attempt

![Record Voting Attempt](screenshots/voting-attempt.png)

Voting attempts are recorded using the voter card, polling unit and voting device.

## Alerts

![VoteShield Alerts](screenshots/alerts.png)

Suspicious activity is surfaced as integrity alerts.

## Investigation

![VoteShield Investigation](screenshots/investigate.png)

Investigators can inspect relationships associated with flagged activity.

---

# Security

Sensitive credentials are stored through environment variables and should never be committed to source control.

The following files should remain local:

```text
.env
.env.local
```

Production credentials should be configured through the hosting provider's environment-variable management system.

GitHub Actions secrets are used for CI/CD credentials and should not be hard-coded into workflow files.

---

# Future Improvements

Potential extensions include:

* Real-time voting activity streams
* More sophisticated graph-based anomaly detection
* Geographic anomaly detection
* Election-event management
* Role-based access control
* Investigation history
* Alert resolution workflows
* Audit logs
* Graph visualization for investigators
* Automated notification channels

---

# Author

Built as a graph database election-integrity monitoring project demonstrating:

* Graph data modeling
* Cypher querying
* Relationship-based anomaly detection
* Full-stack application development
* API design
* Docker
* CI/CD
* Cloud deployment

**Owner — Adekunle James**

