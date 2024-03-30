import os
from datetime import timedelta
basedir = os.path.abspath(os.path.dirname(__file__))



class Config:
    SECRET_KEY = 'ilwrudcuiadbcxjkzjkxnui89wedjfrxcvcxbecdcu'
    

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost/meters_online'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'sshhhffgdgdjskkat'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    UPLOAD_FOLDER = os.path.join(basedir, 'app/uploads')
    MAX_CONTENT_LENGTH = 4 * 1024 * 1024


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost/meters_online'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'sshhhffgdgdjskka'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    UPLOAD_FOLDER = os.path.join(basedir, 'app/uploads')
    MAX_CONTENT_LENGTH = 4 * 1024 * 1024


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost/meters_online'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'sshhhffgdgdjskka'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    UPLOAD_FOLDER = os.path.join(basedir, 'app/uploads')
    MAX_CONTENT_LENGTH = 4 * 1024 * 1024


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    
    'default': DevelopmentConfig
}
