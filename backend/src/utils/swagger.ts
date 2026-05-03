import { Application, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import { getLogger } from './logger';

const logger = getLogger('Swagger');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "REST API Docs",
      version,
    },
    components: {
      schemas: {
        IncidentInput: {
          type: "object",
          required: ["title", "description", "service", "severity"],
          properties: {
            title: {
              type: "string",
              description: "Incident title",
              example: "Payment service down",
            },
            description: {
              type: "string",
              description: "Incident description",
              example: "Payment gateway returning 503 errors for all transactions",
            },
            service: {
              type: "string",
              enum: ["payment", "auth", "notification"],
              description: "Service affected by the incident",
              example: "payment",
            },
            severity: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Severity level of the incident",
              example: "high",
            },
          },
        },
        IncidentOutput: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Incident ID",
              example: 1,
            },
            title: {
              type: "string",
              description: "Incident title",
              example: "Payment service down",
            },
            description: {
              type: "string",
              description: "Incident description",
              example: "Payment gateway returning 503 errors for all transactions",
            },
            service: {
              type: "string",
              enum: ["payment", "auth", "notification"],
              description: "Service affected by the incident",
              example: "payment",
            },
            severity: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Severity level of the incident",
              example: "high",
            },
            status: {
              type: "string",
              enum: ["open", "investigating", "resolved"],
              description: "Current status of the incident",
              example: "open",
            },
          },
        },
        IncidentAuditLog: {
          type: "object",
          properties: {
            id: { type: "integer" },
            incidentId: { type: "integer" },
            field: { type: "string" },
            oldValue: { type: "string", nullable: true },
            newValue: { type: "string", nullable: true },
            changedByUserId: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        UserRegister: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
              example: "SecurePassword123!",
            },
          },
        },
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
              example: "SecurePassword123!",
            },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "User ID",
              example: 1,
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/UserProfile",
            },
            accessToken: {
              type: "string",
              description: "JWT access token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        TokenResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description: "JWT access token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/incident/routers/incident.route.ts", "./src/auth/routes/auth.route.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Application, port: number) {

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;