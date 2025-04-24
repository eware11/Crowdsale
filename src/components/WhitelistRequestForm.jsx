import React, { useState } from 'react';
import { Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';

function WhitelistRequest({ crowdsale }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [proposal, setProposal] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleWhitelistRequest = async () => {
    if (!name || !email || !proposal) {
      setError('All fields are required!');
      return;
    }
    
    try {
      setIsPending(true);
      setError('');
      setSuccessMessage('');
      
      // Call the smart contract function to submit the whitelist request
      await crowdsale.requestWhitelist(proposal);
      
      setIsPending(false);
      setSuccessMessage('Your request has been submitted successfully!');
      // Optionally, reset the form fields after submission
      setName('');
      setEmail('');
      setProposal('');
    } catch (err) {
      setError('Failed to submit request. Please try again.');
      setIsPending(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col lg={6} md={8} sm={12}>
          <div className="card p-4 shadow-lg rounded">
            <h3 className="text-center mb-4">Request to Join the Whitelist</h3>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form>
              {/* Name Field */}
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>Your Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
              
              {/* Email Field */}
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Your Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              {/* Proposal Field */}
              <Form.Group controlId="formProposal" className="mb-3">
                <Form.Label>Why do you want to join the whitelist?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Share your reasons for wanting to join our ecosystem"
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  required
                />
              </Form.Group>
              
              {/* Submit Button */}
              <div className="d-flex justify-content-center">
                <Button 
                  variant="primary" 
                  onClick={handleWhitelistRequest} 
                  disabled={isPending}
                  className="w-100"
                >
                  {isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default WhitelistRequest;
