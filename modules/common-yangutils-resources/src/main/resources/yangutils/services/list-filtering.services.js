define([], function () {
    'use strict';

    function ListFilteringService(FilterNodeWrapperService, RequestBuilderService){
        var wasFound,
            filterResult;


        var getNodePathInStructure = function (filterRootNode,node) {
                var iterator = -1,
                    findNodeInStructure = function (currentParentStructure){
                        if(currentParentStructure.children.length && currentParentStructure.type !== 'leaf'){
                            if(!(currentParentStructure.children.some(function(element){ return element === node; }))){
                                currentParentStructure.children.forEach(function(child,index){
                                    checkHasSearchedNode(child,node);
                                });
                            }else{
                                wasFound = true;
                            }
                        }
                    },
                    checkHasSearchedNode = function (currentParent) {
                        if(currentParent === node){
                            wasFound = true;
                        }else{
                            if(currentParent.actElemStructure){
                                findNodeInStructure(currentParent.actElemStructure);
                            }else{
                                findNodeInStructure(currentParent);
                            }
                        }
                    },
                    getIndexOfSearchedNode = function (parentNodeStructure) {
                        parentNodeStructure.children.forEach(function(elem,index){
                            wasFound = false;
                            checkHasSearchedNode(elem,node);
                            if(wasFound){
                                node.searchedPath.push(index);
                            }
                        });
                        if(parentNodeStructure.children[node.searchedPath[iterator]] !== node){
                            getSearchedPath(parentNodeStructure.children[node.searchedPath[iterator]]);
                        }
                    },
                    getSearchedPath = function(parentNode){
                        iterator++;
                        if(parentNode.actElemStructure){
                            getIndexOfSearchedNode(parentNode.actElemStructure);
                        }else{
                            getIndexOfSearchedNode(parentNode);
                        }
                    };

                if(filterRootNode !== node){
                    getSearchedPath(filterRootNode);
                }
            },

            clearFilterNodes = function(node) {
                node.referenceNode.filterNodes.forEach(function(filterNode){
                    filterNode.clear();
                });
            },

            loadFilterNodes = function (node) {
                var fillFuc = function(fillNods, prop, filVal){
                    fillNods.forEach(function(filterNode){
                        filterNode.fill(prop, filVal[prop]);
                    });
                };

                if(node.referenceNode.filters[node.currentFilter].filteredValues){
                    node.referenceNode.filters[node.currentFilter].filteredValues.forEach(function(item){
                        for (var prop in item) {
                            fillFuc(node.referenceNode.filterNodes, prop, item);
                        }
                    });
                }
            },

            getFilterResult = function(element, filterValue, node){
                for (var i in filterValue){
                    if(!filterValue[i].filterType) {
                        continue;
                    }

                    if(!filterValue[i].hasOwnProperty('value') && !filterValue[i].hasOwnProperty('selectboxBitsValue') && !filterValue[i].hasOwnProperty('bitsValue') &&
                        !filterValue[i].hasOwnProperty('filterRangeFrom') && !filterValue[i].hasOwnProperty('filterRangeTo') && element[i]){
                        getFilterResult(element[i],filterValue[i]);
                    }else{
                        if(filterValue[i].selectboxBitsValue && filterValue[i].selectboxBitsValue.length){
                            filterResult = filterValue[i].getResult(element,filterValue[i].selectboxBitsValue,i);
                        }else{
                            if((filterValue[i].filterRangeFrom && filterValue[i].filterRangeFrom !== '') || (filterValue[i].filterRangeTo && filterValue[i].filterRangeTo !== '')){
                                filterResult = filterValue[i].getFilterResult[filterValue[i].filterType](element,filterValue[i].filterRangeFrom,filterValue[i].filterRangeTo,i);
                            }else if(filterValue[i].bitsValue && filterValue[i].bitsValue !== ''){
                                filterResult = filterValue[i].getFilterResult[filterValue[i].filterType](element,filterValue[i].bitsValue,i);
                            }else {
                                filterResult = filterValue[i].getFilterResult[filterValue[i].filterType](element,filterValue[i].value,i);
                            }
                        }
                    }
                }
            },

            getActElementFilter = function (node) {
                var actData = [];

                node.actElemIndex = 0;
                if(node.filteredListData && node.filteredListData.length){
                    actData = node.filteredListData[node.actElemIndex];
                }else{
                    actData = node.listData[node.actElemIndex];
                }

                node.actElemStructure.clear();
                for (var prop in actData) {
                    node.actElemStructure.fillListElement(prop, actData[prop]);
                }
            };

        var listFiltering = {};

        listFiltering.removeEmptyFilters = function (node) {
            if(node.referenceNode && node.referenceNode.filters){
                var wasDeleted = false;
                node.referenceNode.filters = node.referenceNode.filters.filter(function(filter){
                    if(filter.filteredValues && filter.filteredValues.length){
                        return true;
                    }else{
                        wasDeleted = true;
                        return false;
                    }
                });

                if(wasDeleted){
                    listFiltering.switchFilter(node,0,true);
                }
            }
        };

        listFiltering.showListFilterWin = function (filterRootNode,node) {
            if(!node.searchedPath.length){
                getNodePathInStructure(filterRootNode,node);
            }

            if(!node.referenceNode){
                node.referenceNode = filterRootNode;
                node.searchedPath.forEach(function(elem){
                    node.referenceNode = node.referenceNode.children[elem];
                });
            }

            if(!node.referenceNode.filterNodes.length){
                FilterNodeWrapperService.init(node);
                node.referenceNode.filterNodes = node.getNewFilterElement();
            }

            if(!(node.referenceNode.filters && node.referenceNode.filters.length)){
                node.referenceNode.filters.push({name : 'Filter 1 name', active : 1});
            }else{
                listFiltering.getFilterData(node);
                listFiltering.removeEmptyFilters(node);
            }
        };

        listFiltering.createNewFilter = function (node) {
            node.referenceNode.filters.push({name : 'Filter ' + (node.referenceNode.filters.length+1) + ' name', active : 1});

            listFiltering.switchFilter(node,node.referenceNode.filters.length-1);
        };

        listFiltering.getFilterData = function (node) {
            node.referenceNode.filters[node.currentFilter].filteredValues = node.referenceNode.filterNodes.map(function(element){
                var requestData = {};
                element.buildRequest(RequestBuilderService, requestData);
                return requestData;
            }).filter(function(item){
                return $.isEmptyObject(item) === false;
            });
        };

        listFiltering.switchFilter = function (node,showedFilter,fromRemoveEmptyFilters) {
            if(node.referenceNode.filters.length){
                if(!fromRemoveEmptyFilters){
                    listFiltering.getFilterData(node);
                }
                clearFilterNodes(node);
                node.currentFilter = showedFilter;
                loadFilterNodes(node);
            }else{
                node.currentFilter = 0;
            }
        };

        listFiltering.applyFilter = function (node) {
            listFiltering.getFilterData(node);
            listFiltering.removeEmptyFilters(node);

            node.filteredListData = node.listData.slice().filter(function(element){
                return node.referenceNode.filters.filter(function(fil){
                    return fil.active === 1;
                }).some(function(filter){
                    return filter.filteredValues.every(function(filterValue){
                        filterResult = null;
                        getFilterResult(element,filterValue,node);
                        return filterResult;
                    });
                });
            });

            getActElementFilter(node);
            // console.info('applyFilter node',node,'node.referenceNode.filterNodes',node.referenceNode.filterNodes,'node.referenceNode.filters',node.referenceNode.filters);
        };

        listFiltering.clearFilterData = function (node, changeAct, filterForClear, removeFilters) {
            if(filterForClear){
                filterForClear--;
                if(node.referenceNode.filters.length === 1){
                    node.referenceNode.filters = [];
                    node.referenceNode.filters.push({name : 'Filter 1 name', active : 1});
                    clearFilterNodes(node);
                }else{
                    node.referenceNode.filters.splice(filterForClear,1);
                    node.currentFilter = 0;
                    clearFilterNodes(node);
                    loadFilterNodes(node);
                }
            }else{
                if(removeFilters){
                    node.referenceNode.filters = [];
                    clearFilterNodes(node);
                    node.currentFilter = 0;
                }else{
                    node.referenceNode.filters.forEach(function(filter){
                        filter.active = 2;
                    });
                    listFiltering.getFilterData(node);
                    listFiltering.removeEmptyFilters(node);
                }
                node.filteredListData = [];
            }

            if(changeAct){
                getActElementFilter(node);
            }

        };

        return listFiltering;
    }

    ListFilteringService.$inject=['FilterNodeWrapperService', 'RequestBuilderService'];

    return ListFilteringService;

});