from flask import Blueprint

auth = Blueprint('auth', __name__, url_prefix='/auth')

Admin = Blueprint('Admin', __name__, url_prefix='/admin')
auth.register_blueprint(Admin)

from . import views, errors
