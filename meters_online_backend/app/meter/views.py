from flask import jsonify, request, send_from_directory,session
from . import meter #readings
from ..decorators import admin_required, supervisor_required, worker_required
from ..admin.models.Admin import Admins
from .models.Meter import Meter
from ..admin.models.MaAdmin import admin_schema, admins_schema
from ..customer.models.Customer import Customer
from ..customer.models.MaCustomer import customer_schema, customers_schema
from .models.MaMeterReading import meter_reading_schema, meter_readings_schema
from .models.MeterReading import MeterReading
from datetime import datetime, timedelta, timezone
import os
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from ..billing.models.Bill import Bill
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime

now = datetime.datetime.now()
current_date = datetime.datetime.now()



""" 

meter class routes

"""
@meter.route('/meter_readings', methods=['GET'])
@jwt_required()
def get_all_meters():
    current_user = get_jwt_identity()

    Admin_id= current_user
    admin_data = Admins.get_admin_by_id(Admin_id)
    company_id = admin_data.company_id
    if not company_id:
        return jsonify(message='Company ID not found in user identity'), 400

    meters_ = MeterReading.get_meter_by_company_id(company_id)
    if not meters_:
        return jsonify(message='No meters found'), 404
    result = meter_readings_schema.dump(meters_)
    return jsonify(result), 200



@meter.route('/<int:meter_id>', methods=['DELETE'])
def delete_meter_by_id(meter_id):
    meter = Meter.get_by_id(meter_id)
    if not meter:
        return jsonify(message='No meter found'), 404
    meter.delete()
    return jsonify(message='Meter deleted successfully'), 200


@meter.route('/', methods=['GET'])
def get_all_meter_readings():
    meter_readings = MeterReading.get_all()
    if not meter_readings:
        return jsonify(message='No meter readings found'), 404
    result = meter_readings_schema.dump(meter_readings)
    return jsonify(result), 200


@meter.route('/new_reading', methods=['POST'])
@jwt_required()
def create_meter_reading():
    current_user = get_jwt_identity()
    
    Admin_id= current_user
    admin_data = Admins.get_admin_by_id(Admin_id)
    company_id = admin_data.company_id
    if not company_id:
        return jsonify(message='Company ID not found in user identity'), 400

    meter_id = request.json['meter_id']
    admin_id = Admin_id
    current_reading = request.json['current_reading']
    
    
    latest_reading = MeterReading.query.filter_by(meter_id=meter_id).order_by(MeterReading.reading_id.desc()).first()
    if latest_reading:
        previous_reading_ = latest_reading.current_reading
        contact_ = latest_reading.contact
        customer = Customer.query.filter_by(contact=contact_, company_id=company_id).first()
        if not customer:
            return jsonify(message='customer not found'), 404
        name_ = customer.name
        
    meter_reading = MeterReading(
        meter_id=meter_id,
        admin_id=admin_id,
        current_reading=current_reading,
        company_id=company_id,
        previous_reading = previous_reading_,
        contact = contact_,    
        name=name_

    )
    # Check if the entry is similar including the date
    if latest_reading.reading_date == current_date.date() and  latest_reading.current_reading == current_reading:
        return jsonify(message="Entry exists for this meter and date.")
    meter_reading.save()


    standing_fee = 100
    unit_charge = 150

    units = int(current_reading)
    amount_ = units * unit_charge + standing_fee    
    new_bill = Bill(meter_id=meter_id, units=units, status='unpaid', amount=amount_, company_id=company_id, ballance=amount_, paid_ammount=0, contact=contact_)
    new_bill.save()

    result = MeterReading.query.filter_by(company_id=company_id).order_by(MeterReading.reading_id.desc()).all()

    return jsonify(meter_readings_schema.dump(result)), 201


@meter.route('/edit_reading', methods=['PUT'])
@jwt_required()
def update_meter_reading():
    current_user = get_jwt_identity()
    
    Admin_id= current_user
    admin_data = Admins.get_admin_by_id(Admin_id)
    company_id = admin_data.company_id
    if not company_id:
        return jsonify(message='Company ID not found in user identity'), 400
    
    data= request.json
    reading_id = data['reading_id']
    admin_id = Admin_id
    current_reading = data['current_reading']
    
    
    try:
        latest_reading = MeterReading.query.filter_by(reading_id=reading_id).order_by(MeterReading.reading_id.desc()).first()
        if latest_reading:
            previous_reading_ = latest_reading.current_reading
            contact_ = latest_reading.contact
            customer = Customer.query.filter_by(contact=contact_, company_id=company_id).first()
            if not customer:
                return jsonify(message='customer not found'), 404
            name_ = customer.name
            meter_id = customer.meter_id
            latest_reading.current_reading = current_reading
            latest_reading.update()
    except Exception as e:
        return jsonify(message=str(e)), 500  # or handle the exception in a different way



    standing_fee = 100
    unit_charge = 150

    units = int(current_reading)
    amount_ = units * unit_charge + standing_fee    
    new_bill = Bill(meter_id=meter_id, units=units, status='unpaid', amount=amount_ , company_id=company_id )
    new_bill.save()

    result = MeterReading.query.filter_by(company_id=company_id).order_by(MeterReading.reading_id.desc()).all()

    return jsonify(meter_readings_schema.dump(result)), 201


@meter.route('/update/', methods=['PUT'])
@jwt_required()
def update_reading():
    """Update reading"""
    try:
        current_user = get_jwt_identity()
        admin_id = current_user
        admin_data = Admins.get_admin_by_id(admin_id)
        company_id = admin_data.company_id
        if not company_id:
            return jsonify(message='Company ID not found in user identity'), 400

        data = request.get_json()
        reading_id = data.get('reading_id')
        if not reading_id:
            return jsonify(message='reading ID is required'), 400

        reading_ = MeterReading.query.filter_by(reading_id=reading_id, company_id=company_id).first()
        if not reading_:
            return jsonify(message='reading_ not found'), 404

        reading_.current_reading = data.get('current_reading', reading_.current_reading)
        reading_.update()
        
        
        standing_fee = 100
        unit_charge = 150
        
        prev = reading_.previous_reading
        curr =  reading_.current_reading
        meter_id = reading_.meter_id

        units = int(curr - prev)
        amount_ = units * unit_charge + standing_fee    
        contact_ = reading_.contact

        new_bill = Bill(meter_id=meter_id, units=units, status='unpaid', amount=amount_, company_id=company_id, ballance=amount_, paid_ammount=0, contact=contact_)
        new_bill.save()

        result = MeterReading.query.filter_by(company_id=company_id).order_by(MeterReading.reading_id.desc()).all()

        return jsonify(meter_readings_schema.dump(result)), 201
    except Exception as e:
        return jsonify(message='An error occurred', error=str(e)), 500