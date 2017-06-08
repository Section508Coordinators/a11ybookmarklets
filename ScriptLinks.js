/*************************************************************
* To run this favelet on a different server, update line 122, 130 and 142.
* Modified by Jane Norrie 2015.02.20 version 1 - initial
* Modified by Jane Norrie 2015.03.30 version 2 - code cleanup
**************************************************************/

function start(myDocument) {

    //Instead of window. for global we use aA. so that we don't have
    //variables that might get mixed in with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = new Array();

    //VAR SPECIFIC TO THIS FAVELET
    aA.z=0;  //number of javascript links
    aA.y=0;  //number null target links
    aA.w=0;  //number of target links

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
}

function checkFrames(myDocument,aA) {

    //run showImageMaps check for current document which might 
    //have frames or images or both
    aA = scriptLinks(myDocument, aA);

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

    //standard for frames
    var alertmessage = '';

    if (aA.z+aA.y+aA.w == 0) {
        alertmessage = "[No links found that contain JavaScript or have target attributes set!]";
    } else {
        alertmessage = "Links containing JavaScript in href: " + aA.z + "\n" +
                       "Links with onclick or 'new window' events*: " + aA.y + "\nLinks with target attributes**: " + aA.w + "\n\n" +
                       "*These links may also contain text commonly found in scripting to open new windows [e.g. window.open, popup, window]\n" +
                       "**targets: _top and _self are excluded.";
    }

    //standard
    alert(alertmessage);
}

function cE(a)
{
    var a2 = [];
    for (var k = 0; k < a.length; ++k) {
        a2.push(a[k]);
    }
    return a2;
}

function scriptLinks(mydocument, aA) {

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
    var spans = new Array();
    for (var j = 0; j < spanLive.length; j++) {
        spans[j] = spanLive[j];
    }

    for (var s = 0;s < spans.length; s++) {
        if (((ie7 && spans[s].attributes && spans[s].attributes.id.specified) || 
            (!(ie7) && spans[s].hasAttribute('id'))) && myExpress1.test(spans[s].getAttribute('id'))) {
            spans[s].parentNode.removeChild(spans[s]);
        }
    }

    var c = cE( mydocument.getElementsByTagName( "A" ) );
    for (var k = 0; k < c.length; ++k) {

        var l = c[k];
        if (/^javascript:/i.test(l.href))
        {
            //l.innerHTML+="<img src=\"http://localhost:81/scripts/css/script.png\" alt='script' border='0'>" 
            l.innerHTML+="<img src=\"favelets/css/script.png\" alt='script' border='0'>";
            l.style.border = "2px solid #ff0000"; 
            l.style.display = "inline-block";
            ++aA.z;
        }
        if ((/#$/i.test(l.href)&&l.onclick)||(/window\.open|popup|window/i.test(l.onclick))||(/window\.open/i.test(l.href))) //&&(l.href.length<2)
        {
            //l.innerHTML+="<img src=\"http://localhost:81/scripts/css/warning1.gif\" alt='warning' border='0'>" 
            l.innerHTML+="<img src=\"favelets/css/warning1.gif\" alt='script' border='0'>";
            l.style.border = "2px solid #ff0000";
            l.style.display = "inline-block";
            ++aA.y;
        }
            
        //if ((l.target)&&(l.target!="_top"||l.target!="_self"))
        if ((l.target)&&(l.target!="_top")) {

            if ((l.target)&&(l.target!="_self")){
                //l.innerHTML+=" [target="+l.target+"] "
                //l.innerHTML+="<img src=\"http://localhost:81/scripts/css//target.gif\" alt='target' border='0'>";
                l.innerHTML+="<img src=\"favelets/css/target.gif\" alt='script' border='0'>";
                l.style.border = "2px solid #ff0000";
                l.style.display = "inline-block";
                ++aA.w;
            }
        }

    }
    
    return aA;

} //end function

start(document);

// Feb 2013
// checks for tabindex="-1" up the tree
// outlines intended target
// Dec 2014 - jmn
// Code cleanup - standardize
