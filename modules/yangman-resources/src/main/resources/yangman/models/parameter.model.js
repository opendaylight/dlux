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
