define([],
function () {
    'use strict';

    return  {
        NODE_UI_DISPLAY: 1,
        NODE_ALTER: 2,
        NODE_CONDITIONAL: 3,
        NODE_RESTRICTIONS: 4,
        NODE_LINK: 5,
        NODE_LINK_TARGET: 6,
        LOCALE_PREFIX: 'YANGUI_FORM_',
        EV_SRC_MAIN: 'EV_SRC_MAIN',
        EV_FILL_PATH: 'EV_FILL_PATH',
        EV_LIST_CHANGED: 'EV_LIST_CHANGED',
        EV_PARAM_EDIT_SUCC: 'EV_PARAM_EDIT_SUCC',
        MPPREFIX: 'yang-ext:mount',
        NULL_DATA: null,
        ADVANCED_FILTERING_TYPES: {
            'number': ['=', '>', '>=', '<', '<=', 'range'],
            'string': ['=', 'contains', 'regExp'],
        },
        ALLOWED_LEAF_TYPES_FOR_FILTER: ['string', 'uint32', 'uint8', 'decimal64', 'int16', 'int32', 'int64', 'int8',
                                        'uint16', 'uint64', 'union', 'bits', 'leafref', 'identityref'],
        ALLOWED_NODE_TYPES_FOR_FILTER: ['case', 'choice', 'container', 'input', 'leaf', 'output', 'rpc'],
    };

});
