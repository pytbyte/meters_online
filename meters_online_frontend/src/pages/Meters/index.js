import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, useTheme } from '@mui/material';
import Header from 'components/Header';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import AddCircleIcon from '@mui/icons-material/AddCircle';


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
      const response = await axios.get('http://localhost:5000/meter/meter_readings', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('reading_data : ', response.data);
      console.log('reading_id : ', companyId);
      const rows_ = response.data.filter(row => row.company_id === (companyId));
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
      
  
      const response = await axios.put('http://localhost:5000/meter/update/', selectedCustomer, {
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
  
      const response = await axios.delete(`http://localhost:5000/meter/delete/${customer_id}`, {
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
  const filteredRows = searchText === '' ? data : data.filter((row) => {
    const contact = String(row.contact); // Convert to string
    const readingDate = String(row.reading_date); // Convert to string
    return contact.includes(searchText) || readingDate.includes(searchText);
  });
  
  const editDialog = (
    <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
      <DialogTitle>Edit Current Reading</DialogTitle>
      <DialogContent>
        
        <TextField
          label="current_reading"
          value={selectedCustomer?.current_reading || ''}
          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, current_reading: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="reading_id"
          value={selectedCustomer?.reading_id || ''}
          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, reading_id: e.target.value })}
          fullWidth
          margin="normal"
          style={{ display: 'none' }}
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
    { field: 'meter_id', headerName: 'Meter No', flex: 0.4 },
    { field: 'name', headerName: 'Customer', flex: 0.7 },
    { field: 'contact', headerName: 'Contact', flex: 0.5 },
    { field: 'previous_reading', headerName: 'Previous Reading', flex: 0.5 },
    { field: 'reading_date', headerName: 'Previous Reading Date', flex: 0.5 },
    { field: 'current_reading', headerName: 'Current Readings', flex: 0.5 },
    {
      field: 'actions',
      headerName: '',
      flex: 0.5,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEditClick(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleAddClick(params.row)}>
            <AddCircleIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const rows = data.map((row, index) => ({ id: index + 1, ...row }));
  const displayedRows = searchText === '' ? rows : filteredRows;

return (
  <Box m="1.5rem 2.5rem">
    <Header title="Meter Readings" />
    <TextField
      label="Search by Phone Number"
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
        pageSize={4}
        autoHeight
      />
    </Box>
    <ToastContainer />
  </Box>
);

};

export default Customer;

