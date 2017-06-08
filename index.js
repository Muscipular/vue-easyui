/**
 * Created by Ralu on 2017/5/10.
 */
!function install(Vue) {
    const noop = () => {
    };
    let baseMixin = type => ({
        methods: {
            getId: function () {
                return `ez-id-${baseMixin.id = ~~baseMixin.id + 1}`;
            },
            destroy: function () {
                if (this.$_element) {
                    try {
                        this.$_element[this.$$type]('destroy');
                    }
                    catch (e) {

                    }
                    this.$_element = null;
                }
            }
        },
        mounted() {
            this.$$type = type;
            this.$_element = this.createElement();
        },
        // beforeDestroy(){
        // },
        destroyed(){
            this.destroy();
        }
    });

    function isNullVal(v) {
        return v === null || v === void 0;
    }

    function toString(v, d) {
        return isNullVal(v) ? d : (v + "");
    }

    let editorMixin = (type, opt) => {
        let getValue = 'getValue', setValue = 'setValue';
        let emitInputValue = true, emitInputEvent = 'input';
        if (opt) {
            getValue = opt.getValue || getValue;
            setValue = opt.setValue || setValue;
            emitInputValue = opt.emitInputValue !== false;
            emitInputEvent = opt.emitInputEvent || emitInputEvent;
        }
        return ({
            props: ["value", "options", "name", 'disabled', 'readonly', 'disableValidation', 'editable', 'required', 'validType', 'label', 'prompt', 'placeholder'],
            watch: {
                value: function (newValue, oldValue) {
                    if (this.$_element && this.$_element[type](getValue) !== newValue) {
                        this.$_element[type](setValue, newValue);
                    }
                },
                disabled: function (newValue) {
                    if (this.$_element) {
                        this.$_element[type](newValue ? "disable" : "enable");
                    }
                },
                readonly: function (newValue) {
                    if (this.$_element) {
                        this.$_element[type]("readonly", !!newValue);
                    }
                },
                disableValidation: function (newValue) {
                    if (this.$_element) {
                        this.$_element[type](newValue ? "disableValidation" : "enableValidation");
                    }
                }
            },
            methods: {
                createElement(opt){
                    let $input = $(this.$el);
                    opt = Object.assign({
                        value: this.value,
                        onChange: v => this.$emit('input', v),
                        disabled: !!this.disabled,
                        readonly: !!this.readonly,
                        novalidate: !!this.disableValidation,
                        required: !!this.required,
                        prompt: this.prompt || this.placeholder || '',
                    }, opt);
                    if (this.editable !== void 0) {
                        opt.editable = !!this.editable;
                    }
                    if (this.validType !== void 0) {
                        opt.validType = this.validType;
                    }
                    if (this.label !== void 0) {
                        opt.label = this.label;
                    }
                    $input[type](Object.assign({}, this.options || {}, opt));
                    if (emitInputValue) {
                        $input[type]("textbox").on("keypress change keyup keydown input", e => {
                            let _value = !this.disabled && !this.readonly && this._focus ? e.target.value : this.$_element[type](getValue);
                            if (_value !== this._io_value) {
                                this._io_value = _value;
                                this.$emit(emitInputEvent, _value);
                            }
                        }).on("focus", e => {
                            this._focus = true;
                        }).on("blur", e => {
                            this._focus = false;
                        });
                    }
                    return $input;
                },
                resetValidation(){
                    this.$_element[type]('resetValidation');
                },
                validate(){
                    return this.$_element[type]('validate');
                },
                isValid(){
                    return this.$_element[type]('isValid');
                }
            },
            beforeDestroy: function () {
                let $input = this.$_element;
                $input[type]("textbox").off("keypress change keyup blur keydown input focus");
            },
        });
    };

    Vue.component("easyui-textbox", {
        mixins: [baseMixin('textbox'), editorMixin('textbox')],
        template: "<input v-once v-bind:name='name || key' v-bind:id='key' />",
        data: function () {
            return {
                key: this.getId(),
            }
        },
        methods: {},
    });

    Vue.component("easyui-passwordbox", {
        mixins: [baseMixin('passwordbox'), editorMixin('passwordbox')],
        template: "<input v-once v-bind:name='name || key' v-bind:id='key' />",
        data: function () {
            return {
                key: this.getId(),
            }
        },
        methods: {},
    });

    Vue.component("easyui-combo", {
        mixins: [baseMixin('combo'), editorMixin('combo', { emitInputEvent: 'text-changed' })],
        props: ['multiple'],
        template: "<input v-once v-bind:name='name || key' v-bind:id='key' />",
        data: function () {
            return {
                key: this.getId(),
            }
        },
        methods: {},
    });
    let comboboxMixin = editorMixin('combobox', { emitInputEvent: 'text-changed' });
    Vue.component("easyui-combobox", {
        mixins: [baseMixin('combobox'), comboboxMixin],
        props: ['multiple', 'data', 'valueField', 'textField'],
        template: "<input v-once v-bind:name='name || key' v-bind:id='key' />",
        data: function () {
            return {
                key: this.getId(),
            }
        },
        methods: {
            createElement: function (opt) {
                return comboboxMixin.methods.createElement.call(this, Object.assign({
                    data: this.$options.propsData.data,
                    valueField: this.valueField,
                    textField: this.textField,
                    filter: this.filter || ((q, row) => {
                        let v = toString(row[this.textField], '');
                        let v2 = toString(row[this.valueField], '');
                        return v.toLowerCase().indexOf(q) === 0 || v2.toLowerCase().indexOf(q) === 0;
                    }),
                }, opt));
            }
        },
        watch: {
            data: function (newVal, oldVal) {
                // console.log(newVal, oldVal);
                this.$_element && this.$_element.combobox("loadData", newVal || []);
            }
        }
    });

    let linkBtnProps = ['text', 'iconCls', 'iconAlign', 'size', 'width', 'height', 'group', 'plain'];
    Vue.component("easyui-linkbutton", {
        mixins: [baseMixin('linkbutton')],
        props: linkBtnProps,
        template: "<a href='#' v-once :id='key'></a>",
        data: function () {
            return {
                key: this.getId(),
            }
        },
        methods: {
            createElement: function (opt) {
                opt = linkBtnProps.reduce((opt, field) => {
                    if (this[field] !== void 0) {
                        opt[field] = this[field];
                    }
                    return opt;
                }, opt || {});
                opt.onClick = e => {
                    this.$emit('click', e);
                };
                let $btn = $(this.$el);
                return $btn.linkbutton(opt);
            },
            destroy: function () {
                this.$_element && this.$_element.empty();
            }
        },
        watch: linkBtnProps.reduce((o, f) => {
            o[f] = function (newVal, oldVal) {
                if (newVal === oldVal || !this.$_element) {
                    return
                }
                this.$nextTick(() => {
                    this.destroy();
                    this.$_element = this.createElement();
                });
            };
            return o;
        }, {})
    });
}(Vue);
