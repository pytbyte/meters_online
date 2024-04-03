import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, useTheme } from '@mui/material';
import Header from 'components/Header';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {Typography, Grid} from '@mui/material';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import TextsmsIcon from '@mui/icons-material/Textsms';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';



const Customer = () => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    current_reading: ''
  });


  const fetchData = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      console.log('Auth Token:', authToken);
  
      if (!authToken) {
        toast.error('User is not authenticated');
        return; // Stop further execution
      }
      const companyData = JSON.parse(localStorage.getItem('companyData'));
      const companyId = companyData.company_id;
      const response = await axios.get('http://localhost:5000/bill/all_bills', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('API Response:', response.data);
      console.log('Company ID:', companyId);
      const bills = response.data.bills; // Extract bills array
      console.log('Bills:', bills);
      const rows_ = bills.filter(row => parseInt(row.company_id) === parseInt(companyId));
      console.log('Filtered rows:', rows_);
      const rows = rows_.reverse().map((row, index) => ({ ...row, id: index + 1 }));
      console.log('Mapped rows:', rows);
      
      setData(rows);
      
      //toast.success('Staff data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch staff data');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };


  const handleCloseEditDialog = () => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedCustomer(null);
    setIsDeleteDialogOpen(false);
  };

  const handleAddClick = (customer) => {
    setSelectedCustomer(customer);
    setIsAddDialogOpen(true);
    setNewCustomer({
        ...newCustomer,
        meter_id: customer.meter_id // Set the meter_id of the selected row
    });
  };


  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };


  const handleAddCustomer = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      console.log('Auth Token:', authToken);
  
      if (!authToken) {
        toast.error('User is not authenticated');
        return; // Stop further execution
      }
  
      if (!newCustomer.current_reading || !newCustomer.meter_id) {
        toast.error('Please fill in all fields');
        return;
      }
  
      const response = await axios.post('http://localhost:5000/meter/new_reading', newCustomer, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      console.log('Response:', response);
  
      if (response.status === 201) {
        // Fetch the latest data
        fetchData();
        toast.success('Meter_reading saved successfully');
        setIsAddDialogOpen(false); // Close the modal
        setNewCustomer({
          current_reading: '',
          meter_id: '' // Clear the meter_id after adding the reading
        });
      } else {
        console.error('Failed to add reading:', response.data);
        toast.error('Failed to add reading');
      }
    } catch (error) {
      console.error('Error adding reading:', error);
      toast.error('Error adding reading');
      setIsAddDialogOpen(false); // Close the modal on error
    }
  };
  
      

  const handleEditCustomer = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      console.log('Auth Token:', authToken);
  
      if (!authToken) {
        toast.error('User is not authenticated');
        return; // Stop further execution
      }
  
      const companyData = JSON.parse(localStorage.getItem('companyData'));
      const companyId = companyData.company_id;
      
  
      const response = await axios.put('http://localhost:5000/bill/pay/', selectedCustomer, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      if (response.status === 201) {
        //const updatedData = data.map((Customer) => (Customer.customer_id === selectedCustomer.customer_id ? selectedCustomer : Customer));
        // Fetch the latest data
        fetchData()
        //setData(updatedData);
        setIsEditDialogOpen(false);
       
        toast.success('Current Reading  updated successfully');
      } else {
        console.error('Failed to edit Current reading:', response.data);
        toast.error('Failed to edit Current reading');
      }
    } catch (error) {
      console.error('Error editing Current reading:', error);
      toast.error('Error editing Current reading');
    }
  };




  
  const handleDeleteCustomer = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      if (!authToken) {
        toast.error('User is not authenticated');
        return; // Stop further execution
      }
  
      if (!selectedCustomer) {
        toast.error('No Customer member selected');
        return; // Stop further execution
      }
  
      const { customer_id } = selectedCustomer;
  
      const response = await axios.delete(`http://localhost:5000/bill/delete/${customer_id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      if (response.status === 200) {
        const filteredData = data.filter((Customer) => Customer.customer_id !== customer_id);
        setData(filteredData);
        console.log(" filtereddata ",filteredData);
        setIsDeleteDialogOpen(false);
        fetchData()
        toast.success('Customer deleted successfully');
      } else {
        console.error('Failed to delete Customer:', response.data);
        toast.error('Failed to delete Customer');
      }
    } catch (error) {
      console.error('Error deleting Customer:', error);
      toast.error('Error deleting Customer');
    }
  };

    const filteredRows = searchText === '' ? data : data.filter((row) => {
    const contact = String(row.contact); // Convert to string
    const readingDate = String(row.reading_date); // Convert to string
    const ammountBallance = String(row.ballance); // Convert to string
    return contact.includes(searchText) || readingDate.includes(searchText)  || ammountBallance.includes(searchText); });
  
    const companyData = JSON.parse(localStorage.getItem('companyData'));
    const customerData = JSON.parse(localStorage.getItem('customerData'));
    console.log("custome",customerData)
    //const selectedCustomerData = customerData.filter(customer => customer.name === selectedCustomer?.name);
    const filteredData = data.filter((Customer) => Customer.contact === selectedCustomer?.contact);
    const selectedCustomerData = filteredData 

    console.log('Customers:', customerData)
    const editDialog = (
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} fullWidth>
      <DialogContent>
        <Grid container spacing={3} justifyContent="space-between">
        <Grid item>
        <Typography variant="body1">
          <strong>Name:</strong> {selectedCustomerData ? selectedCustomerData.contact : ''}
        </Typography>
        <Typography variant="body1">
          <strong>Contact:</strong> {selectedCustomerData ? selectedCustomerData.contact : ''}
        </Typography>
      </Grid>
      
          <Grid item>
           <Typography variant="body1">
              <strong>{companyData.name || ''}</strong>
            </Typography>
            <Typography variant="body1">
              <strong>Phone Number:</strong> {companyData.phone_number || ''}
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
    
        <TableContainer component={Paper} style={{ marginTop: 20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Units</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Water Consumption</TableCell>
                <TableCell>{selectedCustomer?.units || ''}</TableCell>
                <TableCell>Ksh: {selectedCustomer?.ballance || ''}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
    
        <TextField
          name="paid_ammount"
          label="Paid Amount"
          value={selectedCustomer?.paid_ammount}
          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, paid_ammount: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bill ID"
          value={selectedCustomer?.bill_id || ''}
          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, bill_id: e.target.value })}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseEditDialog}>Cancel</Button>
        <Button color="primary" onClick={handleEditCustomer}>Save</Button>
      </DialogActions>
    </Dialog>
    );

    const createSMSContent = (selectedCustomer, companyData) => {
      if (!selectedCustomer || !companyData) return '';
    
      const customerName = selectedCustomer.name;
      const customerContact = selectedCustomer.contact;
      const companyName = companyData.name;
      const companyPhoneNumber = companyData.phone_number;
      const billDate = new Date().toLocaleDateString();
      const units = selectedCustomer.units || '';
      const amount = selectedCustomer.amount || '';
    
      return <div>
      <br />
      Dear <strong>{customerName}</strong>,<br /><br />
      Your water bill of  <strong>{billDate}</strong> is cleared. Please find the details below:<br />
      <strong>Billing Date:</strong> {billDate}<br />
      <strong>Units:</strong> {units}<br />
      <strong>ammount:</strong> Ksh {amount}<br /><br />
      
      Thank you for your business.
    </div>
    };
    
    const smsContent = createSMSContent(selectedCustomer, companyData);
    
    const deleteDialog = (
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogContent>
          <Typography variant="body1">{smsContent}</Typography>
        </DialogContent>
        <DialogActions>
          
          <Button color="success" >Delivered</Button>
        </DialogActions>
      </Dialog>
    );
    



  

  const addDialog = (
    <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog}>
      <DialogTitle>Add Current Reading</DialogTitle>
      <DialogContent>
        <TextField
          label="meter_id"
          value={newCustomer.meter_id}
          onChange={(e) => setNewCustomer({ ...newCustomer, meter_id: parseInt(e.target.value) || '' })}
          fullWidth
          margin="normal"
          type="number" // Specify the input type as number
          style={{ display: 'none' }}
        />
        <TextField
          label="Current_reading"
          value={newCustomer.current_reading}
          onChange={(e) => setNewCustomer({ ...newCustomer, current_reading: e.target.value })}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseAddDialog}>Cancel</Button>
        <Button color="primary" onClick={handleAddCustomer}>Add Reading</Button>
      </DialogActions>
    </Dialog>
  );
  
  const columns = [
    //{ field: 'bill_id', headerName: 'bill_id', flex: 0.1},
    //{ field: 'contact', headerName: 'contact', flex: 0.5 },
    { field: 'created_at', headerName: 'Date read', flex: 0.5 },
    { field: 'units', headerName: 'units', flex: 0.5 },
    { field: 'amount', headerName: 'amount', flex: 0.5 },
    { field: 'ballance', headerName: 'ballance', flex: 0.5 },
    { field: 'status', headerName: 'status', flex: 0.5 },
    { field: 'paid_on', headerName: 'date paid', flex: 0.5 },
    {
      
      field: 'actions',
      headerName: '',
      flex: 0.5,
      renderCell: (params) => (
        <>
          {params.row.status !== 'Cleared.' && (
            <>
              <IconButton onClick={() => handleEditClick(params.row)}>
                <AddCircleIcon />
              </IconButton>
              <IconButton onClick={() => handleAddClick(params.row)}>
                <TextsmsIcon />
              </IconButton>
            </>
          )}
          {params.row.status === 'Cleared.' && (
            <IconButton onClick={() => handleDeleteClick(params.row)}>
              <MarkEmailReadIcon />
            </IconButton>
          )}
        </>
      ),
      
      
      
    },
  ];

  const rows = data.map((row, index) => ({ id: index + 1, ...row }));
  const displayedRows = searchText === '' ? rows : filteredRows;

  return (<Box m="1.5rem 2.5rem">
  <Header title="Billing and Invoicing " />
  <TextField
    label="Search by Phone or  ballance"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    fullWidth
    margin="normal"
  />

  {editDialog}
  {deleteDialog}
  {addDialog}
  <Box
    mt="20px"
    sx={{
      '& .MuiDataGrid-root': {
        border: 'none',
      },
      '& .MuiDataGrid-cell': {
        borderBottom: 'none',
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: theme.palette.background.alt,
        color: theme.palette.secondary[100],
        borderBottom: 'none',
      },
      '& .MuiDataGrid-virtualScroller': {
        backgroundColor: theme.palette.primary.light,
      },
      '& .MuiDataGrid-footerContainer': {
        backgroundColor: theme.palette.background.alt,
        color: theme.palette.secondary[100],
        borderTop: 'none',
      },
      '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
        color: `${theme.palette.secondary[200]} !important`,
      },
    }}
  >
    <DataGrid
      loading={isLoading || !data}
      getRowId={(row) => row.id}
      rows={displayedRows}
      columns={columns}
      pageSize={5}
      autoHeight
    />
  </Box>
  <ToastContainer />
  </Box>

  );

};

export default Customer;

