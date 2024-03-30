from app import db
from werkzeug.security import generate_password_hash, check_password_hash


class Company(db.Model):
    __tablename__ = 'companies'
    company_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    latitude = db.Column(db.DECIMAL(10, 6), nullable=True)
    registered_on = db.Column(db.DATE, nullable=True)
    registered_by = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), nullable=True)
    password = db.Column(db.String, nullable=True)
    registered_on = db.Column(
        db.DateTime,
        nullable=True,
        default=db.func.current_timestamp())
    

    def __init__(self, name, phone_number, latitude, password, registered_by):
        self.name = name
        self.phone_number = phone_number
        self.latitude = latitude
        self.password = generate_password_hash(password, method='scrypt')
        self.registered_by=  registered_by

    
    def __repr__(self):
        return f'<Company {self.name}>'
    

    def to_dict(self):
        return {
            'company_id': self.company_id,
            'name': self.name,
            'phone_number': self.phone_number,
            'latitude': self.latitude,
            'registered_by': self.registered_by
            # Add more fields as needed
        }




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
    def get_all_companys():
        return Company.query.all()
    

    @staticmethod
    def get_company_data(company_id):
        company = Company.query.filter_by(company_id=company_id).first()
        if company:
            return company.to_dict()
        else:
            return None
    
