define([], function (){
    'use strict';

    /**
     * Base parameter object
     * @constructor
     */
    function ParameterModel(){
        var self = this;

        // properties
        self.name = '';
        self.value = '';

        // attributes with underscore prefix are used for filtering in params admin
        self._name = '';
        self._value = '';

        // functions
        self.toJSON = toJSON;
        self.setData = setData;
        self.clone = clone;
        self.applyValsForFilters = applyValsForFilters;

        /**
         * Copy model name and value to _name and _value properties, which are used when sorting and filtering list
         * of parameters
         */
        function applyValsForFilters() {
            self._name = self.name;
            self._value = self.value;
        }

        /**
         * Grouped setter
         *
         * @param name
         * @param value
         */
        function setData(name, value) {
            self.name = name;
            self.value = value;
            self._name = name;
            self._value = value;
        }

        /**
         *
         * @returns {{name: (string|*), value: (string|*)}}
         */
        function toJSON() {
            var obj = {
                name: self.name,
                value: self.value,
            };

            return obj;
        }

        /**
         *
         * @returns {ParameterModel}
         */
        function clone() {
            var result = new ParameterModel();
            result.setData(self.name, self.val);
            return result;
        }


    }

    return ParameterModel;
});
