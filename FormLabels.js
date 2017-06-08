// modified by Jane Norrie 2015.3.30, version 2

function start(myDocument) {

    //Instead of window. for global we use aA. so that we don't have
    //variables that might get mixed in with site-level js
    var aA=[];

    // num of errors
    aA.er=0;
    // num form controls with errors
    aA.erFC=0;

    // record if any form controls have more than one error 
    aA.morethanone=false;  

    aA.z=0;
    aA.x=0;

    //for id of added spans so we can removed them
    aA.idi=0;

    // keep track of label/fieldset/legend tags for each frame
    aA.frames = [];//

    //for frames outside domain so we can report them
    aA.framemsg='';
    aA.fi=0;

    //recursive through frames
    aA = checkFrames(myDocument,aA);

    // Reporting
    provideMessage(aA);
}

function checkFrames(myDocument,aA) {

    //run forms check for current document which might have frames or forms or both
    aA = showFieldsetLabels(myDocument,aA);

    //run topic check for each frame's document if there are any frames
    var frametypes=new Array('frame','iframe','ilayer');
    for (var g=0;g<frametypes.length;g++) {
        var myframes=myDocument.getElementsByTagName(frametypes[g]);
        for (var h=0;h<myframes.length;h++) {
            try {
                 checkFrames(myframes[h].contentWindow.document,aA);
            } catch(e) {
                 //errors are stored in aA too
                 aA.framemsg=aA.framemsg + '\n' +  myframes[h].src;
                 aA.fi=aA.fi + 1;
            }
        }
    }
    return aA;
}

function provideMessage(aA) {

    var msg  = '';
    var noFormLabels = 'No label/fieldset/legend elements found';

    for (var i = 0; i < aA.frames.length; i++) {

        if (aA.frames[i].count === 0) {
            if (aA.frames.length == 1) {
                msg += noFormLabels;
                break;
            } else {
                if (i>0 && msg !== '') { msg += '\n\n'; }
                msg +=  aA.frames[i].src + '\n' + noFormLabels;               
            }
        }   
    }

    // standard
    if (msg !== '') { alert(msg); }

}

function AncestorIsLabel(o) {
    var p=o.parentNode;
    if (o.tagName=='LABEL')
        return true;
    else if (p!==null)
        return AncestorIsLabel(p);
    else return false;
}

function CheckImages(mydocument,aA,o) {

    //create a div object just to check the length of the properties array
    var jt_generic_obj = mydocument.createElement("var");
    var jt_ie7 = false;
    if (jt_generic_obj.attributes.length > 0) {
        jt_ie7 = true;
    }

    var imchildlist=o.childNodes;
    for (var im=0;im<imchildlist.length;im++) {

        if (imchildlist[im].tagName=='IMG' && ((jt_ie7 && imchildlist[im].attributes.alt.specified) || (!(jt_ie7) && imchildlist[im].hasAttribute('alt')))) {
            if (imchildlist[im].alt.length!==0) {
                aA.l.appendChild(mydocument.createTextNode('alt=\"'+imchildlist[im].alt+'\" ')); 
                aA.found = true;
            } 
        } else {   
            //if it is not an image, we call this function again
            //for the child object this way we check the whole subtree for images
            //foundImageAlt is passed through all recursion so we know whether any alt-text was found
            CheckImages(mydocument,aA,imchildlist[im]);
        }                  
    }
    
    return aA.found; 
}

function showFieldsetLabels(mydocument,aA)  {
    //create a div object just to check the length
    //of the properties array

    var count = 0;

    var jt_generic_obj = mydocument.createElement("var");
    var jt_ie7 = false;
    if (jt_generic_obj.attributes.length > 0) {
        jt_ie7 = true;
    }

    // remove anything added last time favlet ran
    var myExpress1 = /fstAdded.*/;
    var spanLive=mydocument.getElementsByTagName('span');

    //static (span won't change - don't use spanLive while editing page)
    var spans = [];
    for (var i=0; i<spanLive.length;i++) {
        spans[i] = spanLive[i];
    }

    for (var s=0;s<spans.length;s++) {
        if (((jt_ie7 && spans[s].attributes && spans[s].attributes.id.specified) || 
            (!(jt_ie7) && spans[s].hasAttribute('id'))) && myExpress1.test(spans[s].getAttribute('id'))) {
            spans[s].parentNode.removeChild(spans[s]);
        }
    }

    //try{
    var spn='<span style=\"background-color:#f5deb3;font-size:x-small;font-weight:bold;color:navy;border: 1px solid navy; padding: 1px;\">';
    var z=0,tag=new Array('fieldset','legend','label','input','select','textarea','form'),taga=new Array('fieldset','legend','label');
    var tlabel=mydocument.getElementsByTagName('label');

    for(n=0;n<tag.length;n++) {

        ta=mydocument.getElementsByTagName(taga[n]);
        t=mydocument.getElementsByTagName(tag[n]); 
        z+=ta.length;
    
        for(i=0;i<t.length;i++) {
            var la='';
            if(tag[n]=='fieldset'||tag[n]=='legend'||tag[n]=='form') { la=' '+tag[n]+''; count++; }
            if(t[i].id!==''&&(tag[n]=='input'||tag[n]=='select'||tag[n]=='textarea')) { la='&nbsp;id=\"'+t[i].id+'\"&nbsp;'; }
            if(t[i].htmlFor!==''&&tag[n]=='label') { la=' '+tag[n]+' for=\"'+t[i].htmlFor+'\"'; }
            if(t[i].htmlFor===''&&tag[n]=='label') { la=spn+' '+tag[n]+'<strong style=\"color:#ff0000;\"> No for!</strong> '; }
            
            if (((jt_ie7 && t[i].attributes.id.specified) || 
               (!(jt_ie7) && t[i].hasAttribute('id'))) && t[i].tagName!='LABEL' && t[i].tagName!='FIELDSET' && t[i].tagName!='LEGEND' && t[i].tagName!='FORM') {

                var match=0;
                for (p=0;p<tlabel.length;p++) {
                    if (t[i].id==tlabel[p].htmlFor) {
                        match++; 
                    } 
                }
                
                // an input element found without label
                if (match===0) { 
                    // no match found, matching is case-sensitive
                    la+='<strong style=\"color:#ff0000;\"> No match id=\"'+t[i].id+'\"</strong> ';
                }
            }

            if (t[i].id!=='') {
                var foo4=mydocument.getElementById(t[i].id);
                if (t[i]!=foo4) {
                    la+='<strong style=\"color:#ff0000;\"> Duplicate id=' + t[i].id + '</strong> ';
                }
            }

            var h=t[i].outerHTML;
            if(tag[n]=='fieldset'||tag[n]=='input'||tag[n]=='select'||tag[n]=='textarea'||tag[n]=='legend'||tag[n]=='form'||tag[n]=='label')
            { 
                try {
                    //alert (t[i].type);
                    if (t[i].type!='hidden'){
                        t[i].outerHTML=spn+''+la+'</span>'+h;
                    }
                }
                catch(e) {return;}
            }
         
            if(tag[n]=='label')
            { 
                t[i].style.border='1px solid #000000';t[i].style.padding='2px';t[i].style.background='#ffffff';
            } 
          
            if(tag[n]=='fieldset'||tag[n]=='legend'){
                t[i].style.border='2px dotted #4682b4';
            }
          
            if(tag[n]=='form') { 
                t[i].style.border='2px dotted blue',t[i].style.padding='3px';
            }
        }
    }

    //}
    //catch(e){alert(localize('errortxt5')+"\n "+e.description)}
    
    var oFrame = {src:mydocument.location, count:count};
    aA.frames.push(oFrame);

    return aA;
}

start(document);

//Earlier Changes
// DOM version
// avoids causing site DOM code to throw errors, like at google
// Backup just IE8 fix version is in this directory 'BackupFormLabels.js'
//7-16-2010
// added recursive check for frames and iframes
// using object aA to keep track of things frame to frame
// remove spans added last time favelet ran
//7-17-2010
// bug fix - id without a match was not in error count if there was a container label
//           issue was mentioned in a comment in the code - for a future fix (see above)
// popup reporting clarification - aA.erFC records number of form controls with errors
//           popup now uses this with new wording in cases where multiple errors are
//           found on one form element (Google issue)
// added fieldset and legend
//7-18-2010
// added red on-screen message for empty legend
// fixed bug related to empty labels
//7-20-2010
// made it so favelets don't erase eachothers stuff
//7-24-2010
// plural and singular in popup message
//10-20-2010
// handle case where id=""
//Jan 2, 2012
// no longer treat single character label as a error; now treat only white space as an error, 
// or case for image checking
// instead of checking just first child of label to see if image and warning if it 
// is another tag, it recurses through entire subtree looking for images. 
//2-21-2013
// added HTML 5 required
// shows aria-label - not part of error calculation yet
// shows aria-labelleby and id tracking - not part of error cal yet - and tracks misspelling
