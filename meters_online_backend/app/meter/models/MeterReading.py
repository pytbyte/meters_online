from app import db
from ...billing.models.Bill import Bill
from ...admin.models.Admin import Admins

from datetime import datetime


now = datetime.now()
current_month = now.month
current_year = now.year


def get_previous_date(current_date):
    month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    previous_date = datetime(current_date.year, current_date.month - 1, current_date.day)
    previous_month = current_date.month - 1
    if previous_month == 0:
        previous_month = month[11]
        previous_date = datetime(current_date.year - 1, previous_month, current_date.day)

        return previous_date
    return previous_date

class MeterReading(db.Model):
    __tablename__ = 'meter_readings'
    reading_id = db.Column(db.Integer, primary_key=True)
    meter_id = db.Column(
        db.Integer,
        db.ForeignKey('meters.meter_id'),
        nullable=False)
    admin_id = db.Column(
        db.Integer,
        db.ForeignKey('admins.admin_id'),
        nullable=False)
    previous_reading = db.Column(db.Float, nullable=False)
    current_reading = db.Column(db.Float, nullable=False)
    contact = db.Column(db.Float, nullable=False)
    company_id  = db.Column(db.Float, nullable=False)
    name  = db.Column(db.String, nullable=False)
    reading_date = db.Column(
        db.DateTime,
        nullable=True,
        default=db.func.current_timestamp())

    admin = db.relationship('Admins', backref='MeterReading')

    def __repr__(self):
        return '<MeterReading {}>'.format(self.reading_id)
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        return "Meter Reading added successfully."

    
    def update(self):
        db.session.commit()
        return self.reading_id
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
        return self.reading_id
    
    @staticmethod
    def get_meter_by_company_id(company_id):
        return MeterReading.query.filter_by(company_id=company_id).all()
    
    @staticmethod
    def get_all():
        return MeterReading.query.all()
    
    @staticmethod
    def get_by_id(reading_id):
        return MeterReading.query.get(reading_id)
    
    @staticmethod
    def get_by_meter_id(meter_id):
        return MeterReading.query.filter_by(meter_id=meter_id).all()
    

 
    
