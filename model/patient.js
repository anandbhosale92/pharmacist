module.exports = {
  async addPrescription(data) {

    const insertParam = {
      patientEmail         : data.patientEmail,
      doctorEmail          : data.doctorEmail,
      duration             : data.period,
      medicines            : data.medicines,
      status               : data.status,
      insertedOn           : new Date()
    };

    //CHECK FOR USER HAS ALREADY REQUEST OR NOT
    const result = await mongoClient.collection(prescriptionDB).insert(insertParam);

    return await result;
  },

  async getPrescription(data) {
    const query = {patientEmail : data.email};
    const lookUp = {
         from         : 'prescriptions-request',
         localField   : '_id',
         foreignField : 'prescriptionId',
         as           : 'prescriptionRequest'
       };

    const result = await mongoClient.collection(prescriptionDB).aggregate([{$match: query}, {$lookup: lookUp}]).toArray();

    return await result;
  },

  async sendForApproval(data) {
    const insertParam = {
      prescriptionId : objectID(data.prescriptionId),
      email          : data.email,
      status         : 'Pending',
      role           : data.role,
      requestOn      : new Date() 
    };

    //CHECK FOR USER HAS ALREADY REQUEST OR NOT
    const result = await mongoClient.collection(requestDB).insert(insertParam);

    return await result;
  },

  async approveRequest(data) {
    const updateParam = {
      $set : {
        status: data.status
      }
    };

    const query = {_id : objectID(data.requestId)};
    //CHECK FOR USER HAS ALREADY REQUEST OR NOT
    const result = await mongoClient.collection(requestDB).update(query, updateParam);

    return await result;
  },

  //CHECK FOR PRESCIPTION EXISTS FOR PRESCIPTION ID
  async checkPrescriptionExists(data, type = '') {

    let query = {_id : objectID(data.prescriptionId)};
    if(type) {
      query.patientEmail = data.email;
    }
    const result = await mongoClient.collection(prescriptionDB).findOne(query);

    return await result;
  },

  //CHECK FOR DOCTOR/PHARMIST REQUEST FOR PRESCRIPTION EXISTS OR NOT
  async checkPrescriptionRequest(data, type = '') {
    let query = {prescriptionId : objectID(data.prescriptionId), email: data.email};
    if(type) {
      query = {_id: objectID(data.requestId), prescriptionId : objectID(data.prescriptionId)};
    }
    const result = await mongoClient.collection(requestDB).findOne(query);

    return await result;
  }

};