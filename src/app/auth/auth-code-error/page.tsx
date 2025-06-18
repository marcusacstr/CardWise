import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div>
      <h1>Authentication Error</h1>
      <p>There was an issue with the authentication process. Please try again.</p>
      {/* Optionally add a link back to the login page */}
      <p><Link href="/">Go to Login</Link></p>
    </div>
  );
} 