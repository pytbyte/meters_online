from flask_marshmallow import Marshmallow as ma
from .Admin import Admins

ma = ma()


class AdminSchema(ma.Schema):
    class Meta:
        model = Admins
        fields = ('admin_id', 'admin_name', 'company_id', 'contact', 'role', 'password_hash')

        _links = ma.Hyperlinks({
            'self': ma.URLFor('admin_details', values=dict(admin_id='<admin_id>')),
            'collection': ma.URLFor('Admins')
        })
    

admin_schema = AdminSchema()
admins_schema = AdminSchema(many=True)