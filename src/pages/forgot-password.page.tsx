import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function ForgotPassword() {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await sendPasswordResetEmail(email);
      setMessage('Instrukce pro reset hesla byly odeslány na váš e-mail.');
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo. Zkuste to prosím znovu.');
    }
  };

  return (
    <div className="forgot-password-page">
      <h1>Zapomenuté heslo</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Odeslat instrukce</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
