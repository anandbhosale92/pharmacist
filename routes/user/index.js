const router  = require('express').Router();
const user    = require('../../controllers/user');
const patient = require('../../controllers/patient');

/**
 USER LOGIN, CREATE USER ROUTE NEED TO ADDED
*/
router.post('/prescription/create', patient.createPrescription);
router.post('/prescription/get', patient.getPrescriptions);
router.post('/prescription/request', patient.requestForPermission);
router.post('/prescription/approve', patient.approveRequest);
router.post('/register', user.register);

module.exports = router;
