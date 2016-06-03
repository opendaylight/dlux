define([], function (){
    'use strict';

    /**
     * Collection object used in CollectionListModel
     * @param name
     * @constructor
     */
    function CollectionModel(name){
        var self = this;
        self.name = name;
        self.expanded = false;
        self.data = [];

        self.clone = clone;
        self.toggleExpanded = toggleExpanded;

        function clone(newName){
            var result = new CollectionModel(newName);
            self.data.forEach(function (item){
                var newItem = item.clone();
                newItem.collection = newName;
                result.data.push(newItem);
            });
            return result;
        }

        function toggleExpanded(){
            self.expanded = !self.expanded;
        }

    }

    return CollectionModel;
});
