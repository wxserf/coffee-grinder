const schema = {
  type: 'object',
  required: ['name', 'flow'],
  properties: {
    name: { type: 'string' },
    metadata: {
      type: 'object',
      properties: {
        instant: { type: 'boolean' },
        scenario: {
          type: 'object',
          properties: {
            sequential: { type: 'boolean' }
          },
          required: ['sequential'],
          additionalProperties: true
        }
      },
      additionalProperties: true
    },
    connections: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { anyOf: [{ type: 'integer' }, { type: 'string' }] },
          name: { type: 'string' },
          type: { type: 'string' }
        },
        additionalProperties: true
      }
    },
    variables: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          value: {}
        },
        additionalProperties: true
      }
    },
    flow: {
      type: 'array',
      items: { $ref: '#/definitions/module' }
    }
  },
  definitions: {
    module: {
      type: 'object',
      required: ['id', 'module'],
      properties: {
        id: { anyOf: [{ type: 'integer' }, { type: 'string' }] },
        module: { type: 'string' },
        label: { type: 'string' },
        parameters: { type: 'object' },
        mapper: { type: 'object' },
        metadata: { type: 'object' },
        filter: { type: ['object', 'null'] },
        routes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['flow'],
            properties: {
              filter: { type: ['object', 'null'] },
              flow: { type: 'array', items: { $ref: '#/definitions/module' } }
            },
            additionalProperties: true
          }
        },
        onerror: {
          type: 'array',
          items: { $ref: '#/definitions/module' }
        }
      },
      additionalProperties: true
    }
  },
  additionalProperties: true
};

module.exports = schema;
