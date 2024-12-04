import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClaimRequests() {
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [selectedPolicyNumber, setSelectedPolicyNumber] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const fetchClaims = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/claim-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClaims(response.data.claims);
      } catch (error) {
        setError('Error fetching claims. Please try again later.');
        console.error(error);
      }
    };
    fetchClaims();
  }, []);

  const handleCheckboxChange = (claimId, policyNumber) => {
    setSelectedClaimId(selectedClaimId === claimId ? null : claimId);
    setSelectedPolicyNumber(selectedClaimId === claimId ? null : policyNumber);
    setShowConfirmation(false);
  };

  const handleValidateClick = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/update-claim-status`,
        { policyNumber: selectedPolicyNumber, ClaimStatus: "Approved" },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert("Claim status updated to Approved.");
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error updating claim status:", error);
      alert("Failed to update claim status. Please try again.");
    }
  };

  const handleRejectClick= async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/update-claim-status_reject`,
        { policyNumber: selectedPolicyNumber, ClaimStatus: "Rejected" },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert("Claim status updated to Rejected.");
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error updating claim status:", error);
      alert("Failed to update claim status. Please try again.");
    }
  };

  const handleProceedToPayment = () => {
    setShowPaymentConfirmation(true);
  };

  const handleYesClick = () => {
    setShowPaymentConfirmation(false);
    const options = {
      key: 'rzp_test_FE1fP2uk3SE1nb',
      amount: 1000 * 100,
      currency: 'INR',
      name: 'SafeChain Insurance',
      description: 'Insurance Claim Payment',
      handler: function (response) {
        alert("Payment successful! ID: " + response.razorpay_payment_id);
      },
      theme: { color: "#3399cc" }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div>
      <h2>Claim Requests</h2>
      {error && <p>{error}</p>}
      {claims.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Policy Holder Name</th>
              <th>Policy Number</th>
              <th>Claim Data (IPFS Link)</th>
              <th>Supporting Documents</th>
              {selectedClaimId && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedClaimId === claim._id}
                    onChange={() => handleCheckboxChange(claim._id, claim.policyNumber)}
                  />
                </td>
                <td>{claim.name}</td>
                <td>{claim.policyNumber}</td>
                <td>
                  <a href={claim.ipfsLink} target="_blank" rel="noopener noreferrer">
                    View Claim Data
                  </a>
                </td>
                <td>
                  <a href={claim.supportingDocumentIpfsLink} target="_blank" rel="noopener noreferrer">
                    View Supporting Documents
                  </a>
                </td>
                {selectedClaimId === claim._id && (
                  <td>
                    <button className="validate-button" onClick={handleValidateClick}>
                      Approve
                    </button>
                    <button className="validate-button" onClick={handleRejectClick}>
                      Reject
                    </button>
                    {showConfirmation && (
                      <div>
                        <p>Do you want to proceed to payment?</p>
                        <button onClick={handleProceedToPayment}>Yes</button>
                        <button onClick={() => setShowConfirmation(false)}>No</button>
                      </div>
                    )}
                    {showPaymentConfirmation && (
                      <div>
                        <p>Proceeding to payment gateway...</p>
                        <button onClick={handleYesClick}>Continue to Payment</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No claims found.</p>
      )}
    </div>
  );
}

export default ClaimRequests;