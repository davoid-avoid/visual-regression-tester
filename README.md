# Visual-Regression-Tester

Standalone visual regression testing lib

requirements:

webdriver-manager must be installed globally, and be running
(npm i webdriver-manager -g, webdriver-manager start)

serve your application in a 2nd cli

run this application in a third cli

To run:

add this to your package.json scripts:

"visual-regression-tester": "npm explore visual-regression-tester -- npm run runtest --"

run with npm run visual-regression-tester

additional parameters:

npm run visual-regression-tester -- [options]

options:

--params.screenshots=all (take screenshots of all steps)

--params.width=X
--params.height=X
(set browser width and height)

--suite=X
(run a subset of test specs)

# Documentation

https://www.notion.so/Visual-Regression-Testing-Suite-400b0374731a4734bcd7f770555b36d6

