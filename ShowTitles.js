// Modified by Jane Norrie 2015 version 2
// Modified by Jane Norrie 2015.04.06 version 3, remove the use of insertAdjacentHTML (not widely supported)

function start(myDocument) {

    // Instead of window. for global
    // we use aA. so that we don't have
    // variables that might get mixed in
    // with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = [];

    aA.frames = [];

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
    aA = checkFrames(myDocument, aA);

    //STANDARD - reporting once done recursing through frames
    provideMessage(aA);
}

function checkFrames(myDocument,aA) {

    //run showImageMaps check for current document which might 
    //have frames or images or both
    aA = doFaveletWork(myDocument, aA);

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

    var msg  = '';
    var noTitlesFound = 'No title attributes found';

    for (var i = 0; i < aA.frames.length; i++) {

        console.log(aA.frames[i].src + " " + aA.frames[i].hgroups);

        if (aA.frames[i].hgroups === 0) {
            if (aA.frames.length == 1) {
                msg += noTitlesFound;
            } else {
                if (i>0 && msg !== '') { msg += '\n\n'; }
                msg +=  aA.frames[i].src + '\n' + noTitlesFound;               
            }
        }
    }

    // standard  
    if (msg !== '') { alert(msg); }
}

function doFaveletWork(mydocument, aA) {

    var hgroups = 0;
     
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

    var eLive = mydocument.getElementsByTagName("*");
    
    //static (e won't change - don't use eLive while editing page)
    var e = [];
    for (var i=0; i<eLive.length;i++) 
    {
       e[i] = eLive[i];
    }   
   
    // create template span element that holds messages
    var span = mydocument.createElement('span');
    // default is navy
    span.style.color="navy";
    span.style.fontFamily="arial,sans-serif";
    span.style.fontSize="x-small";
    /*span.style.fontWeight="bold";*/
    span.style.backgroundColor="#f5deb3";
    span.style.padding="1px";
    span.style.border="2px dotted red";

    for (var i = 0; i < e.length; i++) {
       // EACH OBJECT
        if (e[i].title!=='') {
            // show title attribute value
            var titleSpan = span.cloneNode(true);
            titleSpan.id = "titleSpan" + i;
            titleSpan.appendChild(mydocument.createTextNode("Title: "+e[i].title));
            e[i].parentNode.insertBefore(titleSpan, e[i].nextSibling);
            hgroups=hgroups+1;
        }   
   
    }   

    var oFrame = {src:mydocument.location, hgroups:hgroups};
    aA.frames.push(oFrame); 
    return aA;

} // end function

start(document);
