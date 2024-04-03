import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, TextField, Tab, Tabs } from '@mui/material';
import Header from 'components/Header';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BusinessIcon from '@mui/icons-material/Business';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const Company = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyData, setCompanyData] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLoginSuccess = (data) => {
    setIsLoggedIn(true);
    localStorage.setItem('jwtToken', data.access_token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('companyData', JSON.stringify(data.company_data));
    setCompanyData(data.company_data);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('companyData');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('companyData');
    setIsLoggedIn(false);
    setCompanyData(null);
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      setIsLoggedIn(true);
      setCompanyData(JSON.parse(localStorage.getItem('companyData')));
     

    }

  }, []);

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="" />
      {isLoggedIn && companyData ? (
        <Dashboard companyData={companyData} onLogout={handleLogout} />
      ) : (
        <>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          {tabValue === 0 && (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          )}
          {tabValue === 1 && (
            <RegisterForm />
          )}
        </>
      )}
      <ToastContainer />
    </Box>
  );
};

const Dashboard = ({ onLogout, companyData }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current);

    L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    const createLocationMarker = (latitude, longitude) => {
      L.marker([latitude, longitude]).addTo(map)
        .bindPopup('Your current location')
        .openPopup();
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          createLocationMarker(latitude, longitude);
          map.setView([latitude, longitude], 17);
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
    {/* Logout Button */}
    <Button onClick={onLogout} style={{ marginBottom: '1rem' }}>Logout</Button>

    {/* Grid container for the cards */}
    <Grid container spacing={3}>
      {/* Column 1: Company Data with Icon */}
      <Grid item xs={16} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Company Data</Typography>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon color="primary" fontSize="large" style={{ marginRight: '4rem', fontSize: '3rem' }} />
              {companyData && (
                <div>
                  <Typography variant="body2" style={{ marginLeft: '-0.5rem' }}><strong>{companyData.name}</strong></Typography>
                  <Typography variant="body2" style={{ marginLeft: '-0.5rem' }}><strong>{companyData.phone_number}</strong></Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Column 2: Supply Overview */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
          <Typography variant="h6" gutterBottom>Company Data</Typography>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon color="primary" fontSize="large" style={{ marginRight: '4rem', fontSize: '3rem' }} />
            {companyData && (
              <div>
                <Typography variant="body2" style={{ marginLeft: '-0.5rem' }}><strong>{companyData.name}</strong></Typography>
                <Typography variant="body2" style={{ marginLeft: '-0.5rem' }}><strong>{companyData.phone_number}</strong></Typography>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Column 3: Financial Overview */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
          <Typography variant="h6" gutterBottom>Company Data</Typography>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon color="primary" fontSize="large" style={{ marginRight: '4rem', fontSize: '3rem' }} />
            {companyData && (
              <div>
                <Typography variant="body2" style={{ marginLeft: '-0.5rem' }}><strong>{companyData.name}</strong></Typography>
                <Typography variant="body2" style={{ marginLeft: '-0.5rem' }}><strong>{companyData.phone_number}</strong></Typography>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Leaflet Map */}
    <div style={{ height: '330px', marginTop: '1rem' }} ref={mapRef}></div>
  </div>
  );
};

const LoginForm = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({
    phone_number: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', loginData);
      if (response.status === 200) {
        toast.success('Login successful');
        localStorage.setItem('isLoggedIn', 'true');
        const { token } = response.data;
        localStorage.setItem('jwtToken', token);
        onLoginSuccess(response.data);
      } else {
        console.error('Login failed:', response.data.message);
        toast.error(`Login failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Error during login. Please try again later.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Login</Typography>
        <TextField
          name="phone_number"
          label="Phone Number"
          value={loginData.phone_number}
          onChange={(e) => setLoginData({ ...loginData, phone_number: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>Login</Button>
      </CardContent>
    </Card>
  );
};

const RegisterForm = () => {
  const [registerData, setRegisterData] = useState({
    name: '',
    phone_number: '',
    password: '',
    registered_by: '',
  });

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/company/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Registration successful');
      } else {
        console.error('Registration failed:', data.message);
        toast.error(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('Error during registration. Please try again later.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Register</Typography>
        <TextField
          name="name"
          label="Company Name"
          value={registerData.name}
          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          name="phone_number"
          label="Phone Number"
          value={registerData.phone_number}
          onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={registerData.password}
          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          name="registered_by"
          label="Registered By"
          value={registerData.registered_by}
          onChange={(e) => setRegisterData({ ...registerData, registered_by: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleRegister}>Register</Button>
      </CardContent>
    </Card>
  );
};

export default Company;
