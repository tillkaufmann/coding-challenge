# Service Description

VAT Validation Service

## 1. Introduction

**VAT Validation Service**
This service provides a unified API for validating European and Swiss VAT numbers.
It is implemented in TypeScript and designed for integration into Node.js projects.

## 2. Purpose

The service offers an API for the verification of VAT identification numbers for companies in the EU and Switzerland.

## 3. Features

- Validation of EU and CH VAT numbers
- Uses official government services for validation

## 4. Usage

### Prerequisites
- Node.js (>= 22.10)
- pnpm

### Installation

```sh
pnpm install
```

### Starting the Service

```sh
pnpm dev
```

### Example Request

```b
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"countryCode": "DE", "vat": "DE123456789"}'
```

## 5. API Documentation

See specification in `openapi/spec.yaml`.

## 6. Configuration

Configuration is done via `app.conf.json`

- Default port: `3000` (can be changed via the `Port` variable)
- Regexes and Country Codes can also be configured in `app.conf.json`.

## 7. Dependencies

- `express`
- `typescript`
- `zod`

## 8. Testing

Run `pnpm test` to run the test suite.
There are two tests than run against the 3rd party API, which have the ext .man.test.ts and will be ignored by jest.
This decision was made, so that a non available 3rd party api would not break the test suite in a CI/CD pipeline.

## 9. TODO
Bundle the service in a Docker container for easier deployment. Create a Helm chart for deployment in Kubernetes.
Setup a CI/CD pipeline for automated testing and deployment.
Create the service stubs from OpenAPI specification using `openapi-generator-cli`.

## 10. License

MIT License - see the `LICENSE` file for details.
