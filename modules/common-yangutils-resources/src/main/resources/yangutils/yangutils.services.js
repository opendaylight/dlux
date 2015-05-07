define(['common/yangutils/yangutils.module'], function(yangUtils) {

    yangUtils.factory('YangUtilsRestangular', function(Restangular, ENV) {
        return Restangular.withConfig(function(RestangularConfig) {
          RestangularConfig.setBaseUrl(ENV.getBaseURL("MD_SAL"));
        });
    });

    yangUtils.factory('arrayUtils', function() {

        var arrayUtils = {};

        arrayUtils.getFirstElementByCondition = function(list, condition) {
            var selItems = list && condition ? list.filter(function(item) {
                return condition(item);
            }) : [];
            return (selItems.length ? selItems[0] : null);
        };

        return arrayUtils;
    });

    yangUtils.factory('pathUtils', function(arrayUtils) {

        var pathUtils = {},
            parentPath = '..';

        var PathElem = function(name, module, identifierName) {
            this.name = name;
            this.module = module;
            this.identifierName = identifierName;
            this.identifierValue = '';

            this.hasIdentifier = function() {
                return (identifierName ? true : false);
            };

            this.toString = function() {
                return (this.module ? this.module+':' : '')+this.name+'/'+(this.hasIdentifier() ? this.identifierValue + '/' : '');
            };

            this.checkNode = function(node) {
                return (this.module ? this.module === node.module : true) && (this.name ? this.name === node.label : true);
            };
        };

        var getModuleNodePair = function(pathString, defaultModule) {
            return pathString.indexOf(':') > -1 ? pathString.split(':') : [defaultModule, pathString];
        };

        var isIdentifier = function(item) {
            return (item.indexOf('{') === item.indexOf('}')) === false;
        };

        var createPathElement = function(pathString, identifierString, prefixConverter, defaultModule) {
            var pair = getModuleNodePair(pathString, defaultModule),
                //module can be either prefix or module name, if it's module name we don't need to convert it
                module = (prefixConverter && pair[0] !== defaultModule ? prefixConverter(pair[0]) : pair[0]),
                name = pair[1];

            return new PathElem(name, module, identifierString);
        };

        pathUtils.search = function(node, path) {
            var pathElem = path.shift(),
                selNode = (pathElem.name === parentPath ?
                    node.parent :
                    arrayUtils.getFirstElementByCondition(node.children, function(child) {
                        return pathElem.checkNode(child);
                    }));

            if(selNode !== null) {
                if(path.length) {
                    return pathUtils.search(selNode, path);
                } else {
                    return selNode;
                }
            } else {
                // console.warn('cannot find element ',pathElem,'in node',node);
                return null;
            }
        };

        pathUtils.translate = function(path, prefixConverter, defaultModule) {
            var lastUsedModule = defaultModule,

                pathStrArray = path.split('/').filter(function(item) {
                    return item !== '';
                }).slice(),

                result = pathStrArray.map(function(item, index) {
                    if(isIdentifier(item)) {
                        return null;
                    } else {
                        var identifier,
                            pathElem;

                        if(pathStrArray.length > index+1 && isIdentifier(pathStrArray[index+1])) {
                            identifier = pathStrArray[index+1].slice(1, -1);
                        }

                        pathElem = createPathElement(item, identifier, prefixConverter, lastUsedModule);
                        // do we want to update? in api path should not, in other it shouldnt matter
                        // lastUsedModule = (pathElem.module ? pathElem.module : lastUsedModule); 

                        return pathElem;
                    }
                }).filter(function(item) {
                    return item !== null;
                });

            return result;
        };

        pathUtils.__test = {
            PathElem: PathElem,
            getModuleNodePair: getModuleNodePair,
            isIdentifier: isIdentifier,
            createPathElement: createPathElement
        };

        return pathUtils;
    });

    yangUtils.factory('syncFact', function ($timeout) {
        var timeout = 10000;

        var SyncObject = function() {
            this.runningRequests = [];
            this.reqId = 0;
            this.timeElapsed = 0;

            this.spawnRequest = function(digest) {
                var id = digest+(this.reqId++).toString();
                this.runningRequests.push(id);
                //console.debug('adding request ',id,' total running requests  = ',this.runningRequests);
                return id;
            };

            this.removeRequest = function(id) {
                var index = this.runningRequests.indexOf(id);

                if (index > -1) {
                    this.runningRequests.splice(index, 1);
                    //console.debug('removing request ',id,' remaining requests = ',this.runningRequests);
                } else {
                    console.warn('cannot remove request',id,'from',this.runningRequests,'index is',index);
                }
            };

            this.waitFor = function(callback) {
                var t = 1000,
                    processes = this.runningRequests.length,
                    self = this;

                if(processes > 0 && self.timeElapsed < timeout) {
                    // console.debug('waitin on',processes,'processes',this.runningRequests);
                    $timeout(function() { 
                        self.timeElapsed = self.timeElapsed + t;
                        self.waitFor(callback); 
                    }, t);
                } else {
                    callback();
                }
            };
        };

        return {
            generateObj: function() {
                return new SyncObject();
            }
        };
    });


    yangUtils.factory('custFunct', function (reqBuilder) {
        var CustFunctionality = function(label, node, callback) {
            this.label = label;
            this.callback = callback;

            this.setCallback = function(callback) {
                this.callback = callback;
            };

            this.runCallback = function() {
                if(this.callback) {
                    this.callback();
                } else {
                    console.warn('no callback set for custom functionality',this.label);
                }
            };
        };

        custFunct = {};

        custFunct.createNewFunctionality = function(label, node, callback) {
            if(node && callback) {
                return new CustFunctionality(label, node, callback);
            } else {
                console.error('no node or callback is set for custom functionality');
            }
        };

        return custFunct;
    });


    yangUtils.factory('reqBuilder', function () {

        var namespace = 'flow-node-inventory';

        var builder = {
            namespace: namespace,
            createObj: function() {
                return {};
            },

            createList: function() {
                return [];
            },

            insertObjToList: function(list, obj) {
                list.push(obj);
            },

            insertPropertyToObj: function(obj, propName, propData) {
                var data = propData ? propData : {},
                    name = propName;

                obj[name] = data;
            },

            resultToString: function(obj) {
                return JSON.stringify(obj, null, 4);
            }
        };

        return builder;

    });

    yangUtils.factory('nodeWrapper', function (constants, $timeout, reqBuilder) {

      var comparePropToElemByName = function comparePropToElemByName(propName, elemName) {
          return (propName.indexOf(':') > -1 ? propName.split(':')[1] : propName) === elemName; //TODO also check by namespace - redundancy?
      };

      var equalArrays = function(arrA, arrB) {
          var match = (arrA.length === arrB.length) && arrA.length > 0;

          if(match) {
              var i = 0;
              while(i < arrA.length && match) {
                  var valMatch = arrA[i] === arrB[i];
                  match = match && valMatch;
                  i++;
              }
          }

          return match;
      };

      var equalListElems = function (listElemA, listElemB, refKey) {
          var getKeyValue = function(data, label, module) {
                  if(data && data.hasOwnProperty(label)) {
                      return data[label];
                  } else if(data && data.hasOwnProperty(module+':'+label)) {
                      return data[module+':'+label];
                  } else {
                      return null;
                  }
              },
              getKeyArrayValues = function(data, refKey) {
                  return refKey.map(function(key) {
                      return getKeyValue(data, key.label, key.module);
                  }).filter(function(item) {
                      return item !== null;
                  });
              },
              keyValuesA = getKeyArrayValues(listElemA, refKey);
              keyValuesB = getKeyArrayValues(listElemB, refKey);

          return equalArrays(keyValuesA, keyValuesB);
      };

      var checkListElemKeys = function(listData, refKey) {
          var doubleKeyIndexes = [],
              checkedElems = [];

          listData.forEach(function(item, index) {
              var duplitactes = checkedElems.filter(function(checked) {
                  var isDuplicate = equalListElems(item, checked.item, refKey);
                  if(isDuplicate && doubleKeyIndexes.indexOf(checked.index) === -1) {
                      doubleKeyIndexes.push(checked.index);
                  }
                  return isDuplicate;
              });

              if(duplitactes.length) {
                  //item is already in checkedElems so we don't need to push it again
                  doubleKeyIndexes.push(index); 
              } else {
                  checkedElems.push({index: index, item: item});
              }
          });

          return doubleKeyIndexes;
      };

        var wrapper = {

            wrap: function(node) {
                if(this.hasOwnProperty(node.type)) {
                    this[node.type](node);
                }
            },

            wrapAll: function(node) {
                var self = this;
                self.wrap(node);
                node.children.forEach(function(child) {
                    self.wrapAll(child);
                });
            },

            leaf: function(node) {
                node.value = '';

                var fnToString = function(string){
                    var valueStr = '';
                    try {
                        valueStr = string.toString();
                    } catch(e) {
                        console.warn('cannot convert value',node.value);
                    }
                    return valueStr;
                };

                node.buildRequest = function(builder, req) {
                    var valueStr = '';
                    valueStr = fnToString(node.value);

                    if( valueStr ) {
                        builder.insertPropertyToObj(req, node.label, valueStr);
                        return true;
                    }
                    return false;
                };

                node.fill = function(name, data) {
                    var match = comparePropToElemByName(name, node.label);

                    if(match) {
                        node.value = data;
                    }
                    return match;
                };

                node.clear = function() {
                    node.value = '';
                    node.nodeType = constants.NODE_UI_DISPLAY;
                };

                node.isFilled = function() {
                    var filled = fnToString(node.value) ? true : false;
                    return filled;
                };

            },

            container: function(node) {
                node.expanded = false;

                node.toggleExpand = function() {
                    node.expanded = !node.expanded;
                };

                node.buildRequest = function(builder, req) {
                    var added = false,
                        name = node.label,
                        objToAdd = builder.createObj();
                    
                    if(node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).length) {
                        
                        node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                            var childAdded = child.buildRequest(builder, objToAdd);
                            added = added || childAdded;
                        });
                    } else {
                        added = true;
                    }

                    if(added) {
                        builder.insertPropertyToObj(req, name, objToAdd);
                    }

                    return added;
                };

                node.fill = function(name, data) {
                    var match = comparePropToElemByName(name, node.label),
                        nodesToFill = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);

                    if (match && nodesToFill.length) {
                        nodesToFill.forEach(function(child) {
                            for(var prop in data) {
                                child.fill(prop, data[prop]);
                            }
                        });

                        node.expanded = true;
                    }
                    return match;
                };

                node.clear = function() {
                    var nodesToClear = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);
                    node.nodeType = constants.NODE_UI_DISPLAY;

                    if ( nodesToClear.length ) {
                        nodesToClear.forEach(function(child) {
                            child.clear();
                        });
                    }
                };

                node.isFilled = function() {
                    return node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).some(function(child) {
                        return child.isFilled();
                    });
                };
            },

            rpc: function(node) {
                node.expanded = true;
                node.buildRequest = function(builder, req) {
                    var added = false,
                        name = node.label;
                    
                    if(node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).length) {
                        
                        node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                            var childAdded = child.buildRequest(builder, req);
                            added = added || childAdded;
                        });
                    } else {
                        added = true;
                    }

                    return added;
                };

                node.fill = function(name, data) {
                    var filled = false,
                        nodesToFill = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);

                    nodesToFill.forEach(function(child) {
                        var childFilled = child.fill(name, data);
                        filled = filled || childFilled;
                    });

                    node.expanded = filled;

                    return filled;
                };

                node.clear = function() {
                    var nodesToClear = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);
                    node.nodeType = constants.NODE_UI_DISPLAY;

                    if (nodesToClear.length) {
                        nodesToClear.forEach(function(child) {
                            child.clear();
                        });
                    }
                };

                node.isFilled = function() {
                    return node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).some(function(child) {
                        return child.isFilled();
                    });
                };

            },

            input: function(node) {
                node.expanded = true;
                node.buildRequest = function(builder, req) {
                    var added = false,
                        name = node.label,
                        objToAdd = builder.createObj();
                    
                    if(node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).length) {
                        
                        node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                            var childAdded = child.buildRequest(builder, objToAdd);
                            added = added || childAdded;
                        });
                    } else {
                        added = true;
                    }

                    if(added) {
                        builder.insertPropertyToObj(req, name, objToAdd);
                    }

                    return added;
                };

                node.fill = function(name, data) {
                    var match = comparePropToElemByName(name, node.label),
                        nodesToFill = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);

                    if (match && nodesToFill.length) {
                        nodesToFill.forEach(function(child) {
                            for(var prop in data) {
                                child.fill(prop, data[prop]);
                            }
                        });

                        node.expanded = true;
                    }
                    return match;
                };

                node.clear = function() {
                    var nodesToClear = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);
                    node.nodeType = constants.NODE_UI_DISPLAY;

                    if (nodesToClear.length) {
                        nodesToClear.forEach(function(child) {
                            child.clear();
                        });
                    }
                };

                node.isFilled = function() {
                    return node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).some(function(child) {
                        return child.isFilled();
                    });
                };

            },

            output: function(node) {
                node.expanded = true;
                node.buildRequest = function(builder, req) {
                    var added = false,
                        name = node.label,
                        objToAdd = builder.createObj();
                    
                    if(node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).length) {
                        
                        node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                            var childAdded = child.buildRequest(builder, objToAdd);
                            added = added || childAdded;
                        });
                    } else {
                        added = true;
                    }

                    if(added) {
                        builder.insertPropertyToObj(req, name, objToAdd);
                    }

                    return added;
                };

                node.fill = function(name, data) {
                    var match = comparePropToElemByName(name, node.label),
                        nodesToFill = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);

                    if (match && nodesToFill.length) {
                        nodesToFill.forEach(function(child) {
                            for(var prop in data) {
                                child.fill(prop, data[prop]);
                            }
                        });

                        node.expanded = true;
                    }
                    return match;
                };

                node.clear = function() {
                    var nodesToClear = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);
                    node.nodeType = constants.NODE_UI_DISPLAY;

                    if (nodesToClear.length) {
                        nodesToClear.forEach(function(child) {
                            child.clear();
                        });
                    }
                };

                node.isFilled = function() {
                    return node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).some(function(child) {
                        return child.isFilled();
                    });
                };

            },

            case: function(node) {
                node.buildRequest = function(builder, req) {
                    var added = false;

                    node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                        var childAdded = child.buildRequest(builder, req);
                        added = added || childAdded;
                    });

                    return added;
                };

                node.fill = function(name, data) {
                    var filled = false,
                        nodesToFill = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);

                    nodesToFill.forEach(function(child) {
                        var childFilled = child.fill(name, data);
                        filled = filled || childFilled;
                    });

                    return filled;
                };

                node.clear = function() {
                    var nodesToClear = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);
                    node.nodeType = constants.NODE_UI_DISPLAY;

                    nodesToClear.forEach(function(child) {
                        child.clear();
                    });
                };

                node.isFilled = function() {
                    return node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).some(function(child) {
                        return child.isFilled();
                    });
                };
            },

            choice: function(node) {
                node.choice = null;
                node.expanded = true;
                node.buildRequest = function(builder, req) {
                    var added;

                    if(node.choice) {
                        added = node.choice.buildRequest(builder, req);
                    }

                    return added;
                };

                node.fill = function(name, data) {
                    var filled = false,
                        nodesToFill = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);
                    
                    nodesToFill.forEach(function(child) {
                        var childFilled = child.fill(name, data);

                        if(childFilled) {
                            node.choice = child;
                        }

                        filled = filled || childFilled;
                        if(filled) {
                            return false;
                        }
                    });

                    return filled;
                };

                node.clear = function() {
                    node.nodeType = constants.NODE_UI_DISPLAY;

                    if(node.choice) {
                        node.choice.clear();
                        node.choice = null;
                    }
                };

                node.isFilled = function() {
                    return node.choice !== null;
                };
            },

            'leaf-list': function(node) {
                node.value = [];
                node.expanded = true;

                node.toggleExpand = function() {
                    node.expanded = !node.expanded;
                };

                node.addListElem = function() {
                    var newElement = {
                        value: ''
                    };
                    node.value.push(newElement);
                };

                node.removeListElem = function(elem){
                    node.value.splice(node.value.indexOf(elem),1);
                };

                node.buildRequest = function(builder, req) {

                    var valueArray = [];

                    for( var i=0; i < node.value.length; i++ ) {
                        valueArray.push(node.value[i].value);
                    }

                    if(valueArray.length > 0) {
                        builder.insertPropertyToObj(req, node.label, valueArray);
                        return true;
                    }

                    return false;

                };


                node.fill = function(name, array) {
                    var match = comparePropToElemByName(name, node.label),
                        newLeafListItem;

                    if(match) {
                        
                        for ( var i=0; i< array.length; i++ ) {
                            newLeafListItem = {
                                value: array[i]
                            };
                            node.value.push(newLeafListItem);
                        }
                        
                    }
                    return match;
                }; 

                node.clear = function() {
                    node.nodeType = constants.NODE_UI_DISPLAY;
                    node.value = [];
                };

                node.isFilled = function() {
                    return node.value.length > 0;
                };

            },

            key: function(node) {
                // do this only on list, not on listElem because deepCopy on list doesn't copy property keys to listElem => don't do this when button for add new list is clicked
                if (node.parent.hasOwnProperty('refKey')) {
                    var keyLabels = node.label.split(' ');
                    node.parent.refKey = node.parent.getChildrenByNodeType(constants.NODE_UI_DISPLAY).filter(function(child) {
                        return keyLabels.indexOf(child.label) > -1;
                    });
                }
            },

            list: function(node) {
                node.refKey = [];
                node.doubleKeyIndexes = [];

                node.actElemStructure = null;
                node.actElemIndex = -1;
                node.listData = [];

                node.expanded = true;

                node.toggleExpand = function() {
                    node.expanded = !node.expanded;
                };

                node.createStructure = function() {
                    if(node.actElemStructure === null) {
                        var copy = node.deepCopy();
                        wrapper._listElem(copy);
                        node.actElemStructure = copy;
                    }
                };

                node.addListElem = function() {
                    node.createStructure();
                    var newElemData = {};
                    node.listData.push(newElemData);
                    node.changeActElementData(node.listData.length - 1);
                };

                node.buildActElemData = function() {
                    var list = [],
                        result;
                    if(node.actElemStructure) {
                        node.actElemStructure.listElemBuildRequest(reqBuilder, list);
                        result = list[0] ? list[0] : {};
                    }
                    return result;
                };

                node.changeActElementData = function(index) {
                    var storeData = node.buildActElemData();

                    node.expanded = true;

                    if(node.actElemIndex > -1) { //we are changing already existing data
                        node.listData[node.actElemIndex] = storeData;
                    }

                    node.actElemIndex = index;
                    var actData = node.listData[node.actElemIndex];
                    
                    node.actElemStructure.clear();
                    for(var prop in actData) {
                        node.actElemStructure.fillListElement(prop, actData[prop]);
                    }
                };

                node.removeListElem = function(elemIndex) {
                    node.listData.splice(elemIndex, 1);
                    node.actElemIndex = node.listData.length - 1;

                    if(node.actElemIndex === -1) {
                        node.actElemStructure = null;
                    } else {
                        var actData = node.listData[node.actElemIndex];

                        node.actElemStructure.clear();
                        for(var prop in actData) {
                            node.actElemStructure.fillListElement(prop, actData[prop]);
                        }
                    }
                };

                node.buildRequest = function(builder, req) {
                    var added = false;

                    //store entered data
                    var storeData = node.buildActElemData();

                    if(node.actElemIndex > -1) {
                        node.listData[node.actElemIndex] = storeData;
                    }

                    added = node.listData.filter(function(data) {
                        return $.isEmptyObject(data) === false;
                    }).length > 0;

                    var buildedDataCopy = node.listData.slice().map(function(item){
                        if(item && item.hasOwnProperty('$$hashKey')) {
                            delete item['$$hashKey'];
                        }
                        return item;
                    });

                    // check of listElems keyValues duplicity
                    node.doubleKeyIndexes = checkListElemKeys(node.listData, node.refKey);

                    if(added) {
                        builder.insertPropertyToObj(req, node.label, buildedDataCopy);
                    }
                    
                    return added;
                };

                node.fill = function(name, array) { //data is array
                    var match = comparePropToElemByName(name, node.label);

                    if(match && array.length) {
                        node.createStructure();
                        node.listData = array.slice();
                        
                        node.actElemIndex = node.listData.length - 1;
                        for(var prop in node.listData[node.actElemIndex]) {
                            node.actElemStructure.fillListElement(prop, node.listData[node.actElemIndex][prop]);
                        }
                    }
                    
                    return (match && array.length > 0);
                };

                node.clear = function() {
                    while(node.listData.length > 0) {
                        node.listData.pop();
                    }

                    node.actElemIndex = -1;
                    node.actElemStructure = null;
                    node.nodeType = constants.NODE_UI_DISPLAY;
                };

                node.isFilled = function() {
                    return node.listData.length > 0;
                };

                node.createListName = function(index) {
                    var name = '', 
                        val = '';

                    if(index > -1) {
                        node.refKey.forEach(function(key) {
                            if (!($.isEmptyObject(node.listData[index]))) {
                                val = node.listData[index][key.label] ? (key.label+':'+node.listData[index][key.label]) : (node.listData[index][key.module+':'+key.label] ? (key.label+':'+node.listData[index][key.module+':'+key.label]) : '');
                                name = name ? (name + (val ? (' ' + val) : '')) : (name + (val ? (' <' + val) : ''));
                            }
                        });
                    }

                    if(name) {
                        name = name + '>';
                    }

                    return name;
                };
            },

            _listElem: function(node) {
                node.listElemBuildRequest = function(builder, req) {
                    var added = false,
                        objToAdd = builder.createObj();

                    node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                        var childAdded = child.buildRequest(builder, objToAdd);
                        added = added || childAdded;
                    });

                    if(added) {
                        builder.insertObjToList(req, objToAdd);
                    }

                    return added;
                };

                node.fillListElement = function(name, data) {
                    var filled = false;

                    node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).forEach(function(child) {
                        var childFilled = child.fill(name, data);
                        filled = filled || childFilled;
                    });
                    
                    return filled;
                };

                node.isFilled = function() {
                    return node.getChildrenByNodeType(constants.NODE_UI_DISPLAY).some(function(child) {
                        return child.isFilled();
                    });
                };
                
                node.clear = function() {
                    var nodesToClear = node.getChildrenByNodeType(constants.NODE_UI_DISPLAY);
                    node.nodeType = constants.NODE_UI_DISPLAY;

                    if (nodesToClear.length) {
                        nodesToClear.forEach(function(child) {
                            child.clear();
                        });
                    }
                };

                node.children.forEach(function(child) {
                    wrapper.wrapAll(child);
                });
            }
        };

        wrapper.__test = {
            comparePropToElemByName: comparePropToElemByName,
            equalArrays: equalArrays,
            equalListElems: equalListElems,
            checkListElemKeys: checkListElemKeys
        };

        return wrapper;
    });

    yangUtils.factory('yinParser', function ($http, syncFact, constants, arrayUtils, pathUtils) {
        var augmentType = 'augment';
        var path = './assets';

        var Node = function(id, name, type, module, namespace, parent, nodeType, moduleRevision) {
            this.id = id;
            this.label = name;
            this.localeLabel = 'YANGUI_'+name.toUpperCase();
            this.type = type;
            this.module = module;
            this.children = [];
            this.parent = parent;
            this.nodeType = nodeType;
            this.namespace = namespace;
            this.moduleRevision = moduleRevision;

            this.allChildrenCount = function() {
                var count = 0;
                var cnt = function(node) {
                    count = count + node.children.length;

                    node.children.forEach(function(child) {
                        cnt(child);
                    });
                };
                cnt(this);
                alert(count);
            };

            this.appendTo = function(parentNode) {
                parentNode.children.push(this);
            };

            this.deepCopy = function deepCopy() {
                var copy = new Node(this.id, this.label, this.type, this.module, this.namespace, null, this.nodeType, this.moduleRevision);
                this.children.forEach(function(child) {
                    var childCopy = child.deepCopy();
                    childCopy.parent = copy;
                    copy.children.push(childCopy);
                });
                return copy;
            };

            this.getChildrenByNodeType = function(nodeType) {
                if (nodeType instanceof Array) {
                    return this.children.filter(function(child){
                        return nodeType.indexOf(child.nodeType) > -1;
                    });
                } else {
                    return this.children.filter(function(child){
                        return child.nodeType === nodeType;
                    });
                }
            };

            this.getChildren = function(type, name, nodeType, property) {
                var filteredChildren = this.children.filter(function(item) {
                    return (name ? name === item.label : true) && (type ? type === item.type : true) && (nodeType ? nodeType === item.nodeType : true);
                });

                if(property) {
                    return filteredChildren.filter(function(item) {
                        return item.hasOwnProperty(property);
                    }).map(function(item) {
                        return item[property];
                    });
                } else {
                    return filteredChildren;
                }
            };

        };

        var Augmentation = function(node) {
            this.node = node;
            this.path = (node.path ? node.path : []);

            this.apply = function(nodeList) {
                var targetNode = this.getTargetNodeToAugment(nodeList);

                if(targetNode) {
                    this.node.children.forEach(function(child) {
                        child.appendTo(targetNode);
                    });
                } else {
                    console.warn('can\'t find target node for augmentation '+this.getPathString());
                }
            };

            this.getTargetNodeToAugment = function(nodeList) {
                return pathUtils.search({children: nodeList}, this.path.slice());
            };

            this.getPathString = function() {
                return this.path.map(function (elem) {
                    return elem.module+':'+elem.name;
                }).join('/');
            };

        };

        var parentTag = function(xml){
            if (xml.get(0).tagName.toLowerCase() === 'module') {
                return xml.get(0);
            } else {
                return parentTag(xml.parent());
            }
        };

        var parseYang = function parseYang(yinPath, callback, errorCbk) {
            var yangParser = new YangParser();

            $http.get(path+yinPath).success(function (data) {
                var rootModule = $($.parseXML(data).documentElement).attr('name'),
                    rootNamespace = $($.parseXML(data)).find('namespace').attr('uri'),
                    rootModuleRevision = $($.parseXML(data)).find('revision').attr('date');

                yangParser.setCurrentModule(rootModule);
                yangParser.setCurrentNamespace(rootNamespace);
                yangParser.setModuleRevision(rootModuleRevision);
                yangParser.parse($.parseXML(data).documentElement, null, false);

                yangParser.sync.waitFor(function() {
                    callback(yangParser.getRoots(), yangParser.getAugments());
                });
            }).error(function () {
                console.warn('can\'t find module: '+yinPath);
                errorCbk();
                return null;
            });
        };

        var YangParser = function() {
            this.currentModule = null;
            this.currentNamespace = null;
            this.rootNodes = [];
            this.nodeIndex = 0;
            this.sync = syncFact.generateObj();

            this.moduleRevision = null;
            
            this.getRoots = function() {
                return this.rootNodes.filter(function(node) {
                    return node.type !== augmentType;
                });
            };

            this.getAugments = function() {
                return this.rootNodes.filter(function(node) {
                    return node.type === augmentType;
                }).map(function(augNode) {
                    return new Augmentation(augNode);
                });
            };

            this.setCurrentModule = function(module) {
                this.currentModule = (module ? module : null);
            };

            this.setCurrentNamespace = function(namespace) {
                if(namespace) {
                    var namespaceArray = namespace.split(':');

                    namespaceArray.splice(0,1);
                    this.currentNamespace = namespaceArray.join('-');
                } else {
                    this.currentNamespace = null;
                }
            };

            this.setModuleRevision = function(moduleRevision) {
                this.moduleRevision = (moduleRevision ? moduleRevision : null);
            };

            this.getNamespace = function(namespace) {
                if(namespace) {
                    var namespaceArray = namespace.split(':');

                    namespaceArray.splice(0,1);
                    return namespaceArray.join('-');
                } else {
                    return null;
                }
            };

            this.createNewNode = function(name, type, parentNode, nodeType, namespace, revision) {
                var node = null;

                if(parentNode) {
                    node = new Node(this.nodeIndex++, name, type, this.currentModule, namespace !== null ? namespace : parentNode.namespace, parentNode, nodeType, revision !== null ? revision : parentNode.moduleRevision);
                    parentNode.children.push(node);
                } else {
                    node = new Node(this.nodeIndex++, name, type, this.currentModule, this.currentNamespace, parentNode, nodeType, this.moduleRevision);
                    this.rootNodes.push(node);
                }

                return node;
            };

            this.parse = function(xml, parent, setGlobalVariables) {
                var self = this;

                $(xml).children().each(function(_, item) {
                    var prop = item.tagName.toLowerCase();
                    if(self.hasOwnProperty(prop)) {
                        self[prop](item, parent, setGlobalVariables);
                    } else {
                        // self.parse(this, parent);
                    }
                });
            };

            this.leaf = function(xml, parent, setGlobalVariables) {
                var type = 'leaf',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                var node = this.createNewNode(name, type, parent, nodeType, namespace, revision);
                this.parse(xml, node, setGlobalVariables);
            };

            this['leaf-list'] = function(xml, parent, setGlobalVariables) {
                var type = 'leaf-list',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    namespace = null,
                    revision = null,
                    node;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                node = this.createNewNode(name, type, parent, nodeType, namespace, revision);
                this.parse(xml, node, setGlobalVariables);
            };

            this.container = function(xml, parent, setGlobalVariables) {   
                var type = 'container',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);
                
                if($(xml).children().length === 0) { //if empty add as element
                    this.createNewNode(name, type, parent, nodeType, namespace, revision);
                }
                else {
                    var node = this.createNewNode(name, type, parent, nodeType, namespace, revision);
                    this.parse(xml, node, setGlobalVariables);
                }
            };

            this.choice = function(xml, parent, setGlobalVariables) {
                var type = 'choice',
                    name = $(xml).attr('name'),
                    self = this,
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = null,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                node = this.createNewNode(name, type, parent, nodeType, namespace, revision);

                /*$(xml).children('case').each(function() {
                    self._case(this, node, setGlobalVariables);
                });*/
                this.parse(xml, node, setGlobalVariables);
            };

            this.case = function(xml, parent, setGlobalVariables) {
                var type = 'case',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = null,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                node = this.createNewNode(name, type, parent, nodeType, namespace, revision);

                this.parse(xml, node, setGlobalVariables);
            };

            this.list = function(xml, parent, setGlobalVariables) {
                var type = 'list',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = null,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                node = this.createNewNode(name, type, parent, nodeType, namespace, revision);

                this.parse(xml, node, setGlobalVariables);
            };

            
            this.key = function (xml, parent, setGlobalVariables) {
                var type = 'key',
                    name = $(xml).attr('value'),
                    nodeType = constants.NODE_ALTER,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);
                
                this.createNewNode(name, type, parent, nodeType, namespace, revision);
            };

            this.description = function (xml, parent, setGlobalVariables) {
                var type = 'description',
                    name = $(xml).children('text:first').text(),
                    nodeType = constants.NODE_ALTER,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                this.createNewNode(name, type, parent, nodeType, namespace, revision);
            };

            this._grouping = function(xml, parent, groupingName, setGlobalVariables) {
                var self = this;

                $(xml).children('grouping[name=\''+groupingName+'\']').each(function() {
                    self.parse(this, parent, setGlobalVariables);
                });
            };

            this.uses = function(xml, parent, setGlobalVariables) {  
                var self = this,
                    $xml = $(xml),
                    name = $xml.attr('name'),
                    names = name.split(':'),
                    importObject;

                if (names[1] === undefined) { //same module
                    self._grouping(parentTag($xml), parent, names[0], false);
                }
                else { //different module

                    importObject = self._import(parentTag($xml), names[0]);

                    if ( importObject.moduleName ) {

                        var reqId = self.sync.spawnRequest(importObject.moduleName);
                        $http.get(path+'/yang2xml/'+importObject.fileName+'.yang.xml').success(function (data) {
                            self._grouping($.parseXML(data).documentElement, parent, names[1], true);
                            self.sync.removeRequest(reqId);
                        });

                    }

                }
            };

            this._namespace = function(xml, setGlobalVariables){
                var $xml = $(xml),
                    namespace = null;

                if ( setGlobalVariables ) {

                    namespace = $(parentTag($xml)).find('namespace').attr('uri');

                    if(namespace) {
                        var namespaceArray = namespace.split(':');

                        namespaceArray.splice(0,1);
                        namespace = namespaceArray.join('-');
                    }

                } 

                return namespace;
            };

            this._revision = function(xml, setGlobalVariables){
                var $xml = $(xml),
                    revision = null;

                if ( setGlobalVariables ) {

                    revision = $(parentTag($xml)).find('revision').attr('date');

                    if ( !revision ) {
                        revision = null;
                    }

                }

                return revision;
            };

            this._import = function(xml, prefixName) {

                var self = this, 
                    importTagModuleName,
                    revisionDate,
                    importObject = {};
                    

                $(xml).children('import').each(function() {
                    var importTag = $(this),
                        prefix = $(importTag.children('prefix[value=\''+prefixName+'\']'));
                    
                    importTagModuleName = prefix.parent().attr('module');

                    if ( importTagModuleName ) {
                        revisionDate = importTag.children('revision-date').attr('date');
                        return false;
                    } 
                });


                if ( revisionDate ) {

                    /*var url = path+'/yang2xml/'+ importTagModuleName + '@' + revisionDate +'.yang.xml';

                    $.ajax({
                        url: url,
                        type: 'GET',
                        async: false
                    })
                    .done(function() { 
                        importObject = {
                            moduleName: importTagModuleName,
                            revisionDate: revisionDate,
                            fileName: importTagModuleName + '@' + revisionDate
                        };
                    }).fail(function() { 
                        importObject = {
                            moduleName: importTagModuleName,
                            revisionDate: revisionDate,
                            fileName: importTagModuleName
                        };
                    });*/

                    importObject = {
                        moduleName: importTagModuleName,
                        revisionDate: revisionDate,
                        fileName: importTagModuleName
                    };

                } else {
                    importObject = {
                        moduleName: importTagModuleName,
                        revisionDate: revisionDate,
                        fileName: importTagModuleName
                    };
                }

                return importObject;
            };

            this.augment = function(xml, parent, setGlobalVariables) {  
                var type = augmentType,
                    nodeType = constants.NODE_ALTER,
                    self = this,
                    prefixConverter = function (prefix) {
                        return self._import(parentTag($(xml)), prefix).moduleName;
                    },
                    pathString = $(xml).attr('target-node'),
                    path = pathUtils.translate(pathString, prefixConverter, this.currentModule),
                    augmentRoot = null,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                augmentRoot= this.createNewNode(pathString, type, null, nodeType, namespace, revision);
                augmentRoot.path = path;
                this.parse(xml, augmentRoot, setGlobalVariables);
            };

            /*this.when = function(xml, parent) {  
                var type = 'when',
                    name = $(xml).attr('condition'),
                    nodeType = constants.NODE_CONDITIONAL,
                    node = this.createNewNode(name, type, parent, nodeType),
                    self = this,
                    prefixConverter = function (prefix) {
                        return self._import(parentTag($(xml)), prefix).moduleName;
                    },
                    getConditionResult = function(condition) {
                        var firstElement = new ELement(-1, condition);
                            //condition = '( ../connected = true and ../connected = true ) and ( ../connected = true and ../connected = true )';
                            //firstElement = parentthesisParser(condition, firstElement, 0);

                        firstElement = parseEqualCondition(firstElement);

                        return [firstElement];
                    },
                    ELement = function(startPosition, condition){
                                this.startPosition = startPosition;
                                this.value = '';
                                this.children = [];
                                this.condition = condition;
                    },
                    parentthesisParser = function(string, parent, startPosition){
                        var element;
                        for (var i = startPosition; i < string.length; i++){
                            if(string[i] === '(') {
                                element = new ELement(i);
                                parent.children.push(element);
                                i = parentthesisParser(string, element, i + 1);
                            } else {
                                if(string[i] === ')') {
                                    parent.endPosition = i;
                                    parent.condition = string.substring(parent.startPosition + 1 ,parent.endPosition);
                                    //this.parserAndOr(parent);
                                    return i;
                                }
                            }
                        }

                        return parent;
                    },
                    parseEqualCondition = function(conditionChild){
                        var equalStatement = conditionChild.condition.split('='),
                            conditionNode = null;

                        conditionChild.equalValue = equalStatement[1].replace(' ','');
                        conditionChild.equalStatementPath = equalStatement[0].replace(' ','');
                        conditionChild.status = false;
                        conditionChild.pathElems = pathUtils.translate(conditionChild.equalStatementPath, prefixConverter, null);

                        return conditionChild;
                    };
                    // parserAndOr = function(parent){
                    //     if ( conditionChild.condition.indexOf('and') < 0 && name.indexOf('or') < 0 ) {
                    //     }
                    // };

                    node.parseCondition = function(){
                        //parent.nodeType = constants.NODE_UI_DISPLAY_HIDE;
                        if ( name.indexOf('(') < 0 ) {
                            if ( name.indexOf('and') < 0 && name.indexOf('or') < 0 ) {
                                console.log(this.conditionTree.children[0]);
                                parseEqualCondition(this.conditionTree.children[0]);
                            }
                        }

                    };

                    node.conditionTree = {
                        children : getConditionResult(name),
                        node: node,
                    };
            };*/

            this.rpc = function(xml, parent, setGlobalVariables) {
                var type = 'rpc',
                    name = $(xml).attr('name'),
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = null,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                node = this.createNewNode(name, type, parent, nodeType, namespace, revision);

                this.parse(xml, node, setGlobalVariables);
            };

            this.input = function(xml, parent, setGlobalVariables) {
                var type = 'input',
                    name = 'input',
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = null,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                node = this.createNewNode(name, type, parent, nodeType, namespace, revision);

                this.parse(xml, node, setGlobalVariables);
            };

            this.output = function(xml, parent, setGlobalVariables) {
                var type = 'output',
                    name = 'output',
                    nodeType = constants.NODE_UI_DISPLAY,
                    node = null,
                    namespace = null,
                    revision = null;

                namespace = this._namespace(xml, setGlobalVariables);
                revision = this._revision(xml, setGlobalVariables);

                node = this.createNewNode(name, type, parent, nodeType, namespace, revision);

                this.parse(xml, node, setGlobalVariables);
            };
        };

        return {
            parse: parseYang,
            __test: {
                path: path,
                parentTag: parentTag,
                yangParser: new YangParser(),
                Augmentation: Augmentation
            }
        };
    });


    yangUtils.factory('apiConnector', function ($http, syncFact, arrayUtils, pathUtils, custFunct, Base64, $window) {
        var connector = {};
        var encoded = 'Basic ' + Base64.encode($window.sessionStorage.odlUser + ':' + $window.sessionStorage.odlPass);
        var apiAuthConfig = {withCredentials: true, headers: {'Authorization': encoded}};

        var apiPathElemsToString = function(apiPathElems) {
            var s = apiPathElems.map(function(elem) {
                return elem.toString();
            }).join('');

            return s.slice(0, -1);
        };

        var SubApi = function(pathTemplateString, operations) {
            this.node = null;
            this.pathTemplateString = pathTemplateString;
            this.pathArray = [];
            this.operations = operations;
            this.custFunct = [];
            
            this.hasSetData = function() {
                return this.node !== null && this.pathArray.length > 0;
            };

            this.setNode = function(node) {
                this.node = node;
            };

            this.setPathArray = function(pathArray) {
                this.pathArray = pathArray;
            };

            this.buildApiRequestString = function() {
                return apiPathElemsToString(this.pathArray);
            };

            this.addCustomFunctionality = function(label, callback) {
                var funct = custFunct.createNewFunctionality(label, this.node, callback);

                if(funct) {
                    this.custFunct.push(funct);
                }
            };
        };

        var parseApiPath = function(path) {
            var moduleIndexStart = path.lastIndexOf('/'),
                revisionIndexStart = path.lastIndexOf('(');
            return ({module: path.slice(moduleIndexStart + 1, revisionIndexStart), revision: path.slice(revisionIndexStart + 1, -1)});
        };

        connector.processApis = function(apis, callback) {
            var processedApis = [],
                sync = syncFact.generateObj();

            apis.forEach(function(api) {
                var data = parseApiPath(api.path),
                    reqID = sync.spawnRequest(api.path),
                    apiObj = {
                        module: data.module,
                        revision: data.revision
                    };

                $http.get(api.path, apiAuthConfig).success(function(data) {
                    var subApis = [];

                    data.apis.forEach(function(subApi) {
                        var operations = subApi.operations.map(function(item) {
                                return item.method;
                            }),
                            subApiElem = new SubApi(subApi.path, operations);

                        subApis.push(subApiElem);
                    });

                    apiObj.basePath = data.basePath;
                    apiObj.subApis = subApis;

                    sync.removeRequest(reqID);
                }).error(function() {
                    sync.removeRequest(reqID);
                });

                processedApis.push(apiObj);
            });

            sync.waitFor(function() {
                callback(processedApis);
            });
        };

        var getRootNodeByPath = function(module, nodeLabel, nodeList) {
            var selNode = arrayUtils.getFirstElementByCondition(nodeList, function(item) {
                return item.module === module && item.label === nodeLabel; //&& item.revision === api.revision; //after revisions are implemented
            });

            if(!selNode) {
                console.warn('cannot find root node for module',module,'label',nodeLabel);
            } 
            return selNode;
        };

       connector.linkApisToNodes = function(apiList, nodeList) {
            return apiList.map(function(api) {

                api.subApis = api.subApis.map(function(subApi) {
                    var pathArray = pathUtils.translate(subApi.pathTemplateString, null, null),
                        rootNode = pathArray && pathArray.length > 1 ? getRootNodeByPath(pathArray[1].module, pathArray[1].name, nodeList) : null;

                    if(rootNode && pathArray) {
                        subApi.setNode(pathArray.length > 2 ? pathUtils.search(rootNode, pathArray.slice(2)) : rootNode);
                        subApi.setPathArray(pathArray);
                    }

                    return subApi;
                }).filter(function(subApi) {
                    return subApi.hasSetData();
                });

                return api;
            });
        };

        connector.createCustomFunctionalityApis = function(apis, module, revision, pathString, label, callback) {
            apis = apis.map(function(item) {
                if((module ? item.module === module : true) && (revision ? item.revision === revision : true)) {

                    item.subApis = item.subApis.map(function(subApi) {
                        if(subApi.pathTemplateString === pathString) {
                            subApi.addCustomFunctionality(label, callback);
                        }

                        return subApi;
                    });
                }

                return item;
            });
        };

        connector.__test = {
            apiPathElemsToString: apiPathElemsToString,
            parseApiPath: parseApiPath,
            getRootNodeByPath: getRootNodeByPath,
            SubApi: SubApi
        };

        return connector;
    });

    yangUtils.factory('yangUtils', function ($http, yinParser, nodeWrapper, reqBuilder, syncFact, apiConnector, constants, pathUtils, YangUtilsRestangular, Base64, $window) {

        var utils = {};
        var encoded = 'Basic ' + Base64.encode($window.sessionStorage.odlUser + ':' + $window.sessionStorage.odlPass);
        //console.log("BASE64 ENCODED WITHIN YANGUI:", encoded);


        utils.exportModulesLocales = function(modules) {
            var obj = {},
                localeNodes = ['leaf','list','container','choice', 'leaf-list','rpc','input','output'];

            var process = function process(node) {
                if(localeNodes.indexOf(node.type) >= 0 && obj.hasOwnProperty(node.localeLabel) === false) {
                    obj[node.localeLabel] = node.label;
                }

                node.children.forEach(function(child) {
                    process(child);
                });
            };

            modules.forEach(function(module) {
                process(module);
            });

            return JSON.stringify(obj, null, 4);
        };

        utils.generateNodesToApis = function(callback, errorCbk) {
            var allRootNodes = [],
                apiModules = [],
                topLevelSync = syncFact.generateObj(),
                reqApis = topLevelSync.spawnRequest('apis'),
                reqAll = topLevelSync.spawnRequest('all');
            var apisUrl = '/apidoc/apis/';
            $http.get(YangUtilsRestangular.configuration.baseUrl+apisUrl, apiAuthConfig).success(function (data) {
                apiConnector.processApis(data.apis, function(result) {
                    apiModules = result;
                    topLevelSync.removeRequest(reqApis);
                });
            }).error(function(result) {
                console.error('Error getting API data from :'+YangUtilsRestangular.configuration.baseUrl+apisUrl+':'+result);
                topLevelSync.removeRequest(reqApis);
            });

            var restconfModulesUrl = '/restconf/modules/';
            $http.get(YangUtilsRestangular.configuration.baseUrl+restconfModulesUrl, apiAuthConfig).success(function (data) {
                allRootNodes = utils.processModules(data.modules, function(result) {
                    allRootNodes = result;
                    topLevelSync.removeRequest(reqAll);
                });
            }).error(function(result) {
                console.error('Error getting API data:',result);
                topLevelSync.removeRequest(reqAll);
            });

            topLevelSync.waitFor(function () {
                try {
                    callback(apiConnector.linkApisToNodes(apiModules, allRootNodes), allRootNodes);
                } catch(e) {
                    errorCbk(e);
                    throw(e); //do not lose debugging info
                }
            });
            
        };

        utils.generateApiTreeData = function(apis, callback){

            var dataTree = [],
                sync = syncFact.generateObj();

            dataTree = apis.map(function(item, indexApi){

                var getApisAndPath = function(item, indexApi){
                    var childrenArray = [];

                    item.subApis.map(function(itemSub, indexSubApi){
                        var childIndex = 0;

                        var fillPath = function(path, array, indexSubApi, indexApi, itemSub){
                            var existElemIndex = null,
                                existElem,
                                arrayIndex = null,
                                newElem = function(path, array){
                                    var element = {};

                                    element.label = path[childIndex - 1].name;
                                    element.identifier = path[childIndex - 1].identifierName !== undefined ? ' {'+path[childIndex - 1].identifierName+'}': '';
                                    element.children = [];
                                    array.push(element);
                                    return array;
                                };
                            
                            childIndex++;
                            if ( childIndex - 1 < path.length ){
                                if ( array.length > 0 ) {
                                    existElem = false;

                                    array.map(function(arrayItem, index){
                                        if( arrayItem.label === path[childIndex - 1].name ){
                                            existElem = true;
                                            existElemIndex = index;
                                        }
                                    });
                                    if( !existElem ) {
                                        array = newElem(path,array);
                                    }
                                } else {
                                    array = newElem(path,array);
                                }
                                arrayIndex = existElemIndex !== null ? existElemIndex : array.length - 1;
                                var pathChildren = fillPath(path, array[arrayIndex].children, indexSubApi, indexApi, itemSub);
                                if ( !pathChildren.length ){
                                    array[arrayIndex].indexApi = indexApi;
                                    array[arrayIndex].indexSubApi = indexSubApi;
                                    //array[arrayIndex].subApi = itemSub;
                                }
                                array[arrayIndex].children = pathChildren;
                                return array;
                            } else {
                                return [];
                            }
                        };
                            
                        childrenArray = fillPath(itemSub.pathArray, childrenArray, indexSubApi, indexApi, itemSub);

                    });
                    
                    return childrenArray;
                },
                apisPath = getApisAndPath(item, indexApi);

                return { 
                    label: item.module + ' rev.' + item.revision,
                    children: apisPath
                };
            });

            dataTree.forEach(function(item){
                var findSupApi = function(treeElem) {
                        var apiInfo = null;
                        if(treeElem.hasOwnProperty('indexApi') && treeElem.hasOwnProperty('indexSubApi') && apis[treeElem.indexApi].subApis[treeElem.indexSubApi].operations.indexOf('PUT') > -1) {
                            apiInfo = { api: treeElem.indexApi, subApi: treeElem.indexSubApi };
                        } else if (treeElem.children.length && apiInfo === null) {
                            var searchResult = null;
                            for(var i = 0; i < treeElem.children.length && apiInfo === null; i++) {
                                apiInfo = findSupApi(treeElem.children[i]);
                            }
                        }
                        return apiInfo;
                    },
                    apiInfo = findSupApi(item),
                    checkAPIValidity = function(api, subApi) {
                        var fillDummyData = function(node) {
                                var leaves = node.getChildren('leaf'),
                                    filled = false,
                                    childFilled,
                                    i;

                                if(leaves.length && node.type === 'list') {
                                    node.addListElem();
                                    node.actElemStructure.getChildren('leaf')[0].value = '0';
                                    filled = true;
                                } else if(leaves.length) {
                                    leaves[0].value = '0';
                                    filled = true;
                                } else if (leaves.length === 0 && node.type === 'list'){
                                    childFilled = false;
                                    for(i = 0; i < node.actElemStructure.children.length && !childFilled; i++) {
                                        childFilled = fillDummyData(node.actElemStructure.children[i]);
                                    }
                                    filled = childFilled;
                                } else {
                                    childFilled = false;
                                    for(i = 0; i < node.children.length && !childFilled; i++) {
                                        childFilled = fillDummyData(node.children[i]);
                                    }
                                    filled = childFilled;
                                }

                                return filled;
                            },
                            requestData = {},
                            requestPath = api.basePath+'/'+subApi.buildApiRequestString(),
                            reqID = sync.spawnRequest(requestPath);

                        fillDummyData(subApi.node);
                        subApi.node.buildRequest(reqBuilder, requestData);

                        $http({method: 'PUT', url: requestPath, data: requestData, headers: { "Content-Type": "application/yang.data+json"}}).
                              success(function(data) {
                                  // console.debug('sending',reqBuilder.resultToString(requestData),'to',requestPath,'- success'); //TODO entry deletion?
                                  sync.removeRequest(reqID);
                              }).
                              error(function(data, status) {
                                  // console.debug('sending',reqBuilder.resultToString(requestData),'to',requestPath,'- error');
                                  item.toRemove = true;
                                  sync.removeRequest(reqID);
                              }
                        );
                    };

                if(apiInfo) {
                    checkAPIValidity(apis[apiInfo.api] ,apis[apiInfo.api].subApis[apiInfo.subApi]);
                } else {
                    item.toRemove = true;
                }
            });

            sync.waitFor(function() {
                callback(dataTree.filter(function(item) {
                    return !item.hasOwnProperty('toRemove');
                }));
            });
        };

        utils.processModules = function(loadedModules, callback) {
            var rootNodes = [],
                augments = [],
                syncModules = syncFact.generateObj();

                loadedModules.module.forEach(function(module) {
                    var reqId = syncModules.spawnRequest(module.name);
                    
                    yinParser.parse('/yang2xml/'+module.name+'.yang.xml', function(nodes, moduleAugments) {
                        if(nodes.length) {
                            rootNodes = rootNodes.concat(nodes);
                        }

                        if(moduleAugments.length) {
                            augments = augments.concat(moduleAugments);
                        }

                        syncModules.removeRequest(reqId);
                    }, function() {
                        syncModules.removeRequest(reqId);
                    });
                });

            syncModules.waitFor(function() {
                console.info(rootNodes.length+' modules loaded',rootNodes);
                console.info(augments.length+' augments loaded',augments);

                var sortedAugments = augments.sort(function(a, b) {
                    return a.path.length - b.path.length;
                });

                sortedAugments.map(function(elem) {
                    elem.apply(rootNodes);
                });

                callback(rootNodes.map(function(node) {
                    var copy = node.deepCopy();
                    
                    nodeWrapper.wrapAll(copy);
                    return copy;
                }));
            });
        };


        utils.buildRequest = function(node) {
            var request = reqBuilder.createObj();
            node.buildRequest(reqBuilder, request);
            return request.flows; //TODO use REST API explorer when it will be available
        };

        utils.getRequestString = function(node) {
            var request = reqBuilder.createObj(),
                reqStr = '';

            node.buildRequest(reqBuilder, request);

            if(request && $.isEmptyObject(request) === false) {
                reqStr = reqBuilder.resultToString(request);
            }
            return reqStr;
        };

        utils.transformTopologyData = function(data) {
            var links = [],
                nodes = [],
                getNodeIdByText = function getNodeIdByText(inNodes, text) {
                    var nodes = inNodes.filter(function(item, index) {
                            return item.label === text;
                        }),
                        nodeId;

                    if(nodes.length > 0 && nodes[0]) {
                        nodeId = nodes[0].id;
                    }else{
                        return null;
                    }

                    return nodeId;
                };


            if(data['network-topology'] && data['network-topology'].topology.length) {
                var topoData = data['network-topology'].topology[0],
                    nodeId = 0,
                    linkId = 0;

                nodes = topoData.hasOwnProperty('node') ? topoData.node.map(function(nodeData) {
                    return {'id': (nodeId++).toString(), 'label': nodeData["node-id"], group: 'switch',value:20,title:'Name: <b>' + nodeData["node-id"] + '</b><br>Type: Switch'};
                }) : [];

                links = topoData.hasOwnProperty('link') ? topoData.link.map(function(linkData) {
                    var srcId = getNodeIdByText(nodes, linkData.source["source-node"]),
                        dstId = getNodeIdByText(nodes, linkData.destination["dest-node"]),
                        srcPort = linkData.source["source-tp"],
                        dstPort = linkData.destination["dest-tp"];
                    if(srcId!=null && dstId!=null){
                        return {id: (linkId++).toString(), 'from' : srcId, 'to': dstId, title:'Source Port: <b>' + srcPort + '</b><br>Dest Port: <b>'+dstPort+'</b>'};
                    }
                }) : [];
            }

            return {nodes: nodes, links: links};
        };

        utils.__test = {
        };

        return utils;

    });

    yangUtils.factory('constants', function(){
        return  {
            NODE_UI_DISPLAY : 1,
            NODE_ALTER: 2,
            NODE_CONDITIONAL: 3,
        };
    });
});
