from flask import Blueprint

Admin = Blueprint('Admin', __name__, url_prefix='/admin')

from . import views
