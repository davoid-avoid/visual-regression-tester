const visualRegression = require("visual-regression-tester")

let exampleSpec = {
  testName: "example-spec",
  testScript: [
    {
      type: "url",
      url: "",
      screenshotName: "Google Homepage"
    },
    {
      type: "interactElementCSS",
      el: "div[class*='o3j99'] > a:nth-of-type(1)",
      screenshotName: "About Page"
    },
    {
      type: "exampleExpansionScroll",
      scrollTag: "html",
      scrollClass: 'spa',
      measureTag: "html",
      measureClass: "spa",
      screenshotName: "About Page Scroll"
    }

    /* further steps that can be used:

    type: "interactElementID",
    el: "target-id"

    type: "sleep",
    duration: ms

    type: "interactElementMulti",
    els: [
      {
        first: "id",
        after: "id"
      },
      {
        firstCSS: "css selection first",
        afterCSS: "css selection after"
      }
    ]
    //any combination of first and after types can be used on a step
    the reason there is a first and after is because much of time you want to do things like open and close a series of modals or popups, taking a shot of each

    type: "enterIframe",
    id: "iframe id" //optional
    //use to recontextualize into an iframe if your app is iframe wrapped. All subsequent steps will view the iframe as the context for interaction
    
    //any step can be given a screenshotName: 'string' which will take a shot of that step. If none is specified, no shots will be taken of that step

    */
   
  ]
}

visualRegression.runTest(exampleSpec);
