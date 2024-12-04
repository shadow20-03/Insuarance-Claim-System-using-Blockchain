// models/ClaimSubmit.js
const mongoose = require('mongoose');

const ClaimSubmitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  policyNumber: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  ipfsLink: {
    type: String,
    required: true,
  },
  supportingDocumentIpfsLink:{
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ClaimSubmit', ClaimSubmitSchema);