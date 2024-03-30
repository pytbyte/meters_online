from flask_marshmallow import Marshmallow as ma

from .MeterReading import MeterReading

ma = ma()


class MeterReadingSchema(ma.Schema):
    class Meta:
        model = MeterReading
        fields = ('reading_id', 'meter_id', 'name', 'reading_date', 'current_reading', 'company_id', 'previous_reading', 'contact')

        _links = ma.Hyperlinks({
            'self': ma.URLFor('meter_reading_details', values=dict(reading_id='<reading_id>')),
            'collection': ma.URLFor('meter_readings')
        })


meter_reading_schema = MeterReadingSchema()
meter_readings_schema = MeterReadingSchema(many=True) 