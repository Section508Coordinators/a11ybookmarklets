// Modified by Jane Norrie 2015.03.27, version 1 
// Modified by Jane Norrie 2015.03.31, version 2 - code cleanup

function start(myDocument) {

    // Instead of window. for global
    // we use aA. so that we don't have
    // variables that might get mixed in
    // with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = [];

    //VAR SPECIFIC TO THIS FAVELET
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

    resultsPage(myDocument);
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

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4()  + s4() + s4() + s4() + s4() + s4();
}

function resultsPage(mydocument) {

  try {

    // remove the script from the new page otherwise the alert
    // message will displayed stating 'no heading elements were found'
    var scripts = mydocument.getElementsByTagName('head')[0].getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.indexOf("ToggleCss_v2.0.js") > -1) {
            scripts[i].parentNode.removeChild(scripts[i]);
        }
    }

    var lw = window.open('', guid());

    if (lw !== null) {

        if (lw.opener === null) {
            lw.opener = window;
        }

        // IE has no interface for DOM additions to pages
        // that were created using DOM, but we still use 
        // DOM for most things and convert back to a string
        // here using innerHTML
        lw.document.write(getDocumentHtmlText(mydocument));
        lw.document.close();
        lw.document.focus();

        lw.document.title = "WATR: " + mydocument.title;

    } else {
        alert("Popup windows for frame report blocked.");
    }
      
  } catch(err) {
      console.log("An error occurred while trying to open the report window.\n" + err.message);
      return false;
  }
}

function getDocumentHtmlText(mydocument) {

  var html = 
      getDocType(mydocument) + "\n" +
      "<html>\n" +
          "<head>" + mydocument.getElementsByTagName('head')[0].innerHTML + "</head>\n" +
          mydocument.body.outerHTML +
      "</html>";
   
  return html;   
}

function getDocType(mydocument) {

    var doctype = '';
    if (mydocument.doctype !== null) {
        doctype =
            '<!DOCTYPE ' +
                mydocument.doctype.name +
                (mydocument.doctype.publicId ? ' PUBLIC "' + mydocument.doctype.publicId + '"' : '') +
                (!mydocument.doctype.publicId && mydocument.doctype.systemId ? ' SYSTEM' : '') +
                (mydocument.doctype.systemId ? ' "' + mydocument.doctype.systemId + '"' : '') +
            '>';
    }
    return doctype;
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
    var spans = [];
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
        for (var j = 0; j < mydocument.styleSheets.length; j++) {
            mydocument.styleSheets[j].disabled = cs;
            aA.w += 1;
        }
        cs = true;
    }

    return aA;

} // end function

start(document);
