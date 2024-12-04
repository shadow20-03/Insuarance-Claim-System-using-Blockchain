import React, { useState } from 'react';
import axios from 'axios';
import './kyc.css';
import { useNavigate, useParams } from 'react-router-dom';

let insuranceCompanyValue = '';

const KYCPage = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [insurancePolicyid, setInsurancePolicyid] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const { insuranceType } = useParams();
  const navigate = useNavigate();

  insuranceCompanyValue = insuranceCompany;

  const handleVerifyClick = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/verify-user',
        {
          name,
          phoneNumber,
          insuranceCompany,
          insurancePolicyid,
          insuranceType
        }
      );
      if (response.data.success) {
        
        setVerificationMessage(
          `${
            insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)
          } insurance in ${insuranceCompany} for Mr. ${name} exists.`
        );
      } else {
        setVerificationMessage("No such policy found.");
      }
    } catch (error) {
      console.error("Error verifying data:", error);
      setVerificationMessage("Error verifying data. Please try again later.");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();



    if (verificationMessage.includes("exists")) {
      navigate(`/claim/${insuranceType.toLowerCase()}`);
    }
  };

  return (
    <div className="kyc-page">
      <h2>Database Verification</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Insurance Company:</label>
          <input
            type="text"
            value={insuranceCompany}
            onChange={(e) => setInsuranceCompany(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Insurance Policy ID:</label>
          <input
            type="text"
            value={insurancePolicyid}
            onChange={(e) => setInsurancePolicyid(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
          <button type="button" onClick={handleVerifyClick}>
            Verify
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
      {verificationMessage && <p>{verificationMessage}</p>}
    </div>
  );
};

export const getInsuranceCompanyValue = () => insuranceCompanyValue;

export default KYCPage;
