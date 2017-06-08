/*************************************************************
* To run this favelet on a different server, update line 105.
* Modified by Jane Norrie 2015.01.30, Version 1 - initial
* Modified by Jane Norrie 2015.02.24, Version 2 - fix for FF and IE11
* Modified by Jane Norrie 2015.04.01, Version 3 - send errors to console & allow more than results window simultaneously
* Modified by Jane Norrie 2015.04.07, Version 4 - strip out tab character before showing HTML syntax
**************************************************************/

function start(myDocument) {

    //Instead of window. for global we use aA. so that we don't have
    //variables that might get mixed in with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = [];

    //VAR SPECIFIC TO THIS FAVELET
    aA.t='';  //selection
    aA.s='';  //source code

    //for frames outside domain
    //so we can report them
    aA.framemsg='';
    aA.fi=0;

    //STANDARD ACROSS FAVELETS & Recursive: 
    //checkFrames calls function that checks the page.
    //Then, it calls itself for each doc in a frame
    //It returns aA with all the aA.variables counted up
    aA = checkFrames(document, aA);

    //STANDARD - reporting once done recursing through frames
    provideMessage(aA);

    //open results page
    if (aA.t.length > 0) { resultsPage(myDocument, aA); }
}

function checkFrames(myDocument,aA) {

    //run showImageMaps check for current document which might 
    //have frames or images or both
    aA = partialSource(myDocument, aA);

    //run checkFrames for each frame's document if there
    //are any frames
    var frametypes=new Array('frame','iframe','ilayer');
    for (var x=0;x<frametypes.length;x++) {
        var myframes=myDocument.getElementsByTagName(frametypes[x]);
        for (var y=0;y<myframes.length;y++) {
            try {
                if (aA.t === '') {
                    checkFrames(myframes[y].contentWindow.document,aA);
                }
            } catch(e) {
                //errors are stored in aA too
                aA.framemsg=aA.framemsg + "\n" +  myframes[y].src;
                aA.fi=aA.fi + 1;
            }
        }
    }

    return aA;
}

function provideMessage(aA) {

    //standard for frames
    var alertmessage = '';

    if (aA.t.length === 0) {
        alertmessage = "No text selected. Could not show source.";
    }

    //standard
    if (alertmessage.length > 0) { alert(alertmessage); }
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + s4()  + s4() + s4() + s4() + s4() + s4();
}

function resultsPage(myDocument, aA) {

    try {

        var lw = window.open('', guid());

        if (lw !== null) {

            if (lw.opener === null) {
                lw.opener = window;
            }

            //IE has no interface for DOM additions to pages
            //that were created using DOM, but we still use 
            //DOM for most things and convert back to a string
            //here using innerHTML
            lw.document.open();
            lw.document.write("<html><head><title>Partial source code for: \'" + myDocument.location + "\'</title>");
            lw.document.write('<link rel="Stylesheet" href="scripts/css/generic.css" type="text/css"></head>');
            //lw.document.write('<link rel="Stylesheet" href="http://section508testing.org/tools/jane/css/generic.css" type="text/css"></head>');
            lw.document.write('<body><a href="javascript:window.close();">[close window]</a>');
            lw.document.write("<h1>Selection</h1>");
            lw.document.write("<div style=\"border:1px solid #000;padding:1em\">"+aA.t+"</div>");
            lw.document.write("<h2>Generated source code</h2>");
            lw.document.write("<pre style=\"background-color:#f5f5dc;border:1px solid #000;padding:1em;word-wrap: break-word;\">"+aA.s+"</pre>");
            lw.document.write("</body></html>");
            lw.document.close();
            lw.focus();

        } else {
            alert('Popup windows for frame report blocked.');
        }

    } catch(err) {
        console.log("An error occurred while trying to open the report window.\n" + err.message);
        return false;
    }
}

function partialSource(mydocument, aA) {

    //Remove anything added last time favelet ran
    //Create object just to check length of the properties array
    var jt_generic_obj = mydocument.createElement("var");
    var ie7 = false;
    if (jt_generic_obj.attributes.length > 0) {
        ie7 = true;
    }

    var myExpress1 = /SKIPstAdded.*/;
    var spanLive=mydocument.getElementsByTagName('span');

    //static (span won't change - don't use spanLive while editing page)
    var spans = [];
    for (var j = 0; j < spanLive.length; j++) {
        spans[j] = spanLive[j];
    }

    for (var s = 0;s < spans.length; s++) {
        if (((ie7 && spans[s].attributes && spans[s].attributes.id.specified) || 
            (!(ie7) && spans[s].hasAttribute('id'))) && myExpress1.test(spans[s].getAttribute('id'))) {
            spans[s].parentNode.removeChild(spans[s]);
        }
    }

    try{

        var q = getSelectionHtml();

        if (q) {
            aA.t=q;
            aA.s=(q.replace(/</gi,'&lt;').replace(/>/gi,'&gt;').replace(/\t/g, ''));
        }
       
    }
    catch(e) {
        console.log("Error thrown in partialSource method:\n" + e.message);
    }
    
    return aA;

} //end function

function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            //alert("rangeCount=" + sel.rangeCount)
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;

        }
    }
    return html;
}

start(document);

// Feb 2013
// checks for tabindex="-1" up the tree
// outlines intended target
// Dec 2014 - jmn
// Code cleanup - standardize
