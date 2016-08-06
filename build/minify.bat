@ECHO ON
REM Starting to minify JS & CSS files ...

@ECHO OFF
REM don't watch the sausage being made

REM the folder
SET TOOLS=%~DP0
SET SRC=%TOOLS%\..\src
SET OUT=%TOOLS%\..\release

rd /S /Q %OUT%
md "%OUT%\"

REM Combine JS & CSS files into one file
type "%SRC%\chart_common.js" "%SRC%\chart_base.js" "%SRC%\axis_chart.js" "%SRC%\pie_chart.js" "%SRC%\radar_chart.js" > "%OUT%\temp.visual_lib.js"
type "%SRC%\web_common.js" "%SRC%\sandbox.js" "%SRC%\example.js" "%SRC%\property_window.js" "%SRC%\lib\jsoneditor.min.js" > "%OUT%\temp.web.js"
type "%SRC%\web.css" "%SRC%\lib\jsoneditor.min.css" > "%OUT%\temp.web.css"

REM Compress with YUI Compressor  
java -jar "%TOOLS%\yuicompressor-2.4.7.jar" -o "%OUT%\temp.visual_lib.min.js" "%OUT%\temp.visual_lib.js"
java -jar "%TOOLS%\yuicompressor-2.4.7.jar" -o "%OUT%\temp.web.min.js" "%OUT%\temp.web.js"
java -jar "%TOOLS%\yuicompressor-2.4.7.jar" -o "%OUT%\web.min.css" "%OUT%\temp.web.css"

REM do it because YUI has error minifying the base64.js
type "%OUT%\temp.web.min.js" "%SRC%\lib\base64.js" > "%OUT%\web.min.js"

REM add the version header
type "%SRC%\versionHeader.js" "%OUT%\temp.visual_lib.min.js" > "%OUT%\visual_lib.min.js"

REM Delete temporary files
del "%OUT%\temp.visual_lib.js"
del "%OUT%\temp.visual_lib.min.js"
del "%OUT%\temp.web.js"
del "%OUT%\temp.web.min.js"
del "%OUT%\temp.web.css"

REM Index Files
copy "%SRC%\index_release.html" "%OUT%\index.html"
copy "%SRC%\example_release.html" "%OUT%\example.html"

REM copy other files
md "%OUT%\img"
copy "%SRC%\lib\img\jsoneditor-icons.png" "%OUT%\img\jsoneditor-icons.png"

REM extra files
copy "%SRC%\temp_release.html" "%OUT%\temp.html"
copy "%SRC%\temp_chart.js" "%OUT%\temp_chart.js"

@ECHO ON
