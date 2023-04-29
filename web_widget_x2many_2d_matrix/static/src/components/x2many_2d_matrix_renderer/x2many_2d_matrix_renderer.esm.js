/** @odoo-module **/

import {Component, onWillUpdateProps} from "@odoo/owl";
import {registry} from "@web/core/registry";

export class X2Many2DMatrixRenderer extends Component {

    setup() {
        this.ValueFieldComponent = this._getValueFieldComponent();
        this.AggregateFieldComponent = this._getAggregateFieldComponent();
        this.columns = this._getColumns();
        this.rows = this._getRows();
        this.matrix = this._getMatrix();

        onWillUpdateProps((newProps) => {
            this.columns = this._getColumns(newProps.matrixRows.records);
            this.rows = this._getRows(newProps.matrixRows.records);
            this.matrix = this._getMatrix(newProps.matrixRows.records);
        });
    }

    _getColumns(records = this.matrixRows.records) {
        const columns = [];
        records.forEach((record) => {
            const column = {
                value: record.data[this.matrixFields.x],
                text: record.data[this.matrixFields.x],
            };
            if (record.fields[this.matrixFields.x].type === "many2one") {
                column.value = column.value[0];
                column.text = column.value[1];
            }
            if (columns.findIndex((c) => c.value === column.value) !== -1) return;
            columns.push(column);
        });
        return columns;
    }

    _getRows(records = this.matrixRows.records) {
        const rows = [];
        records.forEach((record) => {
            const row = {
                value: record.data[this.matrixFields.y],
                text: record.data[this.matrixFields.y],
            };
            if (record.fields[this.matrixFields.y].type === "many2one") {
                row.value = row.value[0];
                row.text = row.value[1];
            }
            if (rows.findIndex((r) => r.value === row.value) !== -1) return;
            rows.push(row);
        });
        return rows;
    }

    _getPointOfRecord(record) {
        let xValue = record.data[this.matrixFields.x];
        if (record.fields[this.matrixFields.x].type === "many2one") {
            xValue = xValue[0];
        }
        let yValue = record.data[this.matrixFields.y];
        if (record.fields[this.matrixFields.y].type === "many2one") {
            yValue = yValue[0];
        }

        const x = this.columns.findIndex((c) => c.value === xValue);
        const y = this.rows.findIndex((r) => r.value === yValue);
        return {x, y};
    }

    _getMatrix(records = this.matrixRows.records) {
        const matrix = this.rows.map(() =>
            new Array(this.columns.length).fill(null).map(() => {
                return {value: 0, records: []};
            })
        );
        records.forEach((record) => {
            const value = record.data[this.matrixFields.value];
            const {x, y} = this._getPointOfRecord(record);
            matrix[y][x].value += value;
            matrix[y][x].records.push(record);
        });
        return matrix;
    }

    get matrixRows() {
        return this.props.matrixRows;
    }

    get matrixFields() {
        return this.props.matrixFields;
    }

    _getValueFieldComponent() {
        return this.matrixRows.activeFields[this.matrixFields.value].FieldComponent;
    }

    _getAggregateFieldComponent() {
        return registry.category("fields").get("char")
    }

    _aggregateRow(row) {
        const y = this.rows.findIndex((r) => r.value === row);
        return this.matrix[y].map((r) => r.value).reduce((aggr, x) => aggr + x);
    }

    _aggregateColumn(column) {
        const x = this.columns.findIndex((c) => c.value === column);
        return this.matrix
            .map((r) => r[x])
            .map((r) => r.value)
            .reduce((aggr, y) => aggr + y);
    }

    _aggregateAll() {
        return this.matrix
            .map((r) => r.map((x) => x.value).reduce((aggr, x) => aggr + x))
            .reduce((aggr, y) => aggr + y);
    }

    update(x, y, value) {
        this.matrix[y][x].value = value;
        const xFieldValue = this.columns[x].value;
        const yFieldValue = this.rows[y].value;

        this.props.onUpdate(xFieldValue, yFieldValue, value);
    }

    getValueFieldProps(column, row) {
        const x = this.columns.findIndex((c) => c.value === column);
        const y = this.rows.findIndex((r) => r.value === row);
        const props = this.matrixRows.activeFields[this.matrixFields.value].props;
        const propsFromAttrs = this.matrixRows.activeFields[this.matrixFields.value].propsFromAttrs;
        const record = this.matrix[y][x].records[0];
        return {
            ...props,
            ...propsFromAttrs,
            value: record.data[this.matrixFields.value],
            update: (value) => this.update(x, y, value),
            readonly: this.props.readonly,
            record: record,
        };
    }
}

X2Many2DMatrixRenderer.template = "web_widget_x2many_2d_matrix.X2Many2DMatrixRenderer";
X2Many2DMatrixRenderer.props = {
    matrixRows: Object,
    matrixFields: Object,
    setDirty: Function,
    onUpdate: Function,
    readonly: Boolean,
    showRowTotals: Boolean,
    showColumnTotals: Boolean,
};
