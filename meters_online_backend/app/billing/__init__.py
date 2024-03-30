from flask import Blueprint

bill = Blueprint('bill', __name__, url_prefix='/bill')

from . import views