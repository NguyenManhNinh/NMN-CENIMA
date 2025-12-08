const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cinema Booking API',
      version: '1.0.0',
      description: 'API documentation for Cinema Booking System (Graduation Thesis 2026)',
      contact: {
        name: 'Nguyen Manh Ninh',
        email: 'ninh@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs
  apis: ['./src/routes/V1/*.js', './src/models/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
