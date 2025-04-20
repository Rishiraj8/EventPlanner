import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import { AuthProvider } from './context/AuthContext';
import store from './redux/store';
import { Provider } from 'react-redux';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <AuthProvider>
  //   <App />
  // </AuthProvider>
  <Provider store={store}>
  <App />
</Provider>
);



