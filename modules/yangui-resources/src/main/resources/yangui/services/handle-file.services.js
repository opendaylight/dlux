define(['app/yangui/yangui.module'], function(yangui) {

    yangui.register.service('HandleFileService', function(){
        var f = {};

        f.downloadFile = function(filename, data, format, charset, successCbk, errorCbk){
            try{
                var blob = new Blob([data], { type:"application/"+format+"; "+charset+";"});
                downloadLink = angular.element("<a></a>");

                downloadLink.attr('href', window.URL.createObjectURL(blob));
                downloadLink.attr('download', filename);
                downloadLink[0].click();
                successCbk();
            }catch(e) {
                errorCbk(e);
            }
        };

        return f;
    });

});