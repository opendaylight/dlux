/**
 * Created by dakuzma on 25. 8. 2015.
 */
require.config({
    packages: [{
        name: "codemirror",
        location: "app/yangui/assets/js/codemirror",
        main: "lib/codemirror"
    }],
    paths: {
        'codeMirror-showHint' : 'app/yangui/assets/js/codemirror/addon/hint/show-hint',
        'codeMirror-yanguiJsonHint' : 'app/yangui/assets/js/codemirror/addon/hint/yangui-json-hint',
        'codeMirror-javascriptMode' : 'app/yangui/assets/js/codemirror/mode/javascript/javascript',
        'codeMirror-matchBrackets' : 'app/yangui/assets/js/codemirror/addon/edit/matchbrackets'
    },
    shim:{
        'codeMirros_showHint': ['codemirror'],
        'codeMirros_javascriptHint': ['codemirror'],
        'codeMirror_javascriptMode': ['codemirror'],
        'codeMirror_matchBrackets': ['codemirror']
    }
});

define(['app/yangui/yangui.module']);
