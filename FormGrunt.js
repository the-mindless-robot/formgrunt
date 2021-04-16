class FormGrunt {

    constructor(inputClass) {
        this.inputClass = `.${inputClass}`;
        this.inputs = document.querySelectorAll(this.inputClass);
        this.inputCountByType = {};
        this.invalidInputsArray = [];

        this.inputList = this._initInputs(this.inputs);
    }

    _initInputs(inputs) {
        const inputList = {};

        for(const input of inputs) {

            const inputAttributes = input.dataset;
            // console.debug(inputAttributes);

             //type is required
             const type = inputAttributes.type ? inputAttributes.type.toLowerCase() : false;
             const lookup = inputAttributes.lookup ? inputAttributes.lookup : false;

             if(type && lookup) {
                 this._addToCount(type);
                 const elemId = input.id ? input.id : 'none';

                 inputList[lookup] = {
                     type,
                     elemId,
                     elem: input
                 };
             } else {
                 this.invalidInputsArray.push(input);
             }
        }
        console.debug('inputs', inputList, this.inputs);
        return inputList;
    }

    updateInputs() {
        // update any new imputs
        this.inputs = document.querySelectorAll(this.inputClass);
        this.inputList = this._initInputs(this.inputs);
    }

    _addToCount(type) {
        if(this.inputCountByType.hasOwnProperty(type)) {
            this.inputCountByType[type] += 1;
        } else {
            this.inputCountByType[type] = 1;
        }
    }

    _createId(type) {
        return `${type}${this.inputCountByType[type]}`;
    }

    getAllInputValues(stringFormat = false) {
        console.log('getting values',this.inputList);
        const allValues = {};
        for(const lookup in this.inputList) {
            console.log('getting values for', lookup);
            const input = this.inputList[lookup];
            const inputValue = stringFormat ? this._getInputValue(input, true) : this._getInputValue(input);

            console.log('inputValue', inputValue);
            allValues[lookup] = inputValue;
        }

        return allValues;
    }

    getInputValue(lookup, stringFormat = false) {
        const input = this.inputList[lookup];
        const inputValue = stringFormat ? this._getInputValue(input, true) : this._getInputValue(input);
        return inputValue;
    }

    getInputLookup(elem) {
        return elem.closest(this.inputClass).dataset.lookup;
    }

    getInputParentElem(elem) {
        return elem.closest(this.inputClass);
    }

    _getInputValue(input, stringFormat = false) {
        const type = input.type;
        let inputValue;

        if (type == 'radio') {
            inputValue = this._getSelectedRadioValue(input.elem);
            if (stringFormat) {
                return inputValue.value;
            }
            return inputValue;
        }

        if (type == 'text') {
            inputValue = this._getTextInputValue(input.elem);
            return inputValue;
        }

        if (type == 'select') {
            inputValue = this._getSelectInputValues(input.elem);
            if (stringFormat) {
                return inputValue.toString;
            }
            return inputValue;
        }

        if (type == 'checkbox') {
            inputValue = this._getCheckboxValue(input.elem);
            if(stringFormat) {
                return inputValue ? "Yes" : "No";
            }
            return inputValue;
        }


        return 'invalid type';

    }

    _getCheckboxValue(elem) {
        let checkbox = elem;
        if(elem.nodeName !== "INPUT") {
            checkbox = elem.querySelector('input[type="checkbox"]');
        }

        if(checkbox.checked) {
            if(checkbox.value === "on") {
                return true;
            }
            return checkbox.value;
        }

        return false;
    }

    _getSelectedRadioValue(elem) {
        // const options = document.getElementsByName(name);
        const options = elem.querySelectorAll('input[type="radio"]');
        console.debug('options', elem, options);
        let value = null;
        let label = null;
        for(let i=0;i < options.length; i++) {
            if(options[i].checked) {
                value = options[i].value;
                label = options[i].nextElementSibling.innerText;
            }
        }
        return {label, value};
    }

    _getTextInputValue(elem) {
        if(elem.nodeName == "INPUT") {
            return elem.value;
        }
        const input = elem.querySelector('input[type="text"]');
        return input.value;
    }

    _getSelectInputValues(elem, hasPlaceholder = true) {
        const values = {
            toString: '',
            toArray: [],
            obj: {},
            hasValues: false
        };

        let input;
        if(elem.nodeName == "SELECT") {
            input = elem;
        } else {
            input = elem.querySelector('select');
        }

        const options = input.options;
        // console.log(options);
        const start = hasPlaceholder ? 1 : 0;
        let selected = 0;

        for (let i=start; i<options.length; i++) {
            // console.log(options[i]);
            if (options[i].selected === true) {
                // array
                values.toArray.push(options[i].value);
                //obj
                values.obj[this._cleanLabel(options[i].value)] = true;
                //string
                if (selected !== 0) {
                    values.toString += ', '+options[i].value;
                } else {
                    values.toString += options[i].value;
                }
                selected++;
            } else {
                values.obj[this._cleanLabel(options[i].value)] = false;
            }

        }
        if(selected > 0) {
            values.hasValues = true;
        }
        return values;
    }

    // remove special chars/spaces
    _cleanLabel(label) {
        let cleanLabel = label.replace('/', '-');
        cleanLabel = cleanLabel.split(' ').join('_');
        return cleanLabel;
    }


    /*
    **save for backwards compatibility with old applications**
    */
    // get input from text field by element id
    static getTextInputValue(id) {
        return document.getElementById(id).value;
    }
    // get selected values from select/options input by element id
    static getSelectInputValues(id, hasPlaceholder=true) {
        const values = {
            toString: '',
            toArray: [],
            obj: {},
            hasValues: false
        };

        const input = document.getElementById(id);
        const options = input.options;
        // console.log(options);
        const start = hasPlaceholder ? 1 : 0;
        let selected = 0;

        for (let i=start; i<options.length; i++) {
            // console.log(options[i]);
            if (options[i].selected === true) {
                // array
                values.toArray.push(options[i].value);
                //obj
                values.obj[this._cleanLabel(options[i].value)] = true;
                //string
                if (selected !== 0) {
                    values.toString += ', '+options[i].value;
                } else {
                    values.toString += options[i].value;
                }
                selected++;
            } else {
                values.obj[this._cleanLabel(options[i].value)] = false;
            }

        }
        if(selected > 0) {
            values.hasValues = true;
        }
        return values;
    }
    // get value from radio buttons/checkbox by field name
    static getSelectedRadioValue(name) {
        const options = document.getElementsByName(name);
        let value = null;
        let label = null;
        for(let i=0;i < options.length; i++) {
            if(options[i].checked) {
                value = options[i].value;
                label = options[i].nextElementSibling.innerText;
            }
        }
        return {label, value};
    }
    // checkbox query
    static isChecked(id) {
        const element = document.getElementById(id);
        return element.checked;
    }


}

