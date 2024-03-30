from flask import jsonify, request, session
from .models.Company import Company
from .. admin.models.Admin import Admins
from .models.MaCompany import company_schema, companys_schema
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
