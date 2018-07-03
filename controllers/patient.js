const user           = require('../model/user');
const patient        = require('../model/patient');
const commonFunction = require('../handlers/common');
const sendResp       = require('../handlers/sendResponse');
const moment 				 = require('moment'); 

const response = {};
module.exports = {
  async createPrescription(req, res, next) {
    response.res = res;
    //VALIDATION PART
    let data = req.body;
    const requiredParam = ['patientEmail', 'doctorEmail', 'isApprovedByDoctor', 'period', 'medicines' ];

    if (!commonFunction.checkEmptyValue(data, requiredParam)) {
      response.type = 'E';
      response.code = 5;

      sendResp.sendResponse(response);
      return;
    }


    if(data.medicines.length <= 0) {
    	response.type = 'E';
      response.code = 5;

      sendResp.sendResponse(response);
      return;
    }

    //CHECK FOR USER ALREADY EXSITS OR NOT
    //ADD PATIENT TYPE FOR VALIDATING USER
    data.role  = ['PATIENT'];
    data.email = data.patientEmail;
    const isExists = await user.checkUser(data);
    if(!isExists) {
      response.type = 'E';
      response.code = 6;

      sendResp.sendResponse(response);
      return;
    }

    //FURTHER WE CAN CHECK FOR THE PRESCIPTION IS VALID OR NOT 
    //BY CHECKING ITS PERIOD
    data.status = 'Y'; //CURRENTLY SET TO Y CAN BE CHANGED BASED ON THE PERIOD

    //ALL SET ADD NEW PRESCRIPTION
    try {
      const resp = await patient.addPrescription(data);
      const resTxt    = { msg: "Prescription added successfully", id: resp.insertedIds[0] };
      response.type   = 'S';
      response.result = resTxt;
      //ALL FINE RETURN RESULT
      sendResp.sendResponse(response);
      return;
    }
    catch (e) {
      response.type = 'E';
      response.code = 7;
      if (typeof e === 'number') {
        response.code = e;
      }

      sendResp.sendResponse(response);
      return;
    };
  },

  async getPrescriptions(req, res, next) {
    response.res = res;
    //VALIDATION PART
    let data = req.body;
    const requiredParam = ['email'];

    if (!commonFunction.checkEmptyValue(data, requiredParam)) {
      response.type = 'E';
      response.code = 8;

      sendResp.sendResponse(response);
      return;
    }

    //ADD PATIENT TYPE FOR VALIDATING USER
    data.role = ['PATIENT'];
    const isExists = await user.checkUser(data);
    if(!isExists) {
      response.type = 'E';
      response.code = 9;

      sendResp.sendResponse(response);
      return;
    }

    //ALL SET GET PATIENT PRESCRIPTION
    try {
      let resp = await patient.getPrescription(data);
      //LOOP THROUGH RESPONSE FOR FORMATTING RESPONSE
      resp = formatGetPrescriptionResponse(resp);

      response.type   = 'S';
      response.result = resp;
      //ALL FINE RETURN RESULT
      sendResp.sendResponse(response);
      return;
    }
    catch (e) {
      response.type = 'E';
      response.code = 10;
      if (typeof e === 'number') {
        response.code = e;
      }

      sendResp.sendResponse(response);
      return;
    };
  },

  async requestForPermission(req, res, next) {
    response.res = res;
    //VALIDATION PART
    let data = req.body;
    const requiredParam = ['prescriptionId', 'email'];

    if (!commonFunction.checkEmptyValue(data, requiredParam)) {
      response.type = 'E';
      response.code = 11;

      sendResp.sendResponse(response);
      return;
    }

    //ADD DOCTOR TYPE FOR VALIDATING USER
    data.role = ['DOCTOR','PHARMIST'];
    const isExists = await user.checkUser(data);
    if(!isExists) {
      response.type = 'E';
      response.code = 12;

      sendResp.sendResponse(response);
      return;
    }

    data.role = isExists.role;
    //CHECK FOR PRESCRIPTION EXISTS 
    const prescriptionExists = await patient.checkPrescriptionExists(data);
    if(!prescriptionExists) {
    	//NO PRESCRIPTION FOUND AGAINST PRESCRIPTIONID
    	response.type = 'E';
      response.code = 13;

      sendResp.sendResponse(response);
      return;
    }

    //CHECK FOR DOCTOR/PHARMIST HAS ALREADY REQUESTED FOR SAME PRESCRIPTION 
    //IF YES THEN RETURN WITH THE STATUS OF REQUEST
    const checkRequest = await patient.checkPrescriptionRequest(data);
    if(checkRequest) {
    	//REQUEST EXISTS FOR PARTICULAR PRESCRIPTION
    	const resTxt    = { msg: "Your request for permission already exists and currently its status is :" + checkRequest.status};
      response.type   = 'S';
      response.result = resTxt;
      //ALL FINE RETURN RESULT
      sendResp.sendResponse(response);
      return;

    }

    //ALL SET SEND REQUEST FOR APPROVAL
    try {
      const resp = await patient.sendForApproval(data);
      const resTxt    = { msg: "Prescription request submitted successfully", id: resp.insertedIds[0] };
      response.type   = 'S';
      response.result = resTxt;
      //ALL FINE RETURN RESULT
      sendResp.sendResponse(response);
      return;
    }
    catch (e) {
    	console.log(e);
      response.type = 'E';
      response.code = 14;
      if (typeof e === 'number') {
        response.code = e;
      }

      sendResp.sendResponse(response);
      return;
    };
  },

  async approveRequest(req, res, next) {
  	response.res = res;
    //VALIDATION PART
    let data = req.body;
    const requiredParam = ['requestId', 'email', 'prescriptionId', 'status'];

    if (!commonFunction.checkEmptyValue(data, requiredParam)) {
      response.type = 'E';
      response.code = 15;

      sendResp.sendResponse(response);
      return;
    }

    //CHECK FOR USER ALREADY EXSITS OR NOT
    //ADD PATIENT TYPE FOR VALIDATING USER
    data.role  = 'Patient';
    const isExists = await user.checkUser(data);
    if(!isExists) {
      response.type = 'E';
      response.code = 16;

      sendResp.sendResponse(response);
      return;
    }

    //CHECK FOR PATIENT HAS FOLLOWING PRESCRIPTION OR NOT
    const checkPrescriptionExists = await patient.checkPrescriptionExists(data, 'AR');
    if(!checkPrescriptionExists) {
    	response.type = 'E';
      response.code = 17;

      sendResp.sendResponse(response);
      return;
    }

    //CHECK FOR REQUEST EXSITS AGAINST FOLLOWING PRESCRIPTION
    const checkPrescriptionRequest = await patient.checkPrescriptionRequest(data, 'AR');
    if(!checkPrescriptionRequest) {
    	response.type = 'E';
      response.code = 18;

      sendResp.sendResponse(response);
      return;
    }

    //ALL SET VALIDATION PASSED NOW MOVE FURTHER
    try {
      const resp = await patient.approveRequest(data);
      const resTxt    = { msg: "request updated successfully"};
      response.type   = 'S';
      response.result = resTxt;
      //ALL FINE RETURN RESULT
      sendResp.sendResponse(response);
      return;
    }
    catch (e) {
      response.type = 'E';
      response.code = 19;
      if (typeof e === 'number') {
        response.code = e;
      }

      sendResp.sendResponse(response);
      return;
    };
  }
};


function formatGetPrescriptionResponse(response) {
	for(let i = 0; i < response.length; i++) {
		response[i].prescriptionId = response[i]._id;
		delete response[i]._id;

		//LOOP THROUGH PRESCRIPTION REQUEST
		if(response[i].prescriptionRequest.length > 0) {
			for(let j = 0; j < response[i].prescriptionRequest.length; j++) {
				response[i].prescriptionRequest[j].requestId = response[i].prescriptionRequest[j]._id;
				delete response[i].prescriptionRequest[j]._id; 
			}
		}
		
		return response;
	}
}