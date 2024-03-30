from app import db

from app import db

class Meter(db.Model):
    __tablename__ = 'meters'

    meter_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.String(50), unique=True, nullable=False)
    company_id = db.Column(db.String(50), nullable=False)
    registered_by = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), nullable=True)
    name = db.Column(db.String(255), nullable=True)
    registered_on = db.Column(
        db.DateTime,
        nullable=True,
        default=db.func.current_timestamp())
    

    # Define the one-to-one relationship with MeterReading
    meter_reading = db.relationship(
        'MeterReading', uselist=False, backref='Meter')
    # Define the one-to-one relationship with Customer
    customer = db.relationship('Customer', uselist=False, backref='Meter')

    def __repr__(self):
        return '<Meter {}>'.format(self.meter_id)
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        return self.meter_id
    
    def update(self):
        db.session.commit()
        return self.meter_id
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
        return self.meter_id
    

    @staticmethod
    def get_all():
        return Meter.query.all()
    
    @staticmethod
    def get_by_id(meter_id):
        return Meter.query.get(meter_id)
    
    @staticmethod
    def get_by_customer_id(customer_id):
        return Meter.query.filter_by(customer_id=customer_id).all()
    
    @staticmethod
    def get_meter_by_company_id(company_id):
        return Meter.query.filter_by(company_id=company_id).all()