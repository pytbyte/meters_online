from flask import jsonify, request
from .models.Admin import Admins
from .. worker.models.Worker import Worker
from .models.MaAdmin import admins_schema, admin_schema
from werkzeug.security import generate_password_hash, check_password_hash


from . import Admin


@Admin.route('/create', methods=['POST'])
def create_Admins():
    """Create Admins"""
    data = request.get_json()
    phone=data["contact"]
    existing_Admins = Admins.query.filter_by(contact=phone).first()
    if existing_Admins:
        return jsonify(message='Admins already registered'), 200
    
    Admin_ = Admins(**data)
    Admin_.save()
    result = admin_schema.dump(Admin_)
    return jsonify(result), 201



@Admin.route('/all_admins', methods=['GET'])
def get_all_Admins():
    Admin_ = Admins.get_all_Admins()
    if not Admin_:
        return jsonify(message='No Adminss found'), 404
    result = admins_schema.dump(Admin_)
    return jsonify(result), 200


