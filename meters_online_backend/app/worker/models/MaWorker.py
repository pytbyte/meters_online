from flask_marshmallow import Marshmallow as ma
from .Worker import Worker

ma = ma()


class WorkerSchema(ma.Schema):
    class Meta:
        model = Worker
        fields = ('company_id', 'name', 'role', 'phone', 'password', 'created_at', 'worker_id')

        _links = ma.Hyperlinks({
            'self': ma.URLFor('worker_details', values=dict(worker_id='<worker_id>')),
            'collection': ma.URLFor('workers')
        })


worker_schema = WorkerSchema()
workers_schema = WorkerSchema(many=True)