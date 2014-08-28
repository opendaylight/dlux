({
    appDir: "build/",
    mainConfigFile: "src/main.js",
    baseUrl: "src",
    dir: "target/generated-resources/pages",
    removeCombined: true,
    findNestedDependencies: true,
    modules: [
      {
        name: "main",
        exclude: [
          "angular",
          "angularAMD",
          "ngload",
          "ui-bootstrap",
          "domReady",
          "Restangular",
          "underscore",
          "angular-ui-router",
          "angular-css-injector",
          "angular-cookies",
          "angular-translate",
          "angular-translate-loader-static-files",
          "jquery",
          "footable",
          "d3",
          "vis",
          "ocLazyLoad"
        ]
      }
    ]

})
