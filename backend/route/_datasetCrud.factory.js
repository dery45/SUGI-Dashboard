const express = require('express');
const { authenticate, isGovernment } = require('../middleware/auth');

function createDatasetRoutes(controller) {
  const router = express.Router();

  router.use(authenticate);

  router.get('/', isGovernment, controller.list);
  router.get('/:id', isGovernment, controller.getById);
  router.post('/', isGovernment, controller.create);
  router.put('/:id', isGovernment, controller.update);
  router.delete('/:id', isGovernment, controller.remove);

  return router;
}

module.exports = createDatasetRoutes;