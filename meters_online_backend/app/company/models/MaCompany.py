from flask_marshmallow import Marshmallow as ma
from .Company import Company

ma = ma()


class CompanySchema(ma.Schema):
    class Meta:
        model = Company
        fields = ('company_id', 'name', 'latitude', 'phone_number', 'registered_by')

        _links = ma.Hyperlinks({
            'self': ma.URLFor('Company_details', values=dict(company_id='<company_id>')),
            'collection': ma.URLFor('Companys')
        })
    

company_schema = CompanySchema()
companys_schema = CompanySchema(many=True)