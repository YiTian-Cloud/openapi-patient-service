// index.js - local dev entry
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Patient Service API running on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/docs`);
  });
}

module.exports = app;
