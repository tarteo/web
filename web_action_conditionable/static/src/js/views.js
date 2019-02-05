/*global openerp, _, $ */

openerp.web_action_conditionable = function (instance) {
    instance.web.View.include({
        /**
         * @override
         */
        is_action_enabled: function(action) {
            var attrs = this.fields_view.arch.attrs;
            if (action in attrs) {
                try {
                    return this._super(action);
                } catch(error) {
                    var expr = attrs[action];
                    var expression = py.parse(py.tokenize(expr));
                    var ctx = {};
                    ctx['_group_refs'] = instance.session.group_refs;

                    // Normal views
                    if (!this.dataset.context.__ref && !this.dataset.parent_view) {
                        ctx['_context'] = this.dataset.context;
                    }
                    // Nested views
                    else if (py.tokenize(this.dataset.context.__contexts[0]).length > 1) {
                        var view_ctx = this.dataset.context.__eval_context;
                        view_ctx = view_ctx ? view_ctx.__contexts[1] : {};
                        ctx['_context'] = py.evaluate(py.parse(py.tokenize(this.dataset.context.__contexts[0])), view_ctx).toJSON();
                    }
                    return py.evaluate(expression, ctx).toJSON();
                }
            } else {
                return true;
            }
        }
    });
}
