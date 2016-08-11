define([], function (){
    'use strict';

    /**
     * Base parameter object
     * @constructor
     */
    function ParameterModel(){
        var self = this;

        // properties
        self.key = '';
        self.value = '';

        // attributes with underscore prefix are used for filtering in params admin
        self._key = '';
        self._value = '';

        // functions
        self.toJSON = toJSON;
        self.setData = setData;
        self.clone = clone;

        /**
         * Grouped setter
         *
         * @param key
         * @param value
         */
        function setData(key, value) {
            self.key = key;
            self.value = value;
            self._key = key;
            self._value = value;
        }

        /**
         *
         * @returns {{key: (string|*), value: (string|*)}}
         */
        function toJSON() {
            var obj = {
                key: self.key,
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
            result.setData(self.key, self.val);
            return result;
        }


    }

    return ParameterModel;
});
