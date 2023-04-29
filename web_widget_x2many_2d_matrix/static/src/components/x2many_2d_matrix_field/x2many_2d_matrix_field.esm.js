/** @odoo-module **/

import {Component} from "@odoo/owl";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {registry} from "@web/core/registry";
import {archParseBoolean} from "@web/views/utils";
import {X2Many2DMatrixRenderer} from "@web_widget_x2many_2d_matrix/components/x2many_2d_matrix_renderer/x2many_2d_matrix_renderer.esm";
import { _lt } from "@web/core/l10n/translation";

export class X2Many2DMatrixField extends Component {

    setup() {
        this.activeField = this.props.record.activeFields[this.props.name];
    }

    _getDefaultRecordValues() {
        return {};
    }

    async commitChange(x, y, value) {
        const fields = this.props.matrixFields;

        const values = this._getDefaultRecordValues();
        values[fields.x] = x;
        values[fields.y] = y;

        const matchingRecords = this.props.value.records.filter(
            (record) => record.data[fields.x] === x && record.data[fields.y] === y
        );
        if (matchingRecords.length === 1) {
            values[fields.value] = value;
            await matchingRecords[0].update(values);
        } else {
            let total = 0;
            if (matchingRecords.length) {
                total = matchingRecords
                    .map((r) => r.data[fields.value])
                    .reduce((aggr, v) => aggr + v);
            }
            const diff = value - total;
            values[fields.value] = diff;
            const record = await this.list.addNew({
                mode: "edit",
            });
            await record.update(values);
        }
        this.props.setDirty(false);
    }
}

X2Many2DMatrixField.components = {X2Many2DMatrixRenderer};
X2Many2DMatrixField.displayName = _lt("X2Many2DMatrixField Table");
X2Many2DMatrixField.template = "web_widget_x2many_2d_matrix.X2Many2DMatrixField";
X2Many2DMatrixField.props = {
    ...standardFieldProps,
    matrixFields: Object,
    isXClickable: Boolean,
    isYClickable: Boolean,
    showRowTotals: Boolean,
    showColumnTotals: Boolean,
};
X2Many2DMatrixField.extractProps = ({attrs}) => {
    return {
        matrixFields: {
            value: attrs.field_value,
            x: attrs.field_x_axis,
            y: attrs.field_y_axis,
        },
        isXClickable: archParseBoolean(attrs.x_axis_clickable),
        isYClickable: archParseBoolean(attrs.y_axis_clickable),
        showRowTotals:
            "show_row_totals" in attrs ? archParseBoolean(attrs.show_row_totals) : false,
        showColumnTotals:
            "show_column_totals" in attrs
                ? archParseBoolean(attrs.show_column_totals)
                : false,
    };
};

registry.category("fields").add("x2many_2d_matrix", X2Many2DMatrixField);
