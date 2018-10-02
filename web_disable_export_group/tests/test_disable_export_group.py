# Copyright 2018 Onestein
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from mock import patch
from odoo.api import Environment
from odoo.tests.common import TransactionCase


class TestDisableExportGroup(TransactionCase):
    @patch('odoo.addons.web_disable_export_group.models.ir_http.request')
    @patch('odoo.addons.web.models.ir_http.request')
    def test_session_info(self, request, request1):
        request.env = self.env
        request1.env = self.env
        session_info = self.env['ir.http'].session_info()
        self.assertTrue(session_info['group_export_data'])

    @patch('odoo.addons.web_disable_export_group.models.ir_http.request')
    @patch('odoo.addons.web.models.ir_http.request')
    def test_session_info_not_allowed(self, request, request1):
        demo_env = Environment(
            self.env.cr,
            self.env.ref('base.default_user').id,
            {}
        )
        request.env = demo_env
        request1.env = demo_env

        session_info = demo_env['ir.http'].session_info()
        self.assertFalse(session_info['group_export_data'])
