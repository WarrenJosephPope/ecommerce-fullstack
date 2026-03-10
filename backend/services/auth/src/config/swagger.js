const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Authentication Service API',
      version: '1.0.0',
      description: 'Authentication service with JWT, email/password, phone/OTP, and anonymous authentication support',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server',
      },
      {
        url: `http://localhost:${config.server.port}/api/auth`,
        description: 'API Base URL',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
            },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      nullable: true,
                    },
                    phone: {
                      type: 'string',
                      nullable: true,
                    },
                    isAnonymous: {
                      type: 'boolean',
                    },
                  },
                },
                accessToken: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Email Authentication',
        description: 'Email and password authentication endpoints',
      },
      {
        name: 'Phone Authentication',
        description: 'Phone and OTP authentication endpoints',
      },
      {
        name: 'Anonymous Authentication',
        description: 'Anonymous authentication and conversion endpoints',
      },
      {
        name: 'Token Management',
        description: 'Token refresh, rotation, and user info endpoints',
      },
    ],
  },
  // Path to the API routes files
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
