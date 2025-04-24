import React, { useState } from 'react';
import WhitelistRequestForm from './WhitelistRequestForm';  // Import the form

const WhitelistRequest = () => {
  const [requests, setRequests] = useState([]);

  const submitRequest = (data) => {
    // Here, you could store the data in the state, backend, or smart contract
    setRequests([...requests, { ...data, status: 'Pending' }]); // Add a status field
    console.log('New Whitelist Request:', data); // Log to check if it's working
  };

  const handleApproval = (index) => {
    const updatedRequests = [...requests];
    updatedRequests[index].status = 'Approved';
    setRequests(updatedRequests);
    console.log('Request approved:', updatedRequests[index]);
  };

  const handleRejection = (index) => {
    const updatedRequests = [...requests];
    updatedRequests[index].status = 'Rejected';
    setRequests(updatedRequests);
    console.log('Request rejected:', updatedRequests[index]);
  };

  return (
    <div>
      <WhitelistRequestForm submitRequest={submitRequest} />
      
      {/* Optionally, display requests */}
      <div>
        <h4>Pending Whitelist Requests:</h4>
        <ul>
          {requests.map((request, index) => (
            <li key={index}>
              <p><strong>Name:</strong> {request.name}</p>
              <p><strong>Email:</strong> {request.email}</p>
              <p><strong>Proposal:</strong> {request.proposal}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <div>
                {/* Approval and Rejection Buttons */}
                <button onClick={() => handleApproval(index)} disabled={request.status !== 'Pending'}>
                  Approve
                </button>
                <button onClick={() => handleRejection(index)} disabled={request.status !== 'Pending'}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WhitelistRequest;
