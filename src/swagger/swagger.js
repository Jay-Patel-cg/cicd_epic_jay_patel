const swaggerJSDoc = require('swagger-jsdoc');
const { APP_VERSION } = require('../constants/system');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevOps & CI/CD Knowledge Platform Complete API',
      version: APP_VERSION,
      description: 'Comprehensive production-ready REST API for DevOps pipelines, YAML utilities, full-text searches, collaborative discuss forums, analytical summaries, Prometheus exporter, and administrative backup operations.',
      contact: {
        name: 'DevOps Platform Support',
        email: 'support@devops.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT in the format: Bearer <token>',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Detailed error explanation' },
            error: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b23c8a5a411' },
            name: { type: 'string', example: 'Regular DevOps User' },
            email: { type: 'string', example: 'user@devops.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            emailVerified: { type: 'boolean', example: true },
            twoFactorEnabled: { type: 'boolean', example: false },
          },
        },
        Knowledge: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b23c8a5a412' },
            instruction: { type: 'string', example: 'Setup a multi-stage Docker build' },
            output: { type: 'string', example: 'FROM node:20 AS builder...' },
            topic: { type: 'string', example: 'docker' },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'], example: 'intermediate' },
            views: { type: 'integer', example: 42 },
            likes: { type: 'integer', example: 12 },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b23c8a5a413' },
            user: { type: 'string', example: '60c72b2f9b1d8b23c8a5a411' },
            knowledge: { type: 'string', example: '60c72b2f9b1d8b23c8a5a412' },
            comment: { type: 'string', example: 'Excellent docker template' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8b23c8a5a414' },
            user: { type: 'string', example: '60c72b2f9b1d8b23c8a5a411' },
            knowledge: { type: 'string', example: '60c72b2f9b1d8b23c8a5a412' },
            rating: { type: 'integer', example: 5 },
            review: { type: 'string', example: 'Saves hours of local configuration.' },
          },
        },
      },
    },
    paths: {
      '/api/v1/health': {
        get: {
          tags: ['Health'],
          summary: 'Retrieve operational health status and uptime details',
          responses: {
            200: {
              description: 'Service operational',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/api/v1/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Regular DevOps User' },
                    email: { type: 'string', example: 'user@devops.com' },
                    password: { type: 'string', example: 'Password123' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Registration successful',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate credentials and obtain JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@devops.com' },
                    password: { type: 'string', example: 'Password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/api/v1/workflows': {
        get: {
          tags: ['Workflows'],
          summary: 'Retrieve all workflows',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: {
              description: 'Workflows fetched successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/api/v1/search': {
        get: {
          tags: ['Search'],
          summary: 'Full-text query search and filters',
          parameters: [
            { name: 'q', in: 'query', description: 'Relevance search term (e.g. docker)', schema: { type: 'string' } },
            { name: 'topic', in: 'query', description: 'Filter by exact topic', schema: { type: 'string' } },
            { name: 'difficulty', in: 'query', description: 'Filter by difficulty', schema: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['latest', 'popular'] } },
          ],
          responses: {
            200: {
              description: 'Search successful',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/api/v1/yaml/validate': {
        post: {
          tags: ['YAML Utility'],
          summary: 'Validate YAML block configurations syntax',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content'],
                  properties: { content: { type: 'string', example: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: app' } },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'YAML evaluated successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/api/v1/analytics/summary': {
        get: {
          tags: ['Analytics'],
          summary: 'Fetch pipeline aggregated summary dashboard (MFA Protected)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Summary dashboard compiled successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/api/v1/monitoring/prometheus': {
        get: {
          tags: ['Monitoring Exporter'],
          summary: 'Retrieve native text-formatting metrics scrapable by Prometheus server',
          responses: {
            200: {
              description: 'Scrapable text document formatted successfully',
              content: { 'text/plain': { schema: { type: 'string' } } },
            },
          },
        },
      },
    },
  },
  apis: [], // Explicitly defined
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
