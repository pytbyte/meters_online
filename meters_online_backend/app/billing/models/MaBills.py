from flask_marshmallow import Marshmallow as ma
from flask_marshmallow import fields

from .Bill import Bill

ma = ma()


class BillSchema(ma.Schema):
    class Meta:
        model = Bill
        fields = ('bill_id', 'company_id', 'meter_id', 'units', 'amount', 'status', 'created_at', 'ballance', 'paid_ammount', 'paid_on', 'contact')

        _links = ma.Hyperlinks({
            'self': ma.URLFor('bill_details', values=dict(bill_id='<bill_id>')),
            'collection': ma.URLFor('bill')
        })


bill_schema = BillSchema()
bills_schema = BillSchema(many=True)