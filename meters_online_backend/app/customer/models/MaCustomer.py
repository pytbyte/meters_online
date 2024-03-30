from flask_marshmallow import Marshmallow as ma
from .Customer import Customer

ma = ma()


class CustomerSchema(ma.Schema):
    class Meta:
        fields = ('name', 'contact', 'meter_id',  'status', 'created_at', 'company_id', 'customer_id')
        _links = ma.Hyperlinks({
            'self': ma.URLFor('customer_details', values=dict(customer_id='<customer_id>')),
            'collection': ma.URLFor('customers')
        })



customer_schema = CustomerSchema()
customers_schema = CustomerSchema(many=True)