

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
    aA.w=0;  // total lang tags
    aA.wy=0; //

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
}

function checkFrames(myDocument,aA) {

    //run showImageMaps check for current document which might 
    //have frames or images or both
    aA = showLang(myDocument, aA);

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

    // standard for frames
    var alertmessage = '';

    var fi_pl='s';
    if (aA.fi==1){fi_pl=''};

    if (aA.fi>0) {
        alertmessage += "\n" + aA.fi + " frame" + fi_pl + " outside the domain could not be checked:\n" + aA.framemsg;
        // standard
        alert(alertmessage);
    } else {
        if (aA.w == 0) {
            alert("No lang attributes found.")
        }
    }

}

function showLang(mydocument, aA) {

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

    var spn = "<span style=\'color:navy;font:medium bold;background:#f5deb3\'><strong>";
    var a = mydocument.getElementsByTagName("*");

    for (var i = 0; i < a.length; i++) {
        el = a[i];
        if (el.hasAttribute("lang") || el.hasAttribute("hfreflang")) {

            aA.w += 1; // number of lang attributes
            lg=el.lang;
            hl=el.hreflang;
            var tn=el.tagName;

            if(tn=='HTML'||tn=='BODY') {
                mydocument.body.innerHTML=spn+'['+tn.toLowerCase()+':'+lg+']</stong></span>'+mydocument.body.innerHTML;
            }
            else
            if(tn=='IMG'||tn=='INPUT') {
                el.insertAdjacentHTML('afterEnd',spn+'['+tn.toLowerCase()+':'+lg+']');
            }
            else
            if(tn=='A') {
                el.innerHTML=spn+'['+tn.toLowerCase()+':'+hl+']</strong></span>'+el.innerHTML+spn+'[/'+tn.toLowerCase()+']</span>';
            }

            try{
                el.innerHTML=spn+'['+tn.toLowerCase()+':'+el.lang+']</strong></span>'+el.innerHTML+spn+'[/'+tn.toLowerCase()+']</span>';
            }
            catch(e){ el.insertAdjacentHTML('afterEnd',spn+'['+tn.toLowerCase()+':'+lg+']'); }

        }
    }

    return aA;

} // end function

start(document);
