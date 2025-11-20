import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Amplify } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_eV1NeyZ55',
      userPoolClientId: '5hhvaf1kctcm63im4fvlhvuchj',
    }
  }
});

function Root() {
  return <App />
}

const AppWithAuth = withAuthenticator(Root)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithAuth />
  </React.StrictMode>
)