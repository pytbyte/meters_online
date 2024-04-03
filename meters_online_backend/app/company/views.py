from flask import jsonify, request, session
from .models.Company import Company
from .. admin.models.Admin import Admins
from .models.MaCompany import company_schema, companys_schema
from .. billing.models.Bill import Bill
from .. billing.models.MaBills import bill_schema, bills_schema
from .. customer.models.Customer import Customer
from .. customer.models.MaCustomer import customer_schema, customers_schema
from .. meter.models.MeterReading import MeterReading
from .. meter.models.MaMeterReading import meter_readings_schema, meter_reading_schema
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin

from . import company


@company.route('/register', methods=['POST'])
def create_company():
    """Create company"""
    data = request.get_json()
    phone=data["phone_number"]
    existing_company = Company.query.filter_by(phone_number=phone).first()
    if existing_company:
        return jsonify(message='company already registered'), 200
        
    company = Company(**data)
    company.save()
    result = company_schema.dump(company)
    password_ = phone

    admin_data = Admins(
        company_id = result["company_id"],
        contact = result["phone_number"],
        admin_name = result["registered_by"],
        role = 'super_admin',
        password =  generate_password_hash(password_, method='scrypt')
    )
    Admins.save(admin_data)
    return jsonify(result), 201

@company.route('/test', methods=['GET'])
def test():
    return jsonify(message='company endpoint working'), 200


@company.route('/all_companies', methods=['GET'])
def get_all_companys():
    companys = Company.get_all_companys()
    if not companys:
        return jsonify(message='No companys found'), 404
    result = companys_schema.dump(companys)
    return jsonify(result), 200

@company.route('/check-phone', methods=['POST'])
def check_phone_number():
    """Check if a phone number is already registered"""
    data = request.get_json()
    phone_number = data.get('phone_number')

    # Query the database to check if the phone number is already registered
    existing_company = Company.query.filter_by(phone_number=phone_number).first()

    # Return a JSON response indicating whether the phone number is registered or not
    return jsonify({'exists': existing_company is not None}), 200


@company.route('/company_data', methods=['GET'])
def get_company_data():
    company_id = session['company_id']
    companys = Company.get_company_data(company_id)
    if not companys:
        return jsonify(message='No company found'), 404
    companyData = company_schema.dump(companys)
    return jsonify(companyData), 200


@company.route('/summery', methods=['GET'])
def get_company_summary():
    try:
        company_id = request.args.get('company_id')
        if not company_id:
            return jsonify(message='Company ID is required'), 400

        company = Company.get_company_data(company_id)
        if not company:
            return jsonify(message='No company found'), 404

        # Fetch bills, meter readings, and customers for the company
        bills = Bill.query.filter_by(company_id=company_id).all()
        meter_readings = MeterReading.query.filter_by(company_id=company_id).all()
        customers = Customer.query.filter_by(company_id=company_id).all()

        # Serialize the data
        company_data = company_schema.dump(company)
        bills_data = bills_schema.dump(bills)
        meter_readings_data = meter_readings_schema.dump(meter_readings)
        customers_data = customers_schema.dump(customers)

        # Create a dictionary to hold all the data
        data = {
            'companyData': company_data,
            'bills': bills_data,
            'meter_readings': meter_readings_data,
            'customers': customers_data
        }

        return jsonify(data), 200
    except Exception as e:
        return jsonify(message=str(e)), 500
