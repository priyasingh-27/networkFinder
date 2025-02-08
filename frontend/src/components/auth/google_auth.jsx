import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;


function Login() {
  return (
    <GoogleOAuthProvider clientId= {google_client_id}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse);
          // Send the credential to your backend for verification
          fetch('/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: credentialResponse.credential }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              // Save user data (e.g., email) in the frontend state
            });
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </GoogleOAuthProvider>
  );
}

export default Login;