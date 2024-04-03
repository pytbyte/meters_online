from app import db

class Customer(db.Model):
    __tablename__ = 'customers'
    customer_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    contact = db.Column(db.String, nullable=False, unique=True)
    company_id = db.Column(db.String, nullable=True)
    location = db.Column(db.String, nullable=True)
    status = db.Column(db.String, nullable=True)
    meter_id = db.Column(db.Integer, db.ForeignKey('meters.meter_id'))
    registered_on = db.Column(db.DateTime, nullable=True, default=db.func.current_timestamp())
    registered_by = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, nullable=True, default=db.func.current_timestamp())

    meter = db.relationship('Meter', backref=db.backref('customers', uselist=False))
    
    def __init__(self, name, contact, registered_by, company_id):
        self.name = name
        self.contact = contact
        self.registered_by = registered_by
        self.company_id = company_id
    
    def __repr__(self):
        return f'<Customer {self.name}>'
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
        return True
    
    def save(self):
        # check if contact is unique excluding the current customer
        customer = Customer.query.filter(Customer.contact == self.contact, Customer.name != self.name).first()
        if customer:
            return False

        db.session.add(self)
        db.session.commit()
        return self
    
    def update(self):
        db.session.commit()
        return True
    
    @staticmethod
    def get_all_customers():
        return Customer.query.all()
    
    @staticmethod
    def get_customer_by_company_id(company_id):
        return Customer.query.filter_by(company_id=company_id).all()
    
    @staticmethod
    def get_customer_by_contact(contact):
        return Customer.query.filter_by(contact=contact).first()
    
    @staticmethod
    def get_customer_by_name(name):
        return Customer.query.filter_by(name=name).first()
    
    @staticmethod
    def get_customer_by_location(location):
        return Customer.query.filter_by(location=location).first()
