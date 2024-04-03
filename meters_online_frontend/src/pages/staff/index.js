import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, useTheme } from '@mui/material';
import Header from 'components/Header';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const Staff = () => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    role: '',
    password: ''
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
      const response = await axios.get('http://localhost:5000/staff/all_staff');
      const rows_ = response.data.filter(row => row.company_id === companyId);
      const rows = rows_.reverse().map((row, index) => ({ ...row, id: index + 1 }));
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
  
  const handleEditClick = (staff) => {
    setSelectedStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedStaff(null);
    setIsEditDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedStaff(null);
    setIsDeleteDialogOpen(false);
  };

  const handleAddClick = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  
  const handleAddStaff = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      console.log('Auth Token:', authToken);
  
      if (!authToken) {
        toast.error('User is not authenticated');
        return; // Stop further execution
      }

      if (!newStaff.name || !newStaff.phone || !newStaff.role || !newStaff.password) {
        toast.error('Please fill in all fields');
        return;
      }
      
      
      const response = await axios.post('http://localhost:5000/staff/register', newStaff, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      console.log('Response:', response);
  
      if (response.status === 200) {
        setData([...data, response.data]);
        setIsAddDialogOpen(false); // Close the modal
        setNewStaff({
          name: '',
          phone: '',
          role: '',
          password: ''
        });
        // Fetch the latest data
        fetchData()
        toast.success('Staff added successfully');
      } else {
        console.error('Failed to add staff:', response.data);
        toast.error('Failed to add staff');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Error adding staff');
      setIsAddDialogOpen(false); // Close the modal on error
    }
  };
  
  
  
      

  const handleEditStaff = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      console.log('Auth Token:', authToken);
  
      if (!authToken) {
        toast.error('User is not authenticated');
        return; // Stop further execution
      }
  
      const companyData = JSON.parse(localStorage.getItem('companyData'));
      const companyId = companyData.company_id;
  
      const response = await axios.put('http://localhost:5000/staff/update/', selectedStaff, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      if (response.status === 200) {
        const updatedData = data.map((staff) => (staff.worker_id === selectedStaff.worker_id ? selectedStaff : staff));
  
        setData(updatedData);
        setIsEditDialogOpen(false);
        // Fetch the latest data
        fetchData()
        console.error('Failed to edit staff:', selectedStaff.worker_id);
        toast.success('Staff updated successfully');
      } else {
        console.error('Failed to edit staff:', response.data);
        toast.error('Failed to edit staff');
      }
    } catch (error) {
      console.error('Error editing staff:', error);
      toast.error('Error editing staff');
    }
  };




  
  const handleDeleteStaff = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      if (!authToken) {
        toast.error('User is not authenticated');
        return; // Stop further execution
      }
  
      if (!selectedStaff) {
        toast.error('No staff member selected');
        return; // Stop further execution
      }
  
      const { worker_id } = selectedStaff;
  
      const response = await axios.delete(`http://localhost:5000/staff/delete/${worker_id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      if (response.status === 200) {
        const filteredData = data.filter((staff) => staff.worker_id !== worker_id);
        setData(filteredData);
        setIsDeleteDialogOpen(false);
        fetchData()
        toast.success('Staff deleted successfully');
      } else {
        console.error('Failed to delete staff:', response.data);
        toast.error('Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Error deleting staff');
    }
  };
  
  





  const filteredRows = searchText === ''
    ? data || []
    : (data || []).filter((row) => row.phone.includes(searchText));

  const editDialog = (
    <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
      <DialogTitle>Edit Staff</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={selectedStaff?.name || ''}
          onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Phone"
          value={selectedStaff?.phone || ''}
          onChange={(e) => setSelectedStaff({ ...selectedStaff, phone: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="role"
          value={selectedStaff?.role || ''}
          onChange={(e) => setSelectedStaff({ ...selectedStaff, role: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="worker_id"
          value={selectedStaff?.worker_id || ''}
          onChange={(e) => setSelectedStaff({ ...selectedStaff, worker_id: e.target.value })}
          fullWidth
          margin="normal"
          disabled
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseEditDialog}>Cancel</Button>
        <Button color="primary" onClick={handleEditStaff}>Save</Button>
      </DialogActions>
    </Dialog>
  );

  const deleteDialog = (
    <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
      <DialogTitle>Delete Staff</DialogTitle>
      <DialogContent>
        Are you sure you want to delete {selectedStaff?.name}?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
        <Button color="error" onClick={handleDeleteStaff}>Delete</Button>
      </DialogActions>
    </Dialog>
  );







  const addDialog = (
    <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog}>
      <DialogTitle>Add New Staff</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={newStaff.name}
          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Phone"
          value={newStaff.phone}
          onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Role"
          value={newStaff.role}
          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          value={newStaff.password}
          onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseAddDialog}>Cancel</Button>
        <Button color="primary" onClick={handleAddStaff}>Add Staff</Button>
      </DialogActions>
    </Dialog>
  );
  
  const columns = [
    { field: 'name', headerName: 'name', flex: 1 },
    { field: 'phone', headerName: 'phone', flex: 1 },
    { field: 'role', headerName: 'role', flex:0.5 },
    { field: 'created_at', headerName: 'joined', flex: 1 },
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
    <Header title="Staff" />
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
      Add Staff
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

export default Staff;

