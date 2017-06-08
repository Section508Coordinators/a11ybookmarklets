// Modified by Jane Norrie 2015.03.24, version 1 initial version (new page)
// Modified by Jane Norrie 2015.04.01, version 2 code cleanup

function start(myDocument) {

    // Instead of window. for global
    // we use aA. so that we don't have
    // variables that might get mixed in
    // with site-level js

    //STANDARD ACROSS FAVELETS
    var aA = [];

    // VAR STANDARD ACROSS FAVELETS
    // for id of added spans
    // so we can removed them
    aA.idi=0;

    // keep track of alt tags for each frame
    aA.frames = [];

    // for frames outside domain
    // so we can report them
    aA.framemsg='';
    aA.fi=0;

    // STANDARD ACROSS FAVELETS & Recursive: 
    // checkFrames calls function that checks the page.
    // Then, it calls itself for each doc in a frame
    // It returns aA with all the aA.variables counted up
    aA = checkFrames(myDocument, aA);
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

function inArray(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
    return false;
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
            pageAdd.style.border="2px solid navy";

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
                    thisArea.appendChild(mydocument.createTextNode('alt=\"\"'));
                    pageAdd.appendChild(thisArea);
                    wy=wy+1;
                } else {
                    // ALT
                    thisArea=myArea.cloneNode(true);
                    thisArea.style.color="navy";
                    thisArea.appendChild(mydocument.createTextNode('alt="' + img_els[j].alt + '"'));
                    pageAdd.appendChild(thisArea);
                    w=w+1;
                }

                // put a red border around the the image
                img_els[j].style.padding='3px';
                img_els[j].style.border='2px solid red'; 

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
                img_els[j].style.border='2px solid red'; 
            }

            // identify title attributes
            if ((ie7 && img_els[j].attributes.title.specified) || (!(ie7) && img_els[j].hasAttribute('title'))) {
                thisArea=myArea.cloneNode(true);
                thisArea.appendChild(mydocument.createTextNode(' title="' + img_els[j].title + '"'));
                pageAdd.appendChild(thisArea);
            }

            // identify aria - taken from revealAria.js and modified slightly
            if(img_els[j].attributes) {
                for(var x = 0; x < img_els[j].attributes.length; x++) {
                    var myA = img_els[j].attributes[x].nodeName.toLowerCase();
                    var myExpress = /aria.*/;
                    if ((!ie7 || (ie7 && img_els[j].attributes[x].specified)) && 
                        ((myExpress.test(myA) && img_els[j].getAttribute(myA)!==null) || (myA=="tabindex" && img_els[j].getAttribute(myA)=="-1") || (myA=="role" && img_els[j].getAttribute(myA)!==null))) {
                        
                        thisArea=myArea.cloneNode(true);
                        thisArea.appendChild(mydocument.createTextNode(' ' + myA + '="' + img_els[j].getAttribute(myA) + '"'));

                        //check for items with ids
                        var value_is_id_attributes = new Array('aria-controls','aria-describedby','aria-flowto','aria-labelledby','aria-labeledby','aria-owns','aria-activedescendant');
                        // all can have a list of ids, except aria-activedescendant

                        if (inArray(value_is_id_attributes,myA)) {
                      
                          //report on the attribute
                          //get array of ids
                          var id_array = img_els[j].getAttribute(myA).split(" ");
      
                          for (var mapi=0;mapi<id_array.length;mapi++) {
                                var myAid=id_array[mapi];

                                //alert(mydocument.getElementById(myAid)); 
                                if (mydocument.getElementById(myAid) !== undefined && mydocument.getElementById(myAid) !== null) {
                                    //get object
                                    var myIdTarget=mydocument.getElementById(myAid);
                                    myIdTarget.style.border="2px dotted navy";
                                    myIdTarget.style.backgroundColor="#ffffff";

                                    //myTextNode2 = mydocument.createTextNode('<'+myIdTarget.tagName.toLowerCase()+' id="'+myAid+'">');
                                    myTextNode2 = mydocument.createTextNode('id="'+myAid+'"');

                                    //create message
                                    var mySpan2 = mydocument.createElement('span');
                                    mySpan2.setAttribute("id", ("ariastAddedid" + j));

                                    //style message
                                    mySpan2.style.color='navy';
                                    mySpan2.style.fontSize="x-small";
                                    mySpan2.style.fontWeight="bold";
                                    mySpan2.style.backgroundColor="#ffff33";
                                    mySpan2.style.border="1px solid #000000";
                                    mySpan2.style.padding="2px";
                                    mySpan2.style.marginRight="3px";

                                    //append attribute info
                                    mySpan2.appendChild(myTextNode2);

                                    //place message for id's object
                                    var firstthing = myIdTarget.childNodes[0];
                                    if (firstthing === undefined) {firstthing = null;}
                                    myIdTarget.insertBefore(mySpan2,firstthing);
                                      
                                } else {
                                    thisArea.appendChild(mydocument.createTextNode(' [NO MATCH ID] '));
                                }
                            }

                        } 
                        pageAdd.appendChild(thisArea);
                    }
                }
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
