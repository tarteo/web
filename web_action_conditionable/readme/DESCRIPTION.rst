This module was written to extend the functionality of actions in form and tree views.
Odoo by default support:

::

   <tree delete="false" create="false">

with this module you can do:

::

   <tree delete=_context.myContextValue == 'myValue' and 'base.group_sale_manager' in _group_refs">

where `_group_refs` contains the groups of the user
and _context holds the values in the context.

It works in any tree view, so you can use it in One2many.
