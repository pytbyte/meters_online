from flask import request, jsonify, session
from . import auth, Admin
from .. admin.models.Admin import Admins
from .. worker.models.Worker import Worker
from .. worker.models.MaWorker import worker_schema
from .models.TokenBlocklist import TokenBlocklist
from .. admin.models.MaAdmin import admins_schema, admin_schema
from .. company.models.Company import Company
from .. customer.models.Customer import Customer
from .. customer.models.MaCustomer import customer_schema, customers_schema
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from .. import jwt
from datetime import datetime, timedelta, timezone
from flask_cors import cross_origin


@auth.route('/', methods=['GET'])
def hello_world():
    return jsonify(message='Welcome to the Auth Route')


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    phone_number = data.get("phone_number")
    password_ = data.get("password")

    if not phone_number or not password_:
        return jsonify(message='Phone number and password are required'), 400

    # Check if the user is an admin
    admin_ = Admins.get_Admin_by_phone(phone_number)
    if admin_:
        if not admin_.password_hash:
            return jsonify(message='Admin user not found'), 404
        if not check_password_hash(admin_.password_hash, password_):
            return jsonify(message='Incorrect password'), 401
        access_token = create_access_token(identity=admin_.admin_id)
        session_data = {
            'user_type': 'admin',
            'user_id': admin_.admin_id,
            'company_id': admin_.company_id,
            'user_name': admin_.admin_name
        }
        session.update(session_data)
        company_data = Company.get_company_data(session_data['company_id'])
        id = admin_.company_id
        customersData = Customer.query.filter_by(company_id = id).all()
        customer_data = customers_schema.dump(customersData)

        return jsonify(jwtToken=access_token, customer_data=customer_data ,
                       access_token=access_token, user_type='admin', company_data=company_data, company_id = id), 200
    
    else:
        # Check if the user is a staff member
        staff_ = Worker.get_worker_by_phone(phone_number)
        if not staff_:
            return jsonify(message='Phone number is not registered!'), 404
        if not check_password_hash(staff_.password_hash, password_):
            return jsonify(message='Incorrect password'), 401
        access_token = create_access_token(identity=staff_.worker_id)
        session_data = {
            'user_type': 'staff',
            'user_id': staff_.worker_id,
            'company_id': staff_.company_id,
            'user_name': staff_.name
        }
        session.update(session_data)
        company_data = Company.get_company_data(session_data['company_id'])
        company_id = session_data['company_id']

        return jsonify(jwtToken=access_token, access_token=access_token, user_type='staff', user_info=worker_schema.dump(staff_), cmpany_id=company_id, company_data=company_data), 200


@auth.route("/logout", methods=["DELETE"])
@jwt_required()
def modify_token():
    jti = get_jwt()["jti"]
    now = datetime.now(timezone.utc)

    TokenBlocklistInfo = TokenBlocklist(jti=jti, created_at=now)
    TokenBlocklistInfo.save()

    return jsonify(msg="hate to see you go. Kindy sign in")


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]

    token = TokenBlocklist.get_token_by_id(jti)

    return token is not None


@Admin.route('/', methods=['GET'])
def get_all_Admins():
    Admins_ = Admins.get_all_Admins()
    if not Admins_:
        return jsonify(message='No Admins found'), 404
    result = admins_schema.dump(Admins_)
    return jsonify(result)


@Admin.route('/', methods=['DELETE'])
def delete_all_Admins():
    Admins_ = Admins.get_all_Admins()
    if not Admins_:
        return jsonify(message='No Admins found'), 404
    Admins_.delete_all_Admins()
    return jsonify(message='All Admins deleted successfully'), 200


@auth.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_Admins = get_jwt_identity()
    return jsonify(logged_in_as=current_Admins), 200


@auth.route('/role', methods=['GET'])
@jwt_required()
def get_role():
    phone_number = get_jwt_identity()
    role = Admin.get_role(phone_number)
    if not role:
        return jsonify(message='Admins not found'), 404
    return jsonify(role=role), 200


@Admin.route('/<int:admin_id>', methods=['GET'])
# @jwt_required()
def get_Admins_by_id(admin_id):
    Admin_ = Admins.get_Admins_by_id(admin_id)
    if not Admin_:
        return jsonify(message='Admins not found'), 404
    result = admins_schema.dump(Admin_)
    return jsonify(result)


@Admin.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_Admins(id):
    Admin_ = Admins.get_Admins_by_id(id)
    if not Admin_:
        return jsonify(message='Admins not found'), 404
    Admin_name = request.json.get('Admin_name ', None)
    phone_number = request.json.get('phone_number', None)
    role = request.json.get('role', None)

    if not Admin_name:
        return jsonify(message='Admin_name is required'), 400
    if not phone_number:
        return jsonify(message='phone_number is required'), 400
    if not role:
        return jsonify(message='Role is required'), 400

    Admin_.Admins_name = Admin_name
    Admin_.phone_number = phone_number
    Admin_.role = role

    Admin_.update()

    return jsonify(message='Admins updated successfully'), 200


@Admin.route('/<int:id>', methods=['DELETE'])
def delete_Admins(id):
    Admins_ = Admins.get_Admins_by_id(id)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    Admins_.delete()

    # get all Adminss
    Admins_ = Admins.get_all_Admins()
    result = admins_schema.dump(Admins_)
    return jsonify(message='Admins deleted successfully', Admins = result), 200


@Admin.route('/<int:id>/password', methods=['PUT'])
@jwt_required()
def update_Admins_password(id):
    Admins_ = Admins.get_Admins_by_id(id)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    password = request.json.get('password', None)

    if not password:
        return jsonify(message='Password is required'), 400

    hashed_password = generate_password_hash(password, method='sha256')
    Admins_.password = hashed_password

    Admins_.update()

    return jsonify(message='Password updated successfully'), 200


@Admin.route('/<int:id>/role', methods=['PUT'])
@jwt_required()
def update_Admins_role(id):
    Admins_ = Admins.get_Admins_by_id(id)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    role = request.json.get('role', None)

    if not role:
        return jsonify(message='Role is required'), 400

    Admins_.role = role

    Admins_.update()

    return jsonify(message='Role updated successfully'), 200


@Admin.route('/<int:id>/Adminsname', methods=['PUT'])
@jwt_required()
def update_Admins_Adminsname(id):
    Admins_ = Admins.get_Admins_by_id(id)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    Admin_name = request.json.get('Admin_name', None)

    if not Admin_name:
        return jsonify(message='Admin_name is required'), 400

    Admins_.Admin_name = Admin_name

    Admins_.update()

    return jsonify(message='Adminsname updated successfully'), 200


@Admin.route('/<int:id>/phone_number', methods=['PUT'])
@jwt_required()
def update_Admins_phone_number(id):
    Admin_ = Admins.get_Admins_by_id(id)
    if not Admin_:
        return jsonify(message='Admins not found'), 404
    phone_number = request.json.get('phone_number', None)

    if not phone_number:
        return jsonify(message='phone_number is required'), 400

    Admin_.phone_number = phone_number

    Admin_.update()

    return jsonify(message='phone_number updated successfully'), 200


@Admin.route('/<int:id>/Adminsname', methods=['GET'])
def get_Admins_Adminsname(id):
    Admins_ = Admins.get_Admins_by_id(id)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    return jsonify(Admin_name=Admins_.Admin_name), 200


@Admin.route('/<int:id>/phone_number', methods=['GET'])
@jwt_required()
def get_Admins_phone_number(id):
    Admins_ = Admins.get_Admins_by_id(id)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    return jsonify(phone_number=Admins_.phone_number), 200


@Admin.route('/<int:id>/role', methods=['GET'])
@jwt_required()
def get_Admins_role(id):
    Admins_ = Admins.get_Admins_by_id(id)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    return jsonify(role=Admins_.role), 200


@Admin.route('/@<string:Adminsname>', methods=['GET'])
@jwt_required()
def get_Admins_by_Adminsname(Adminsname):
    Admins_ = Admins.get_Admins_by_Adminsname(Adminsname)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    result = admins_schema.dump(Admins_)
    return jsonify(result)


@Admin.route('/profile', methods=['GET'])
@jwt_required()
def get_Admins_profile():
    phone_number = get_jwt_identity()
    Admin_= Admins.get_Admins_by_phone_number(phone_number)
    if not Admin_:
        return jsonify(message='Admins not found'), 404
    result = admins_schema.dump(Admin_)
    return jsonify(result)


@Admin.route('/Admin_id', methods=['GET'])
@jwt_required()
def get_Adminsname():
    phone_number = get_jwt_identity()
    Admin_name = Admins.get_Admin(phone_number)
    if not Admin_name:
        return jsonify(message='Admins not found'), 404
    return jsonify(Admin_name=Admin_name), 200

# verify phone_number


@Admin.route('/<string:verification_code>/verify', methods=['GET'])
def verify_Admins(verification_code):
    Admins_ = Admins.verify_Admins(verification_code)
    if not Admins_:
        return jsonify(message='Admins not found'), 404
    return jsonify(message='Admins verified successfully'), 200


@auth.route('/for-admins-only', methods=['GET'])
@jwt_required()
#@admin_required
def for_admins_only():
    return jsonify(message='Admins only!'), 200


@auth.route('/for-Adminss-only', methods=['GET'])
@jwt_required()
def for_Adminss_only():
    return jsonify(message='Adminss only!'), 200


@auth.route('/Adminss/role/<string:role>', methods=['GET'])
def get_Admins_by_role(role):
    Admins_ = Admins.get_Adminss_by_role(role)
    if not Admins_:
        return jsonify(message='Adminss in role not found'), 404
    result = admins_schema.dump(Admins_)
    return jsonify(result)


@Admin.route('/role/<string:role>', methods=['GET'])
def get_Adminss_by_role(role):
    Admin_ = Admins.get_Adminss_by_role(role)
    if not Admin_:
        return jsonify(message='Adminss in role not found'), 404
    result = admins_schema.dump(Admin_)
    return jsonify(result)


@auth.route('/check-token', methods=['GET'])
@jwt_required()
def check_token():
    return jsonify(True), 200



