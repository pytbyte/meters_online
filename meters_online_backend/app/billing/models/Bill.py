from app import db
from sqlalchemy import Sequence

class Bill(db.Model):
    __tablename__ = 'bills'
    bill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    meter_id = db.Column(db.Integer, db.ForeignKey('meters.meter_id'))
    contact = db.Column(db.Integer, nullable=True)
    paid_ammount= db.Column(db.Integer, nullable=True)
    ballance = db.Column(db.Integer, nullable=True)
    units = db.Column(db.Integer, nullable=True)
    company_id = db.Column(db.Integer, nullable=True)
    amount = db.Column(db.Float, nullable=True)
    status = db.Column(db.String, nullable=True)
    paid_on = db.Column(db.Integer, nullable=True)
    created_at = db.Column(
        db.DateTime,
        nullable=True,
        default=db.func.current_timestamp())
   
    
    meter = db.relationship('Meter', backref='Bill')

    def __repr__(self):
        return f'<Bill {self.bill_id}>'
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
        return True
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        return self
    
    def update(self):        
        db.session.commit()
        return True
        
    @staticmethod
    def get_all_bills():
        return Bill.query.all()
    
    @staticmethod
    def get_bill_by_id(bill_id):
        return Bill.query.get(bill_id)
    
    @staticmethod
    def get_bill_by_customer_id(customer_id):
        return Bill.query.filter_by(customer_id=customer_id).all()
    
    @staticmethod
    def get_bill_by_company_id(company_id):
        return Bill.query.filter_by(company_id=company_id).all()
