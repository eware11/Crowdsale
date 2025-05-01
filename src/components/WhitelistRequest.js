import { useState } from 'react';

function WhitelistRequest({ handleWhitelistRequest }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleWhitelistRequest(message);
  };

  return (
    <div className="whitelist-request">
      <h3>Request Whitelist</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us why you want to be whitelisted"
          required
        />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default WhitelistRequest;
