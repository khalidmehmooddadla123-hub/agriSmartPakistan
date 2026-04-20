const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgriSmart360 API',
      version: '1.0.0',
      description: 'Smart Agriculture Management Platform - REST API Documentation',
      contact: {
        name: 'AgriSmart360 Team',
        email: 'admin@agrismart360.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            fullName: { type: 'string', example: 'Muhammad Ahmed' },
            email: { type: 'string', example: 'ahmed@example.com' },
            phone: { type: 'string', example: '+923001234567' },
            role: { type: 'string', enum: ['farmer', 'admin'], example: 'farmer' },
            language: { type: 'string', enum: ['en', 'ur'], example: 'en' },
            locationID: { type: 'string' },
            selectedCrops: { type: 'array', items: { type: 'string' } },
            notifEmail: { type: 'boolean', example: true },
            notifSMS: { type: 'boolean', example: false },
            isActive: { type: 'boolean', example: true }
          }
        },
        Crop: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Wheat' },
            nameUrdu: { type: 'string', example: 'گندم' },
            category: { type: 'string', enum: ['grain', 'vegetable', 'fruit', 'fiber', 'oilseed', 'spice', 'other'] },
            unit: { type: 'string', example: 'maund' },
            isActive: { type: 'boolean' }
          }
        },
        Price: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            cropID: { type: 'string' },
            locationID: { type: 'string' },
            price: { type: 'number', example: 3500 },
            previousPrice: { type: 'number', example: 3450 },
            currency: { type: 'string', example: 'PKR' },
            priceType: { type: 'string', enum: ['international', 'national', 'local'] },
            source: { type: 'string' },
            recordedAt: { type: 'string', format: 'date-time' }
          }
        },
        Location: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            country: { type: 'string', example: 'Pakistan' },
            province: { type: 'string', example: 'Punjab' },
            city: { type: 'string', example: 'Lahore' },
            cityUrdu: { type: 'string', example: 'لاہور' },
            lat: { type: 'number', example: 31.5204 },
            lng: { type: 'number', example: 74.3587 }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userID: { type: 'string' },
            type: { type: 'string', enum: ['price_alert', 'weather_alert', 'news', 'broadcast', 'daily_digest'] },
            title: { type: 'string' },
            message: { type: 'string' },
            channel: { type: 'string', enum: ['email', 'sms', 'in-app'] },
            isRead: { type: 'boolean' },
            isSent: { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
