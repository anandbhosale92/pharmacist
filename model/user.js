var bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
  async checkUser(data) {
    const checkQuery =  { $or: [{email: data.email}, {_id : objectID(data.userId) }]  };

    if (data.role && Array.isArray(data.role)) {
      checkQuery['$or'][0].role = {$in: data.role};
    }
    else {
      checkQuery['$or'][0].role = data.role.toUpperCase();
    }

    const response = await mongoClient.collection(userDB).findOne(checkQuery);

    return await response;
  },

  async createUser(data) {

    const insertParam = {
      email    : data.email,
      mobile   : data.mobile,
      name     : data.name,
      password : await bcrypt.hash(data.password, saltRounds),
      role     : data.role.toUpperCase(),
      gender   : data.gender,
      createdOn: new Date()
    };

    let resp = await mongoClient.collection(userDB).insert(insertParam);

    return await resp;
  }
};

