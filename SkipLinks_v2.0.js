/*************************************************************
* To run this favelet on a different server, update line 279 and 289.
* Modified by Jane Norrie 2015.03.26, version 2.0
* Modified by Jane Norrie 2015.03.31, version 3.0 - code cleanup
**************************************************************/

function start(myDocument) {

    //Instead of window. for global we use aA. so that we don't have
    //variables that might get mixed in with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = [];

    //VAR SPECIFIC TO THIS FAVELET
    aA.z=0;  //number of anchors
    aA.y=0;  //not used
    aA.w=0;  //number of exact matches
    aA.wy=0; //number of missing anchors

    aA.count=0;

    //VAR STANDARD ACROSS FAVELETS
    //for id of added spans so we can removed them
    aA.idi=0;

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
    resultsPage(myDocument);
}

function checkFrames(myDocument,aA) {

    //run showImageMaps check for current document which might 
    //have frames or images or both
    aA = skipLinks(myDocument, aA);

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
    var msg = '';

    var count_s = 's';
    if (aA.count == 1) { count_s = ''; }
    var wy_s = 's';
    if (aA.wy == 1) { wy_s = ''; }

    if (aA.count === 0) {
        msg = 'No Local anchors';
    } else {
        if (aA.wy > 0) {
            msg =  aA.wy + ' local anchor' + wy_s + ' without a target.';
        } else {
            msg = aA.count + ' local anchor' + count_s + ' to check out';
        }
    }

    //standard
    alert(msg);
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
        if (scripts[i].src.indexOf("SkipLinks_v2.0.js") > -1) {
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
    if (mydocument.doctype!==null) {
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

function replaceGetElementsByName(searchName) {

    //getElementsByName doesn't work the same in all browsers
    //this copies how it worked in IE 6 in all browsers

    //so it returns list of all elements
    //with searchName as name OR AS id

    var myNameElements = [];
    var els = document.getElementsByTagName('*');
    var elsLen = els.length;
    var pattern = new RegExp('(^|\\\\s)'+searchName+'(\\\\s|$)');
    for (s = 0, j = 0; s < elsLen; s++) {
        if ( pattern.test(els[s].name) || pattern.test(els[s].id) ) {
            myNameElements[j] = els[s];
            j++;
        }
    }
    return myNameElements;
}

function skipLinks(mydocument, aA) {

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

    var w, str='', name = '';
    var names = [];
    var v = [];
    var pre='<span style=\'color:';
    var next=';font:x-small; font-family:arial;background:#fffacd;';

    t=mydocument.getElementsByTagName('a');
    for (i=0;i<t.length;i++) {
        var l,o="",x=0, na=0, u=0; var message="";
        if ((ie7 && t[i].attributes.href.specified) || (!(ie7) && t[i].hasAttribute('href'))) {

            var h=t[i].href;
            u=h.indexOf('#');
            if (u>=0) { 
                name=h.substring(u+1,h.length);
                if (name.length>0) {
                    var file=h.substr(0,u);
                    var url=mydocument.URL;
                    var u=url.indexOf('#');
                    if (u>0) url=url.substr(0,u);
                    if (file==url || file.indexOf('file')===0 ) {
                        // Local Anchor
                        aA.count++;  //same throughout favelet run
                        //found becomes true if name is in names array
                        //It seems to be to avoid addressing same anchor more than once
                        found=false;k=0;
                        while (!found && k<names.length) {
                            found=(name==names[k]);
                            k++;
                        }

                        if (!found) {
                            aA.z++;
                            names[k]=name;
                            v=replaceGetElementsByName(name);   
                            //all elements with that name or id
                            //first element with that name or id
                            w=v[0]; 

                             if (v.length < 1) {
                                //no anchor with that name!
                                found = true; //nothing to outline
                                var message = '<span style=\"color:#C00000;\"> with no target</span>';

                                aA.wy++;

                            } else {
                                if (w.getAttribute('tabindex') == '-1') {
                                    //already have the target
                                } else {
                                    layout=false;
                                    while (!layout && (w.tagName != 'BODY')) {
                                        //alert( w.tagName);
                                        try {layout=w.currentStyle.hasLayout;}
                                        catch (err) { }
                                        if (!layout) w=w.parentNode;
                                    }
                                }
                            }
                            
                            //Found ancestor with haslayout=true.
                            //or body element or anchor itself with tabindex neg one
                            //str='<img src="http://localhost:81/scripts/css/target.gif" alt="#'+name+'" style=\"z-index:500;">'+name;
                            str='<img src="http://cloudservices.dhs.gov/oastsupport/FaveletScripts/css/target.gif" alt="#'+name+'" style=\"z-index:500;">'+name;
                        }
                        l='href=\"#'+name+'\"'; x++;
                    }
                }
            }
            if ( x>0) {
                //alert('line 48');
                var h=t[i].outerHTML;
                //t[i].outerHTML='<span style="color: navy; line-height: normal; font-family: arial; font-size: small; font-style: normal; font-variant: normal; font-weight: normal; background-image: none; background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-color: rgb(255, 250, 205);"><img src="http://localhost:81/scripts/css/anchor.png" alt="'+name+'" style=\"z-index:500;"> #'+message+' '+name+'</span>'+h;
                t[i].outerHTML='<span style="color: navy; line-height: normal; font-family: arial; font-size:x-small; font-style: normal; font-variant: normal; font-weight: normal; background-image: none; background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-color: rgb(255, 250, 205);"><img src="http://cloudservices.dhs.gov/oastsupport/FaveletScripts/css/anchor.png" alt="'+name+'" style=\"z-index:500;"> #'+message+' '+name+'</span>'+h;
                //alert('line 51');
                t[i].style.padding='3px';
                t[i].style.border='1px solid red';
                //alert('line 54');
                if (!found) {
                    var h1=w.innerHTML;
                    if (w.tagName!='A') {
                        //alert ('target is A: '+h1);
                        w.innerHTML=pre+'navy'+next+'\'>'+str+'</span> <div>'+h1+'</div>';
                    } else {
                        var h2=w.outerHTML;
                        w.outerHTML=pre+'navy'+next+'\'>'+str+'</span>'+h2;
                    }
                    w.style.padding='3px';
                    w.style.border='2px solid navy';
                }
                if (h!=='') aA.z=aA.z+1;
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
