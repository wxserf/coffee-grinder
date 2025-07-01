# Structured Logger

`src/utils/logger.js` provides simple JSON logging helpers with four levels: `debug`, `info`, `warn`, and `error`.
Each call writes a single line to `stdout` with a timestamp and any metadata you pass.

Example:

```js
const logger = require('./src/utils/logger');
logger.info('starting', { module: 'worker' });
```

The output is newline-delimited JSON suitable for log aggregation tools.
