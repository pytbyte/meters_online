from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify, request, session


class Worker(db.Model):
    __tablename__ = 'workers'
    worker_id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, nullable=False, unique=True)
    role = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=True)
    created_at = db.Column(
        db.DateTime,
        nullable=True,
        default=db.func.current_timestamp())
    

    def __init__(self, name, phone, role, password, company_id):
        self.company_id = company_id
        self.name = name
        self.phone = phone
        self.role = role
        self.password_hash = generate_password_hash(password, method='scrypt')


    def __repr__(self):
        return f'<Worker {self.name}>'
    

    def delete(self):
        db.session.delete(self)
        db.session.commit()
        return True
    

    def save(self):
        # check if phone is  unique
        worker = Worker.query.filter_by(phone=self.phone).first()
        if worker:
            return False
        else:
            db.session.add(self)
            db.session.commit()
            return self.get_workers_by_company_id(self.company_id)
    

    def update(self):
        db.session.commit()
        return True
    

    @staticmethod
    def get_all_workers():
        return Worker.query.all()
    

    @staticmethod
    def get_worker_by_id(id):
        return Worker.query.get(id)
    

    @staticmethod
    def get_worker_by_worker_id(worker_id):
        return Worker.query.filter_by(worker_id=worker_id).first()
    
    
    # get workers with same company
    @staticmethod
    def get_workers_by_company_id(company_id):
        return Worker.query.filter_by(company_id=company_id).all()


    # get workers by email
    @staticmethod
    def get_worker_by_phone(phone_number):
        return Worker.query.filter_by(phone=phone_number).first()        
