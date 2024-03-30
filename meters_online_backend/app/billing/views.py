from flask import jsonify, request
from . import bill
from .models.Bill import Bill
from .models.MaBills import bill_schema, bills_schema
from flask import request, jsonify,session
from . .customer.models.Customer import Customer
from .. meter.models.Meter import Meter
from .. meter.models.MeterReading import MeterReading
from .. meter.models.MaMeterReading import meter_reading_schema, meter_readings_schema
from .. admin.models.Admin import Admins
from .. customer.models.MaCustomer import customer_schema, customers_schema
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity




@bill.route('/test', methods=['GET'])
def test():
    return jsonify(message='Billing endpoint working'), 200



@bill.route('/all_bills', methods=['GET'])
@jwt_required()
def get_all_bills():
    current_user = get_jwt_identity()
    
    Admin_id= current_user
    admin_data = Admins.get_admin_by_id(Admin_id)
    company_id = admin_data.company_id
    if not company_id:
        return jsonify(message='Company ID not found in user identity'), 400
       
    bills_ = Bill.get_bill_by_company_id(company_id)
    if not bills_:
        return jsonify(message='No bills found'), 404
    bills_info = bills_schema.dump(bills_)
    return jsonify(bills=bills_info), 200


@bill.route('/<int:id>', methods=['GET'])
def get_bill_by_id(id):
    bill = Bill.get_bill_by_id(id)
    if not bill:
        return jsonify(message='Bill not found'), 404
    bill_info = bill_schema.dump(bill)
    return jsonify(bill=bill_info), 200


@bill.route('/', methods=['DELETE'])
def delete_all_bills():
    bills = Bill.get_all_bills()
    if not bills:
        return jsonify(message='No bills found'), 404
    for bill in bills:
        bill.delete()
    return jsonify(message='All bills deleted'), 200