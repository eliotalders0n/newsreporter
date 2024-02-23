import React, { useState } from 'react';
import firebase from "../../firebase";
import { Button, Form } from 'react-bootstrap';

const EmailButton = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendEmail = () => {
    const sendEmailFunction = firebase.functions().httpsCallable('sendEmail');

    // Assuming your Cloud Function expects the file and message
    const emailData = {
      email: 'help@mim.gov.zm',
      attachment: file, // Pass the file to the Cloud Function
      message: message // Pass the message to the Cloud Function
    };

    sendEmailFunction(emailData)
      .then((result) => {
        // Handle success
        console.log('Email sent successfully:', result.data);
      })
      .catch((error) => {
        // Handle errors
        console.error('Error sending email:', error);
      });
  };

  return (
    <div>
      <p>Please kindly reach out to the administrator to request any changes or updates to your details.</p>
      {/* <textarea placeholder="Enter your message" value={message} onChange={handleMessageChange} /> */}
      <Form.Group className="mb-3" controlId="formGridMessage">
        <Form.Label>Message</Form.Label>
        <Form.Control placeholder="Enter your message" value={message} onChange={handleMessageChange}  />
      </Form.Group>
      <Form.Control type="file" onChange={handleFileChange} />
      <br/>
      <Button onClick={sendEmail} disabled={!file || message.trim() === ''}>
        Send Email
      </Button>
    </div>
  );
};

export default EmailButton;
