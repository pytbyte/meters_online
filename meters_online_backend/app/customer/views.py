from flask import request, jsonify,session
from . import customer
from .models.Customer import Customer
from .. meter.models.Meter import Meter
from .. meter.models.MeterReading import MeterReading
from .. meter.models.MaMeterReading import meter_reading_schema, meter_readings_schema
from .. admin.models.Admin import Admins
from .models.MaCustomer import customer_schema, customers_schema
from werkzeug.utils import secure_filename
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity


@customer.route('/all_customers', methods=['GET'])
def get_all_customers():
    customers = Customer.get_all_customers()
    if not customers:
        return jsonify(message='No customers found'), 404
    result = customers_schema.dump(customers)
    return jsonify(result), 200

@customer.route('/test', methods=['GET'])
def test():
    return jsonify(message='Customer endpoint working'), 200

@customer.route('/register', methods=['POST'])
@jwt_required()
def create_customer():
    """Create customer"""
    current_user = get_jwt_identity()
    
    Admin_id= current_user
    admin_data = Admins.get_admin_by_id(Admin_id)
    company_id = admin_data.company_id
    if not company_id:
        return jsonify(message='Company ID not found in user identity'), 400
       
    data = request.get_json()
    contact = data["contact"]

    existing_customer = Customer.query.filter_by(contact=contact).first()
    if existing_customer:
        return jsonify(message='Customer already registered'), 200
    

    customer_ = Customer(
        contact=data['contact'],
        name=data['name'],
        registered_by=Admin_id,
        company_id = company_id
    )
    results = Customer.save(customer_)
     
    # Create a new meter assignment
    new_meter = Meter(registered_by=customer_.registered_by, name=customer_.name, company_id=customer_.company_id)
    new_meter.customer_id = customer_.customer_id
    new_meter.save()

    company_id=new_meter.company_id
    customer_id = new_meter.customer_id

    customer = Customer.query.filter_by(customer_id=customer_id, company_id=company_id).first()
    if not customer:
        return jsonify(message='customer not found'), 404

    customer.meter_id = new_meter.meter_id
    customer.status = "active"
    customer.update()
    name_ = customer.name
    
    # Create a new meter reading
    inital_reading = MeterReading(meter_id = new_meter.meter_id, current_reading = 0,
                                  company_id = new_meter.company_id, previous_reading=0,
                                  contact=customer_.contact, admin_id=Admin_id, name=name_)
    inital_reading.save()

    # Serialize the customer data    
    customers = Customer.get_all_customers()
    if not customers:
            return jsonify(message='No customers found'), 404
    result = customers_schema.dump(customers)
    return jsonify(result), 200



@customer.route('/<int:id>', methods=['GET'])
def get_customer_by_id(customer_id):
    customer = Customer.get_customer_by_id(customer_id)
    if not customer:
        return jsonify(message='Customer not found'), 404
    result = customer_schema.dump(customer)
    return jsonify(result), 200

@customer.route('/update/', methods=['PUT'])
@jwt_required()
def update_customer():
    """Update customer"""
    try:
        current_user = get_jwt_identity()
        admin_id = current_user
        admin_data = Admins.get_admin_by_id(admin_id)
        company_id = admin_data.company_id
        if not company_id:
            return jsonify(message='Company ID not found in user identity'), 400

        data = request.get_json()
        customer_id = data.get('customer_id')
        if not customer_id:
            return jsonify(message='customer ID is required'), 400

        customer = Customer.query.filter_by(customer_id=customer_id, company_id=company_id).first()
        if not customer:
            return jsonify(message='customer not found'), 404

        customer.contact = data.get('contact', customer.contact)
        customer.name = data.get('name', customer.name)
        customer.status = data.get('status', customer.status)

        customer.update()

        customers = customer.get_all_customers()
        if not customers:
            return jsonify(message='No customers found'), 404

        result = customers_schema.dump(customers)
        return jsonify(result), 200
    except Exception as e:
        return jsonify(message='An error occurred', error=str(e)), 500
    

@customer.route('/delete/<int:customer_id>', methods=['DELETE'])
@jwt_required()
def delete_customer(customer_id):
    """Delete customer by customer_id"""
    try:
        customer_ = Customer.query.get(customer_id)
        if not customer_:
            return jsonify(message='customer_ not found'), 404
        
        customer_.delete()
        return jsonify(message='customer_ deleted successfully'), 200
    
    except Exception as e:
        return jsonify(message=str(e)), 500





@customer.route('/<string:phone>', methods=['GET'])
def get_customer_by_phone(phone):
    customer = Customer.get_customer_by_phone(phone)
    if not customer:
        return jsonify(message='Customer not found'), 404
    result = customer_schema.dump(customer)
    return jsonify(result), 200

