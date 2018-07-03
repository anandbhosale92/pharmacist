
const errMsg = [];

errMsg[1] = 'Required field not passed';
errMsg[2] = 'Invalid input passed.';
errMsg[3] = 'User is already created with same email.';
errMsg[4] = 'Unable to process request. Please try again later.';
errMsg[5] = 'Required field not passed';
errMsg[6] = 'No such user found aginst particular Id.';
errMsg[7] = 'Unable to process request. Please try again later.';
errMsg[8] = 'Required field not passed.';
errMsg[9] = 'No such user found aginst particular Id.';
errMsg[10] = 'Unable to process request. Please try again later.';
errMsg[11] = 'Required field not passed';
errMsg[12] = 'No such user found aginst particular Id.';
errMsg[13] = 'No such prescription found aginst particular Id.';
errMsg[14] = 'Unable to process request. Please try again later';
errMsg[15] = 'Required field not passed';
errMsg[16] = 'No such user found aginst particular Id.';
errMsg[17] = 'Unauthorised to process following request.';
errMsg[18] = 'No such request found against following prescription.';
errMsg[19] = 'Unable to process request. Please try again later';


module.exports = {
  sendResponse(data) {

    //ERROR REQUEST
    if (data.type === 'E') {
      data.res.status(400).json({ msg: errMsg[data.code], code : data.code });
      return;
    }

    data.res.status(200).json(data.result);
    return;
  }
};
