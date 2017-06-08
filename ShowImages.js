
// Modified by Jane Norrie 2015 version 2

function start(myDocument) {

    // Instead of window. for global
    // we use aA. so that we don't have
    // variables that might get mixed in
    // with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = [];

    // keep track of alt tags for each frame
    aA.frames = [];

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
    aA = showImages(myDocument, aA);

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
                 console.log("Check frames error: " + e.message + ", frame.src: " + myframes[y].src);
                 aA.framemsg=aA.framemsg + '\n' +  myframes[y].src;
                 aA.fi=aA.fi + 1;
            }
        }
    }

    return aA;
}

function provideMessage(aA) {

    var y_pl = '';
    var msg  = '';

    for (var i = 0; i < aA.frames.length; i++) {

        if (aA.frames[i].y==1) {
            y_pl='';
        } else {
            y_pl='s';
        }

        //alert("y=" + aA.frames[i].y);
        if (aA.frames[i].y !== 0) {
            if (i>0 && msg !== '') { msg += '\n\n'; }
            msg += aA.frames[i].src + '\n' + aA.frames[i].y + ' image' + y_pl + ' without alt attributes!';
        }
        
    }

    // standard
    if (msg !== '') { alert(msg); }
}

function isBlank(s){
    
    var E = /(\s)/;
    var res = true;
    for (var i = 0; i < s.length; i++) {
        res=res && E.test(s.charAt(i));
    }
    return res;
}   

function showImages(mydocument, aA) {

    var y = 0;   // no alt
    var w = 0;   // valid alt tags
    var wy = 0;  // null alt

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

    //create span with special id so we can remove it later
    var pageAdd = mydocument.createElement('span');
    pageAdd.id = "aistAdded" + (aA.idi++);

    //give the span style that is common to all messages
    pageAdd.style.fontSize = "x-small";
    pageAdd.style.fontFamily = "arial,sans-serif";
    pageAdd.style.fontWeight = "bold";
    pageAdd.style.backgroundColor = "#FFFF00";
    pageAdd.style.padding = "1px";

    var img_els = mydocument.getElementsByTagName('img');
    
    if (img_els.length > 0) {

        for(var j = 0; j < img_els.length; j++) {

            //create span with special id so we can remove it later
            var pageAdd = mydocument.createElement('span');
            pageAdd.id = "aistAdded" + (aA.idi++);

            //give the span style that is common to all messages
            pageAdd.style.fontSize="x-small";
            pageAdd.style.fontFamily="arial,sans-serif";
            pageAdd.style.fontWeight="bold";
            pageAdd.style.backgroundColor="#FFFF00";
            pageAdd.style.color="navy";
            pageAdd.style.padding = "1px";

            //give the span the image map intro
            //pageAdd.appendChild(mydocument.createTextNode('image alt: '));

            // create the span element for areas  
            var myArea = mydocument.createElement('span');
            myArea.style.fontSize="x-small";
            myArea.style.fontWeight="bold";
            myArea.style.backgroundColor="#f5deb3";
                  
            if ((ie7 && img_els[j].attributes.alt.specified) || (!(ie7) && img_els[j].hasAttribute('alt'))) {
                if (isBlank(img_els[j].alt)) {
                    // NULL ALT
                    thisArea=myArea.cloneNode(true);
                    thisArea.style.color="navy";
                    thisArea.style.border="2px solid navy";
                    thisArea.appendChild(mydocument.createTextNode('alt=\"\"'));
                    pageAdd.appendChild(thisArea);
                    wy=wy+1;
                } else {
                    // ALT
                    thisArea=myArea.cloneNode(true);
                    thisArea.style.color="navy";
                    thisArea.style.border="2px solid navy";
                    thisArea.appendChild(mydocument.createTextNode('alt="' + img_els[j].alt + '"'));
                    pageAdd.appendChild(thisArea);
                    w=w+1;
                }

                // put a red border around the the image
                img_els[j].style.padding='3px';
                img_els[j].style.border='2px dotted red'; 

            } 
            else {
                // NO ALT
                thisArea=myArea.cloneNode(true);
                thisArea.style.color="red";
                thisArea.appendChild(mydocument.createTextNode('NO alt!'));
                pageAdd.appendChild(thisArea);
                y=y+1;

                // put a red border around the the image
                img_els[j].style.padding='3px';
                img_els[j].style.border='2px dotted red'; 
            }
                                        
            //place item before image in question
            img_els[j].parentNode.insertBefore(pageAdd, img_els[j]);
     
        } // end for each img tag

    } // end if img exists

    var oFrame = {src:mydocument.location, y:y, w:w, wy:wy};
    aA.frames.push(oFrame);
    return aA; 

} // end function

start(document);
