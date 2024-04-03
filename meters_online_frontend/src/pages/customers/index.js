import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, useTheme } from '@mui/material';
import Header from 'components/Header';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

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
    name: '',
    contact: ''
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
      const response = await axios.get('http://localhost:5000/customer/all_customers');
      console.log('customer_data : ', response.data);
      console.log('company_id : ', companyId);
      const rows_ = response.data.filter(row => row.company_id === String(companyId));
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

  const handleAddClick = () => {
    setIsAddDialogOpen(true);
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
  
      if (!newCustomer.name || !newCustomer.contact ) {
        toast.error('Please fill in all fields');
        return;
      }
      
      
      const response = await axios.post('http://localhost:5000/customer/register', newCustomer, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      console.log('Response:', response);
  
      if (response.status === 200) {
        setData([...data, response.data]);
        setIsAddDialogOpen(false); // Close the modal
        setNewCustomer({
          name: '',
          conctact: ''
        });
        // Fetch the latest data
        fetchData()
        toast.success('Customer added successfully');
      } else {
        console.error('Failed to add Customer:', response.data);
        toast.error('Failed to add Customer');
      }
    } catch (error) {
      console.error('Error adding Customer:', error);
      toast.error('Error adding Customer');
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
      
  
      const response = await axios.put('http://localhost:5000/customer/update/', selectedCustomer, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      if (response.status === 200) {
        const updatedData = data.map((Customer) => (Customer.customer_id === selectedCustomer.customer_id ? selectedCustomer : Customer));
        
        setData(updatedData);
        setIsEditDialogOpen(false);
        // Fetch the latest data
        fetchData()
        toast.success('Customer updated successfully');
      } else {
        console.error('Failed to edit Customer:', response.data);
        toast.error('Failed to edit Customer');
      }
    } catch (error) {
      console.error('Error editing Customer:', error);
      toast.error('Error editing Customer');
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
  
      const response = await axios.delete(`http://localhost:5000/customer/delete/${customer_id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      if (response.status === 200) {
        const filteredData = data.filter((Customer) => Customer.customer_id !== customer_id);
        setData(filteredData);
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
  
  const filteredRows = searchText === ''
    ? data || []
    : (data || []).filter((row) => row.contact.includes(searchText));

  const editDialog = (
    <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
      <DialogTitle>Edit Customer</DialogTitle>
      <DialogContent>
        <TextField
          label="name"
          value={selectedCustomer?.name || ''}
          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="contact"
          value={selectedCustomer?.contact || ''}
          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, contact: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="customer_id"
          value={selectedCustomer?.customer_id || ''}
          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customer_id: e.target.value })}
          fullWidth
          margin="normal"
          disabled
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseEditDialog}>Cancel</Button>
        <Button color="primary" onClick={handleEditCustomer}>Save</Button>
      </DialogActions>
    </Dialog>
  );

  const deleteDialog = (
    <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
      <DialogTitle>Delete Customer</DialogTitle>
      <DialogContent>
        Are you sure you want to delete {selectedCustomer?.name}?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
        <Button color="error" onClick={handleDeleteCustomer}>Delete</Button>
      </DialogActions>
    </Dialog>
  );







  const addDialog = (
    <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog}>
      <DialogTitle>Add New Customer</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Contact"
          value={newCustomer.contact}
          onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
          fullWidth
          margin="normal"
        />
        
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseAddDialog}>Cancel</Button>
        <Button color="primary" onClick={handleAddCustomer}>Add Customer</Button>
      </DialogActions>
    </Dialog>
  );
  
  const columns = [
    { field: 'name', headerName: 'name', flex: 1 },
    { field: 'contact', headerName: 'contact', flex: 1 },
    { field: 'meter_id', headerName: 'meter_id', flex: 1 },
    { field: 'status', headerName: 'status', flex: 1 },
    { field: 'created_at', headerName: 'created_at', flex: 1 },
    {
      field: 'actions',
      headerName: '',
      flex: 0.5,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEditClick(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(params.row)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const rows = data.map((row, index) => ({ id: index + 1, ...row }));
  const displayedRows = searchText === '' ? rows : filteredRows;

return (
  <Box m="1.5rem 2.5rem">
    <Header title="Customer" />
    <TextField
      label="Search by Phone Number"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      fullWidth
      margin="normal"
    />
    <Button
      variant="contained"
      color="primary"
      onClick={handleAddClick}
      style={{ marginTop: '1rem', color: 'white' }}
    >
      Add Customer
    </Button>
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
        pageSize={4}
        autoHeight
      />
    </Box>
    <ToastContainer />
  </Box>
);

};

export default Customer;

