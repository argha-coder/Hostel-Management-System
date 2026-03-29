import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const OTPInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' }}>
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          value={data}
          ref={(ref) => inputRefs.current[index] = ref}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="input-outline"
          style={{ width: '45px', height: '55px', fontSize: '20px', textAlign: 'center', padding: '0' }}
        />
      ))}
    </div>
  );
};

export default OTPInput;
