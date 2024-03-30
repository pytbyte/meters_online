from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class Admins(db.Model):
    __tablename__ = 'admins'
    admin_id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.String, nullable=True)
    contact = db.Column(db.String, nullable=True, unique=True)
    admin_name = db.Column(db.String, nullable=True, unique=True)
    role = db.Column(db.String, nullable=True)
    password_hash = db.Column(db.String, nullable=True)
    created_at = db.Column(
        db.DateTime,
        nullable=True,
        default=db.func.current_timestamp())
    

    def __init__(self, admin_name, contact, company_id, role, password):
        self.admin_name = admin_name
        self.contact = contact
        self.company_id = company_id
        self.role = role
        self.password_hash = generate_password_hash(password, method='scrypt')

    
    def __repr__(self):
        return f'<Admin {self.admin_name}>'
    

    def delete(self):
        db.session.delete(self)
        db.session.commit()
        return True
    

    def save(self):
        # check if contact and email are unique
        admin = Admins.query.filter_by(contact=self.contact).first()
        if admin:
            return False
        admin = Admins.query.filter_by(admin_name=self.admin_name).first()
        if admin:
            return False
        db.session.add(self)
        db.session.commit()
        return self
    

    def update(self):
        db.session.commit()
        return True
    

    @staticmethod
    def get_all_Admins():
        return Admins.query.all()
    

    @staticmethod
    def get_admin_by_id(admin_id):
        return Admins.query.get(admin_id)

    @staticmethod
    def get_Admins_by_phone_number(phone_number):
        return Admins.query.get(phone_number)
    

    @staticmethod
    def get_Admin_by_phone(phone_number):
        return Admins.query.filter_by(contact=phone_number).first()