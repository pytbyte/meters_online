from . import staff
from flask import jsonify, request,session
from .models.Worker import Worker
from .. company.models.Company import Company
from .. admin.models.Admin import Admins
from .models.MaWorker import worker_schema, workers_schema
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS



@staff.route('/register', methods=['POST'])
@jwt_required()
def create_worker():
    """Create worker"""
    current_user = get_jwt_identity()
    
    Admin_id= current_user
    admin_data = Admins.get_admin_by_id(Admin_id)
    company_id = admin_data.company_id
    if not company_id:
        return jsonify(message='Company ID not found in user identity'), 400


    data = request.get_json()
    phone = data["phone"]
    existing_worker = Worker.query.filter_by(phone=phone).first()
    if existing_worker:
        return jsonify(message='Worker already registered'), 200

    staff_data = Worker(
        company_id=company_id,
        phone=data['phone'],
        name=data['name'],
        role=data['role'],
        password=data["password"]
    )
    results = Worker.save(staff_data)
    workers = Worker.get_all_workers()
    if not workers:
        return jsonify(message='No workers found'), 404
    result = workers_schema.dump(workers)
    return jsonify(result), 200



@staff.route('/update/', methods=['PUT'])
@jwt_required()
def update_worker():
    """Update worker"""
    try:
        current_user = get_jwt_identity()
        admin_id = current_user
        admin_data = Admins.get_admin_by_id(admin_id)
        company_id = admin_data.company_id
        if not company_id:
            return jsonify(message='Company ID not found in user identity'), 400

        data = request.get_json()
        worker_id = data.get('worker_id')
        if not worker_id:
            return jsonify(message='Worker ID is required'), 400

        worker = Worker.query.filter_by(worker_id=worker_id, company_id=company_id).first()
        if not worker:
            return jsonify(message='Worker not found'), 404

        worker.phone = data.get('phone', worker.phone)
        worker.name = data.get('name', worker.name)
        worker.role = data.get('role', worker.role)

        worker.update()

        workers = Worker.get_all_workers()
        if not workers:
            return jsonify(message='No workers found'), 404

        result = workers_schema.dump(workers)
        return jsonify(result), 200
    except Exception as e:
        return jsonify(message='An error occurred', error=str(e)), 500

@staff.route('/workers', methods=['GET'])
def get_all_workers():
    workers = Worker.get_all_workers()
    if not workers:
        return jsonify(message='No workers found'), 404
    result = workers_schema.dump(workers)
    return jsonify(result), 200

@staff.route('/test', methods=['GET'])
def test():
    return jsonify(message='Worker endpoint working'), 200



@staff.route('/all_staff', methods=['GET'])
def get_all_staffs():
    staff = Worker.get_all_workers()
    if not staff:
        return jsonify(message='No staff found'), 404
    result = workers_schema.dump(staff)
    return jsonify(result), 200


@staff.route('/delete/<int:worker_id>', methods=['DELETE'])
@jwt_required()
def delete_staff(worker_id):
    """Delete staff by worker_id"""
    try:
        staff = Worker.query.get(worker_id)
        if not staff:
            return jsonify(message='Staff not found'), 404
        
        staff.delete()
        return jsonify(message='Staff deleted successfully'), 200
    
    except Exception as e:
        return jsonify(message=str(e)), 500
