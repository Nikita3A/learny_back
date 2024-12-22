# Learny Back-End

This project contains the back-end code for the Learny app, designed to provide AI-generated courses and tests.

## Prerequisites

Before you begin, ensure you have the following requirements installed:

- Node.js version 18.18.2 or later.
- Docker, Docker Compose, or PostgreSQL v13.4.

## Running the Project with Docker Compose

To run the project and install dependencies, navigate to the root directory of the project and execute the following commands:
```bash
docker-compose up
```
Then, install the project dependencies by running:
```bash
npm install
```
Alternatively, if you encounter issues, you can force the installation with:
```bash
npm install --force
```
## Troubleshooting
If you encounter the following error:

> [!CAUTION] 
The GROQ_API_KEY environment variable is missing or empty. Either provide it, or instantiate the Groq client with an apiKey option, like new Groq({ apiKey: 'My API Key' }).

To fix this, you need to generate a new API key by visiting https://groq.com/ and paste it into the .env file in project.
