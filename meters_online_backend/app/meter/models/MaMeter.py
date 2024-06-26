from flask_marshmallow import Marshmallow as ma

from .Meter import Meter

ma = ma()


class MeterSchema(ma.Schema):
    class Meta:
        model = Meter
        fields = ('registered_by', 'company_id', 'name', '')

        _links = ma.Hyperlinks({
            'self': ma.URLFor('meter_details', values=dict(meter_id='<meter_id>')),
            'collection': ma.URLFor('meters')
        })


meter_schema = MeterSchema()
meters_schema = MeterSchema(many=True)