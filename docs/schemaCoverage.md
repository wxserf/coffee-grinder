# Schema Coverage

The `makeBlueprintSchema.js` file captures the core parts of a Make blueprint. It defines objects for modules, routes, connections and variables. The schema aims to cover the following sections of the Make JSON format:

- Scenario metadata including execution flags
- Connection and variable definitions
- Module layout with routes and error handlers

Only commonly used fields are described. Custom metadata and uncommon properties are allowed by the schema using `additionalProperties: true`.
