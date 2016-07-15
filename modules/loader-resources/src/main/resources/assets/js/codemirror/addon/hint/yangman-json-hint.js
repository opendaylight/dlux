// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    var WORD = /[<<\w$]+/, RANGE = 500;
    CodeMirror.registerHelper("hint", "anyword", function(editor, options) {
        var acList = [],
            word = options && options.word || WORD,
            cur = editor.getCursor(), 
            curLine = editor.getLine(cur.line),
            end = cur.ch, 
            start = end,
            paramList = editor.data.parameterListObj.list;
            
        function forEachParam(arr, f, fParam) {
            for (var i = 0, e = arr.length; i < e; ++i){ 
                f(arr[i].name, fParam);
            };
        }
        
        
        function maybeAdd(possibleWord, word) {
            var pw = '<<' + possibleWord + '>>';
            if (pw.lastIndexOf(word, 0) == 0 && !arrayContains(acList, pw)) 
                acList.push(pw);
        }
        
        function arrayContains(arr, item) {
            if (!Array.prototype.indexOf) {
                var i = arr.length;
                while (i--) {
                    if (arr[i] === item) {
                        return true;
                    }
                }
                return false;
            }
            return arr.indexOf(item) != -1;
        }
        
        
        options.completeSingle = false;
        
        while (start && word.test(curLine.charAt(start - 1))) 
            --start;
        
        var curWord = curLine.slice(start, end);
        
        if(curWord.length > 1){
            forEachParam(paramList, maybeAdd, curWord);
        }
        
        
        
        return {list: acList, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
    });
});
