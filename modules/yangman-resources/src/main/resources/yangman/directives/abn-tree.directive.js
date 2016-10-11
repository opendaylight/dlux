define(['angular'], function (angular) {
    'use strict';

    angular.module('app.yangman').directive('abnApiTree', [
        '$timeout', 'constants', function ($timeout, constants) {
            return {
                restrict: 'E',
                templateUrl: 'src/app/yangman/views/directives/abn-tree.tpl.html',
                replace: true,
                scope: {
                    treeData: '=',
                    onSelect: '&',
                    initialSelection: '@',
                    treeControl: '=',
                    treeRows: '=',
                },
                link: function (scope, element, attrs) {
                    var expandAllParents,
                        expandLevel,
                        forAllAncestors,
                        forEachBranch,
                        getParent,
                        n,
                        onTreeDataChange,
                        selectBranch,
                        selectedBranch,
                        tree;

                    if (attrs.iconExpand == null) {
                        attrs.iconExpand = constants.ICON_EXPAND_ADD;
                    }
                    if (attrs.iconCollapse == null) {
                        attrs.iconCollapse = constants.ICON_COLLAPSE_REMOVE;
                    }
                    if (attrs.iconLeaf == null) {
                        attrs.iconLeaf = constants.ICON_KEYBOARD_ARROW_RIGHT;
                    }
                    if (attrs.expandLevel == null) {
                        attrs.expandLevel = constants.EXPAND_LEVEL_THREE;
                    }
                    expandLevel = parseInt(attrs.expandLevel, 10);
                    if (!scope.treeData) {
                        return;
                    }
                    if (scope.treeData.length == null) {
                        if (scope.treeData.label != null) {
                            scope.treeData = [scope.treeData];
                        } else {
                            return;
                        }
                    }
                    forEachBranch = function (f) {
                        var do_f,
                            root_branch,
                            _i,
                            _len,
                            _ref,
                            _results;

                        do_f = function (branch, level) {
                            var child,
                                _i,
                                _len,
                                _ref,
                                _results;

                            f(branch, level);
                            if (branch.children != null) {
                                _ref = branch.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    _results.push(do_f(child, level + 1));
                                }
                                return _results;
                            }
                        };
                        _ref = scope.treeData;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            root_branch = _ref[_i];
                            _results.push(do_f(root_branch, 1));
                        }
                        return _results;
                    };
                    selectedBranch = null;
                    selectBranch = function (branch) {
                        if (!branch) {
                            if (selectedBranch != null) {
                                selectedBranch.selected = false;
                            }
                            selectedBranch = null;
                            return;
                        }

                        if (selectedBranch != null) {
                            selectedBranch.selected = false;
                        }
                        branch.selected = true;
                        selectedBranch = branch;
                        expandAllParents(branch);
                        if (branch.onSelect != null) {
                            return $timeout(function () {
                                return branch.onSelect(branch);
                            });
                        } else {
                            if (scope.onSelect != null) {
                                return $timeout(function () {
                                    return scope.onSelect({
                                        branch: branch,
                                    });
                                });
                            }
                        }

                    };
                    scope.user_clicks_branch = function (branch) {

                        scope.tree_rows.forEach(function (item){
                            item.branch.selected = false;
                        });

                        if (branch === selectedBranch) {
                            branch.selected = true;
                        }

                        return selectBranch(branch);
                    };

                    getParent = function (child) {
                        var parent;
                        parent = void 0;
                        if (child.parent_uid) {
                            forEachBranch(function (b) {
                                if (b.uid === child.parent_uid) {
                                    return parent = b;
                                }
                            });
                        }
                        return parent;
                    };
                    forAllAncestors = function (child, fn) {
                        var parent;
                        parent = getParent(child);
                        if (parent != null) {
                            fn(parent);
                            return forAllAncestors(parent, fn);
                        }
                    };
                    expandAllParents = function (child) {
                        return forAllAncestors(child, function (b) {
                            return b.expanded = true;
                        });
                    };

                    scope.expandedTree = false;
                    scope.expand_collapse_all_items = function (){

                        var expand = !scope.expandedTree ? true : false;

                        scope.tree_rows.forEach(function (child){
                            child.branch.expanded = expand;
                        });

                        scope.expandedTree = !scope.expandedTree;
                    };
                    scope.collapse_others = function (){
                        var parentId = null,
                            expandParent = function (parentId){
                                if ( parentId ) {
                                    scope.tree_rows.forEach(function (child){
                                        if ( child.branch.uid === parentId ) {
                                            child.branch.expanded = true;
                                            parentId = child.branch.parent_uid;

                                            if ( parentId ) {
                                                expandParent(parentId);
                                            }
                                        }
                                    });
                                }
                            };

                        scope.tree_rows.forEach(function (child){
                            if ( child.branch.selected ) {
                                parentId = child.branch.parent_uid;
                            }
                            child.branch.expanded = child.branch.selected ? child.branch.expanded : false;
                        });

                        if ( parentId ) {
                            expandParent(parentId);
                        }

                    };

                    scope.$watch(constants.TREE_ROWS, function () {
                        scope.treeRows = scope.tree_rows;
                        scope.$emit(constants.SET_SCOPE_TREE_ROWS, scope.treeRows);
                    });

                    scope.tree_rows = [];
                    onTreeDataChange = function () {
                        var add_branch_to_list,
                            root_branch,
                            _i,
                            _len,
                            _ref,
                            _results;

                        forEachBranch(function (b) {
                            if (!b.uid) {
                                return b.uid = '' + Math.random();
                            }
                        });
                        forEachBranch(function (b) {
                            var child,
                                _i,
                                _len,
                                _ref,
                                _results;

                            if (angular.isArray(b.children)) {
                                _ref = b.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    _results.push(child.parent_uid = b.uid);
                                }
                                return _results;
                            }
                        });
                        scope.tree_rows = [];
                        forEachBranch(function (branch) {
                            var child,
                                f;

                            if (branch.children) {
                                if (branch.children.length > 0) {
                                    f = function (e) {
                                        if (typeof e === 'string') {
                                            return {
                                                label: e,
                                                children: [],
                                            };
                                        } else {
                                            return e;
                                        }
                                    };
                                    return branch.children = (function () {
                                        var _i,
                                            _len,
                                            _ref,
                                            _results;

                                        _ref = branch.children;
                                        _results = [];
                                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                            child = _ref[_i];
                                            _results.push(f(child));
                                        }
                                        return _results;
                                    })();
                                }
                            } else {
                                return branch.children = [];
                            }
                        });
                        add_branch_to_list = function (level, branch, visible) {
                            var child,
                                child_visible,
                                tree_icon,
                                _i,
                                _len,
                                _ref,
                                _results;

                            if (branch.expanded == null) {
                                branch.expanded = false;
                            }
                            if (!branch.children || branch.children.length === 0) {
                                tree_icon = attrs.iconLeaf;
                            } else {
                                if (branch.expanded) {
                                    tree_icon = attrs.iconCollapse;
                                } else {
                                    tree_icon = attrs.iconExpand;
                                }
                            }
                            scope.tree_rows.push({
                                index: scope.tree_rows.length, // in template tracking by branch.uid, integer needed
                                level: level,
                                branch: branch,
                                label: branch.label,
                                tree_icon: tree_icon,
                                visible: visible,
                            });
                            if (branch.children != null) {
                                _ref = branch.children;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    child = _ref[_i];
                                    child_visible = visible && branch.expanded;
                                    _results.push(add_branch_to_list(level + 1, child, child_visible));
                                }
                                return _results;
                            }
                        };
                        _ref = scope.treeData;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            root_branch = _ref[_i];
                            _results.push(add_branch_to_list(1, root_branch, true));
                        }
                        return _results;
                    };
                    scope.$watch('treeData', onTreeDataChange, true);
                    if (attrs.initialSelection != null) {
                        forEachBranch(function (b) {
                            if (b.label === attrs.initialSelection) {
                                return $timeout(function () {
                                    return selectBranch(b);
                                });
                            }
                        });
                    }
                    n = scope.treeData.length;
                    forEachBranch(function (b, level) {
                        b.level = level;
                        return b.expanded = b.level < expandLevel;
                    });
                    if (scope.treeControl != null) {
                        if (angular.isObject(scope.treeControl)) {
                            tree = scope.treeControl;
                            tree.expand_all = function () {
                                return forEachBranch(function (b) {
                                    return b.expanded = true;
                                });
                            };
                            tree.collapse_all = function () {
                                return forEachBranch(function (b) {
                                    return b.expanded = false;
                                });
                            };
                            tree.get_first_branch = function () {
                                n = scope.treeData.length;
                                if (n > 0) {
                                    return scope.treeData[0];
                                }
                            };
                            tree.select_first_branch = function () {
                                var b;
                                b = tree.get_first_branch();
                                return tree.selectBranch(b);
                            };
                            tree.get_selected_branch = function () {
                                return selectedBranch;
                            };
                            tree.get_parent_branch = function (b) {
                                return getParent(b);
                            };
                            tree.select_branch = function (b) {
                                selectBranch(b);
                                return b;
                            };
                            tree.get_children = function (b) {
                                return b.children;
                            };
                            tree.select_parent_branch = function (b) {
                                var p;
                                if (b == null) {
                                    b = tree.get_selected_branch();
                                }
                                if (b != null) {
                                    p = tree.get_parent_branch(b);
                                    if (p != null) {
                                        tree.select_branch(p);
                                        return p;
                                    }
                                }
                            };
                            tree.add_branch = function (parent, new_branch) {
                                if (parent != null) {
                                    parent.children.push(new_branch);
                                    parent.expanded = true;
                                } else {
                                    scope.treeData.push(new_branch);
                                }
                                return new_branch;
                            };
                            tree.add_root_branch = function (new_branch) {
                                tree.add_branch(null, new_branch);
                                return new_branch;
                            };
                            tree.expand_branch = function (b) {
                                if (b == null) {
                                    b = tree.get_selected_branch();
                                }
                                if (b != null) {
                                    b.expanded = true;
                                    return b;
                                }
                            };
                            tree.collapse_branch = function (b) {
                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    b.expanded = false;
                                    return b;
                                }
                            };
                            tree.get_siblings = function (b) {
                                var p,
                                    siblings;

                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    p = tree.get_parent_branch(b);
                                    if (p) {
                                        siblings = p.children;
                                    } else {
                                        siblings = scope.treeData;
                                    }
                                    return siblings;
                                }
                            };
                            tree.get_next_sibling = function (b) {
                                var i,
                                    siblings;

                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    siblings = tree.get_siblings(b);
                                    n = siblings.length;
                                    i = siblings.indexOf(b);
                                    if (i < n) {
                                        return siblings[i + 1];
                                    }
                                }
                            };
                            tree.get_prev_sibling = function (b) {
                                var i,
                                    siblings;

                                if (b == null) {
                                    b = selectedBranch;
                                }
                                siblings = tree.get_siblings(b);
                                n = siblings.length;
                                i = siblings.indexOf(b);
                                if (i > 0) {
                                    return siblings[i - 1];
                                }
                            };
                            tree.select_next_sibling = function (b) {
                                var next;
                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    next = tree.get_next_sibling(b);
                                    if (next != null) {
                                        return tree.select_branch(next);
                                    }
                                }
                            };
                            tree.select_prev_sibling = function (b) {
                                var prev;
                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    prev = tree.get_prev_sibling(b);
                                    if (prev != null) {
                                        return tree.select_branch(prev);
                                    }
                                }
                            };
                            tree.get_first_child = function (b) {
                                var _ref;
                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                                        return b.children[0];
                                    }
                                }
                            };
                            tree.get_closest_ancestor_next_sibling = function (b) {
                                var next,
                                    parent;

                                next = tree.get_next_sibling(b);
                                if (next != null) {
                                    return next;
                                } else {
                                    parent = tree.get_parent_branch(b);
                                    return tree.get_closest_ancestor_next_sibling(parent);
                                }
                            };
                            tree.get_next_branch = function (b) {
                                var next;
                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    next = tree.get_first_child(b);
                                    if (next != null) {
                                        return next;
                                    } else {
                                        next = tree.get_closest_ancestor_next_sibling(b);
                                        return next;
                                    }
                                }
                            };
                            tree.select_next_branch = function (b) {
                                var next;
                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    next = tree.get_next_branch(b);
                                    if (next != null) {
                                        tree.select_branch(next);
                                        return next;
                                    }
                                }
                            };
                            tree.last_descendant = function (b) {
                                var last_child;
                                if (b == null) {
                                    // debugger;
                                }
                                n = b.children.length;
                                if (n === 0) {
                                    return b;
                                } else {
                                    last_child = b.children[n - 1];
                                    return tree.last_descendant(last_child);
                                }
                            };
                            tree.get_prev_branch = function (b) {
                                var parent,
                                    prev_sibling;

                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    prev_sibling = tree.get_prev_sibling(b);
                                    if (prev_sibling != null) {
                                        return tree.last_descendant(prev_sibling);
                                    } else {
                                        parent = tree.get_parent_branch(b);
                                        return parent;
                                    }
                                }
                            };
                            return tree.select_prev_branch = function (b) {
                                var prev;
                                if (b == null) {
                                    b = selectedBranch;
                                }
                                if (b != null) {
                                    prev = tree.get_prev_branch(b);
                                    if (prev != null) {
                                        tree.select_branch(prev);
                                        return prev;
                                    }
                                }
                            };
                        }
                    }
                },
            };
        },
    ]);


});
