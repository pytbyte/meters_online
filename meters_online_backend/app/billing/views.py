from flask import jsonify, request
from . import bill
from .models.Bill import Bill
from .models.MaBills import bill_schema, bills_schema
from flask import request, jsonify,session
from . .customer.models.Customer import Customer
from .. meter.models.Meter import Meter
from .. admin.models.Admin import Admins
from .. customer.models.MaCustomer import customer_schema, customers_schema
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime




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

@bill.route('/<int:customer_id>', methods=['GET'])
def get_bill_by_customer_id(customer_id):
    bill = Bill.get_bill_by_id(customer_id)
    if not bill:
        return jsonify(message='Bill not found'), 404
    bill_info = bills_schema.dump(bill)
    return jsonify(bill=bill_info), 200



@bill.route('/pay/', methods=['PUT'])
@jwt_required()
def update_bill():
    """Update bill"""
    try:
        current_user = get_jwt_identity()
        admin_id = current_user
        admin_data = Admins.get_admin_by_id(admin_id)
        company_id = admin_data.company_id
        if not company_id:
            return jsonify(message='Company ID not found in user identity'), 400

        data = request.json
        bill_id = data['bill_id']
        if not bill_id:
            return jsonify(message='bill ID is required'), 400

        bill_ = Bill.query.filter_by(bill_id=bill_id, company_id=company_id).first()
        if not bill_:
            return jsonify(message='bill_ not found'), 404

        before_payment = bill_.ballance
        incoming_ammount = data['paid_ammount']
        new_ballance = int(before_payment) - int(incoming_ammount)
        
         
        
        if new_ballance == 0:
            status_ = "Cleared."
            bill_.status = status_
        else:
            status_ = "uncleared"
            bill_.status = status_

        print("Bill id:", bill_.bill_id)
        print("Before Payment:", before_payment)
        print("Incoming Amount:", incoming_ammount)
        print("New Balance:", new_ballance)



       
        bill_.paid_on = datetime.datetime.now()        
        bill_.paid_ammount = incoming_ammount
        bill_.ballance = new_ballance
        bill_.update()

        print("Bill updated successfully")

        result = Bill.query.filter_by(company_id=company_id).order_by(Bill.bill_id.desc()).all()
        return jsonify(bills_schema.dump(result)), 201

    except Exception as e:
        print("Error:", e)
        return jsonify(message='An error occurred', error=str(e)), 500
