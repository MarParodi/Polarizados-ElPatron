const router = require('express').Router();
const CitaController = require('../controllers/citaController');

router.route('/Cita')
    .post(CitaController.crearCita) // to create new subordinate resources
    .get(CitaController.get)
    .patch(CitaController.editDate)




module.exports = router;