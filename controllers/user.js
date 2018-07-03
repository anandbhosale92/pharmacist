const user           = require('../model/user');
const commonFunction = require('../handlers/common');
const sendResp       = require('../handlers/sendResponse');

const response = {};
module.exports = {
  async register(req, res, next) {
    response.res = res;
    //VALIDATION PART
    let data = req.body;
    const requiredParam = ['name', 'email', 'password', 'confirmPass', 'mobile', 'role', 'gender'];

    if (!commonFunction.checkEmptyValue(data, requiredParam)) {
      response.type = 'E';
      response.code = 1;

      sendResp.sendResponse(response);
      return;
    }

    if(data.password !== data.confirmPass) {
      response.type = 'E';
      response.code = 2;

      sendResp.sendResponse(response);
      return;
    }

    //CHECK FOR USER ALREADY EXSITS OR NOT
    const isExists = await user.checkUser(data);
    if(isExists) {
      response.type = 'E';
      response.code = 3;

      sendResp.sendResponse(response);
      return;
    }

    //ALL SET CREATE USER
    try {
      const resp = await user.createUser(data);
      const resTxt    = { msg: "User created successfully", userId: resp.insertedIds[0] };
      response.type   = 'S';
      response.result = resTxt;
      //ALL FINE RETURN RESULT
      sendResp.sendResponse(response);
      return;
    }
    catch (e) {
      response.type = 'E';
      response.code = 4;
      if (typeof e === 'number') {
        response.code = e;
      }

      sendResp.sendResponse(response);
      return;
    };
  },
  async getDocterList(req, res, next) {
    response.res = res;
    //VALIDATION PART
    let data = req.body;
    const requiredParam = ['email'];

    if (!commonFunction.checkEmptyValue(data, requiredParam)) {
      response.type = 'E';
      response.code = 5;

      sendResp.sendResponse(response);
      return;
    }

    //PERSON WHO IS REQUESTING IS ONLY A PATIENT
    //FURTHER FUNCTION TO GET LIST OF DOCTOR WHITH THIER SPECILIZATION
  }
};
