/*************************************************************
* To run this favelet on a different server, update line 112.*
**************************************************************/

function start(myDocument) {

    // Instead of window. for global
    // we use aA. so that we don't have
    // variables that might get mixed in
    // with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = new Array();

    //VAR SPECIFIC TO THIS FAVELET
    aA.z=0;  //
    aA.y=0;  // number of errors
    aA.w=0;  // number of stylesheets
    aA.wy=0; // number of style tags

    // VAR STANDARD ACROSS FAVELETS
    // for id of added spans
    // so we can removed them
    aA.idi=0;

    // for frames outside domain
    // so we can report them
    aA.framemsg='';
    aA.fi=0;

    // STANDARD ACROSS FAVELETS & Recursive: 
    // checkFrames calls function that checks the page.
    // Then, it calls itself for each doc in a frame
    // It returns aA with all the aA.variables counted up
    aA = checkFrames(document, aA);

    //STANDARD - reporting once done recursing through frames
    provideMessage(aA);
    //open results page
    //resultsPage(myDocument, aA);
}

function checkFrames(myDocument,aA) {

    //run showImageMaps check for current document which might 
    //have frames or images or both
    aA = toggleCss(myDocument, aA);

    //run checkFrames for each frame's document if there
    //are any frames
    var frametypes=new Array('frame','iframe','ilayer');
    for (var x=0;x<frametypes.length;x++) {
        var myframes=myDocument.getElementsByTagName(frametypes[x]);
        for (var y=0;y<myframes.length;y++) {
            try {
                 checkFrames(myframes[y].contentWindow.document,aA);
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

}

function resultsPage(myDocument, aA) {

    try {

        var lw = window.open('','lw');

        if (lw != null) {

            if (lw.opener == null) {
                lw.opener = window;
            }

            // IE has no interface for DOM additions to pages
            // that were created using DOM, but we still use 
            // DOM for most things and convert back to a string
            // here using innerHTML
            lw.document.open();
            lw.document.write("<html><head><title>Disable CSS Results</title>");
            lw.document.write('<link rel="Stylesheet" href="scripts/css/generic.css" type="text/css"></head>');
            //lw.document.write('<link rel="Stylesheet" href="http://cloudservices.dhs.gov/oastsupport/FaveletScripts/css/generic.css" type="text/css"></head>');
            lw.document.write('<body><a href="javascript:window.close();">[close window]</a>');
            lw.document.write("<h1>Disable CSS information for \'" + myDocument.title + "\'</h1><hr/>");

            //put page specific code here

            lw.document.write("</body></html>");
            lw.document.close();
            lw.focus();

        } else {
            alert('Popup windows for frame report blocked.');
        }

    } catch(err) {
        alert('Window is not available: ' + '\nBe sure to close the frame report window each time it opens.');
        return false;
    }
}


function toggleCss(mydocument, aA) {

    // Remove anything added last time favelet ran
    // Create object just to check length of the properties array
    var jt_generic_obj = mydocument.createElement("var");
    var ie7 = false;
    if (jt_generic_obj.attributes.length > 0) {
        ie7 = true;
    }

    var myExpress1 = /hstAdded.*/;
    var spanLive=mydocument.getElementsByTagName('span');

    //static (span won't change - don't use spanLive while editing page)
    var spans = new Array();
    for (var z = 0; z < spanLive.length; z++) {
        spans[z] = spanLive[z];
    }

    for (var s = 0;s < spans.length; s++) {
        if (((ie7 && spans[s].attributes && spans[s].attributes.id.specified) || 
            (!(ie7) && spans[s].hasAttribute('id'))) && myExpress1.test(spans[s].getAttribute('id'))) {
            spans[s].parentNode.removeChild(spans[s]);
        }
    }

    //remove inline styles
    var a = mydocument.getElementsByTagName("*");
    for (var i = 0; i < a.length; i++) {
        el = a[i];
        if (el.hasAttribute("style")) {
            el.style.cssText = "";
            aA.wy += 1;
        }
    }

    //remove all referenced stylesheets
    if (mydocument.styleSheets.length > 0) {
        cs = !mydocument.styleSheets[0].disabled;
        for (var i = 0; i < mydocument.styleSheets.length; i++) {
            mydocument.styleSheets[i].disabled = cs;
            aA.w += 1;
        }
        cs = true;
    }

    return aA;

} // end function

start(document);
