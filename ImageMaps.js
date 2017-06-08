/*************************************************************
* To run this favelet on a different server, update line 137.*
**************************************************************/

function start(myDocument) {

    // Instead of window. for global
    // we use aA. so that we don't have
    // variables that might get mixed in
    // with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = [];

    //VAR SPECIFIC TO THIS FAVELET
    aA.z=0;  //
    aA.y=0;  // number of errors
    aA.w=0;  // number to check
    aA.wy=0; //

    // VAR STANDARD ACROSS FAVELETS
    // for id of added spans
    // so we can removed them
    aA.idi=0;

    // for frames outside domain
    // so we can report them
    aA.framemsg='';
    aA.fi=0;

    aA.documentTitle=document.title;
    aA.serverSideElements = [];

    //each map element has its associated code (image, map, areas) stored in an array
    // this 2D array is used to collate all of the individual map arrays
    aA.clientSideElements = []; 

    // STANDARD ACROSS FAVELETS & Recursive: 
    // checkFrames calls function that checks the page.
    // Then, it calls itself for each doc in a frame
    // It returns aA with all the aA.variables counted up
    aA = checkFrames(myDocument, aA);

    if (aA.serverSideElements.length === 0 && 
        aA.clientSideElements.length === 0) {
        alert("No Server-side or Client-side image maps");
    }
    else {

        //STANDARD - reporting once done recursing through frames
        provideMessage(aA);
        //OPEN RESULTS PAGE
        resultsPage(aA);    
    }
}

function checkFrames(myDocument,aA) {

    //run showImageMaps check for current document which might 
    //have frames or image maps or both
    aA = showImageMaps(myDocument, aA);

    //run checkFrames for each frame's document if there
    //are any frames
    var frametypes = new Array('frame','iframe','ilayer');
    for (var x = 0; x < frametypes.length; x++) {
        var myframes = myDocument.getElementsByTagName(frametypes[x]);
        for (var y = 0;y < myframes.length; y++) {
            try {
                 //alert('in try');
                 checkFrames(myframes[y].contentWindow.document,aA);
            } catch(e) {
                 //errors are stored in aA too
                 aA.framemsg = aA.framemsg + '\n' +  myframes[y].src;
                 aA.fi = aA.fi + 1;
            }
        }
    }

    return aA;
}

function displayHtmlAsText(htmlString) {

   return htmlString
    .replace(new RegExp("&", "g"), '&amp;')
    .replace(new RegExp("\"", "g"), '&quot;')
    .replace(new RegExp("'", "g"), '&#39;')
    .replace(new RegExp("<", "g"), '&lt;')
    .replace(new RegExp(">", "g"), '&gt;');
}

function provideMessage(aA) {

    var yw_pl = 's';
    var w_pl = 's';
    var y_pl = 's';

    if ((aA.y + aA.w) ==1 ) { yw_pl = ''; }
    if (aA.w == 1) { w_pl = ''; }
    if (aA.y == 1) { y_pl = ''; }

    // standard for frames
    var fi_pl = 's';
    if (aA.fi == 1) { fi_pl = ''; }
        
    var msg = '';
    if (aA.fi > 0) {
        msg = "\n\n" + aA.fi + " frame" + fi_pl + " outside the domain could not be checked: \n" + aA.framemsg;
    }
    
    // standard
    if (msg !== '') { alert(msg); }
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + s4()  + s4() + s4() + s4() + s4() + s4();
}

function resultsPage(aA) {

    try {

        var lw = window.open('', guid());

        if (lw !== null) {

            if (lw.opener === null) {
                lw.opener = window;
            }

            // IE has no interface for DOM additions to pages
            // that were created using DOM, but we still use 
            // DOM for most things and convert back to a string
            // here using innerHTML
            lw.document.open();
            lw.document.write("<html><head><title>Image map results window</title>");
            lw.document.write('<link rel="Stylesheet" href="scripts/css/generic.css" type="text/css"></head>');
            //lw.document.write('<link rel="Stylesheet" href="http://cloudservices.dhs.gov/oastsupport/FaveletScripts/css/generic.css" type="text/css"></head>');
            lw.document.write('<body><a href="javascript:window.close();">[close window]</a>');
            lw.document.write("<h1>Image map information for \'" + aA.documentTitle + "\'</h1><hr/>");

            lw.document.write("<h2>Server-side image maps:</h2>");
            if (aA.serverSideElements.length === 0) {
                lw.document.write("Server-side image maps were <b>not found</b>.<br/><hr/>");
            } else {
                for (var i = 0; i < aA.serverSideElements.length; i++) {
                    lw.document.write("<p>" + aA.serverSideElements[i] + "<p/><hr/>");
                }
            }
            lw.document.write("<hr/>");

            lw.document.write("<h2>Client-side image maps:</h2>");
            if (aA.clientSideElements.length === 0) {
                lw.document.write("Client-side image maps were <b>not found</b>.<br/><hr/>");
            } else {
                
                for(var y = 0; y < aA.clientSideElements.length; y++) {

                    lw.document.write("<p>" + aA.clientSideElements[y][0].outerHTML + "</p><hr />");

                    //second array item is the map opening tag
                    var capsule = aA.clientSideElements[y][1].outerHTML;
                    capsule = capsule.slice(0, (capsule.indexOf('>') + 1));
                    lw.document.write("<p>" + displayHtmlAsText(capsule) + "</p>");
                    
                    //next array items except last are 'area' elements
                    for(var m = 2; m < aA.clientSideElements[y].length - 1; m++)
                    {       
                        lw.document.write("<p>" + displayHtmlAsText(aA.clientSideElements[y][m].outerHTML) + "</p>");
                    }
                    lw.document.write("<p>" + aA.clientSideElements[y][(aA.clientSideElements[y].length - 1)] + "</p>");
                    
                    //write in client-side map and area elements in code
                    lw.document.write(capsule);
                    for(var m = 2; m < aA.clientSideElements[y].length - 1; m++)
                    {
                        lw.document.write(aA.clientSideElements[y][m].outerHTML);
                    }    
                    lw.document.write("<hr />");
                }
            }

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

function isBlank(s){
    
    var E = /(\s)/;
    var res = true;
    for (var i = 0; i < s.length; i++) {
        res = res && E.test(s.charAt(i));
    }
    return res;
}   

function showImageMaps(mydocument, aA) {

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
        if (((ie7 && spans[s].attributes && spans[s].attributes.id.specified) || (!(ie7) && spans[s].hasAttribute('id'))) && myExpress1.test(spans[s].getAttribute('id'))) {
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

        for(var n = 0; n < img_els.length; n++)
        {
            if(img_els[n].getAttribute("ismap"))
            {
                aA.serverSideElements.push(img_els[n].outerHTML);
            }
        }

        //first look for 'map' element. if none present return negative
        //this means that even if an img element has a 'usemap' attribute it will return negative
        var map_els = mydocument.getElementsByTagName('map');

        if(map_els.length !== 0) {

            for(var j = 0; j < img_els.length; j++) {

                if(img_els[j].getAttribute("usemap")) {

                    for(var i = 0; i < map_els.length; i++) {

                        usemap_str = img_els[j].getAttribute("usemap");
                        
                        //each usemap value starts with a # which needs to be removed
                        usemap_str = usemap_str.slice(1);       
                        mapname_str = map_els[i].getAttribute("name");
                        mapid_str = map_els[i].getAttribute("id");

                        if((usemap_str == mapname_str) || (usemap_str == mapid_str)) {

                            //create array of map and child areas
                            map_array = [];
                            
                            //add img node as first item of array
                            map_array.push(img_els[j]);
                        
                            //add map element as second item of array
                            map_array.push(map_els[i]);
                            
                            //get child 'area' elements of map
                            if(map_els[i].hasChildNodes) {

                                //create span with special id so we can remove it later
                                var pageAdd = mydocument.createElement('span');
                                pageAdd.id = "aistAdded" + (aA.idi++);

                                //give the span style that is common to all messages
                                pageAdd.style.fontSize = "x-small";
                                pageAdd.style.fontFamily = "arial,sans-serif";
                                pageAdd.style.fontWeight = "bold";
                                pageAdd.style.backgroundColor = "#FFFF00";
                                pageAdd.style.color = "navy";

                                // not needed for version 1
                                //give the span the image map intro
                                //pageAdd.appendChild(mydocument.createTextNode('imgmap AREAS: '));

                                // create the span element for areas  
                                var myArea = mydocument.createElement('span');
                                myArea.style.fontSize = "x-small";
                                myArea.style.fontWeight = "bold";
                                myArea.style.backgroundColor = "#FFFF00";

                                var areas = map_els[i].childNodes;
                                for (var k = 0; k < areas.length; k++) {

                                    if(areas[k].nodeType == 1) {
                                        //check for 'area' element & alt attribute
                                        if(areas[k].nodeName.toLowerCase() == "area") {

                                            map_array.push(areas[k]);

                                            if ((ie7 && areas[k].attributes.alt.specified) || (!(ie7) && areas[k].hasAttribute('alt'))) {
                                                if (isBlank(areas[k].alt)) {
                                                    // NULL ALT
                                                    thisArea = myArea.cloneNode(true);
                                                    thisArea.style.color = "red";
                                                    thisArea.appendChild(mydocument.createTextNode('NULL alt. '));
                                                    //pageAdd.appendChild(thisArea);
                                                    aA.y = aA.y + 1;
                                                } else {
                                                    // ALT
                                                    thisArea = myArea.cloneNode(true);
                                                    thisArea.style.color = "navy";
                                                    thisArea.appendChild(mydocument.createTextNode('alt="' + areas[k].alt + '". '));
                                                    //pageAdd.appendChild(thisArea);
                                                    aA.w = aA.w + 1;
                                                }                           
                                            } 
                                            else {
                                                // NO ALT
                                                thisArea = myArea.cloneNode(true);
                                                thisArea.style.color = "red";
                                                thisArea.appendChild(mydocument.createTextNode('NO alt. '));
                                                //pageAdd.appendChild(thisArea);
                                                aA.y = aA.y + 1;
                                            }
                                        }
                                    
                                    }
                                
                                } // end for each area

                            } // end if map has areas

                            //place item before image in question
                            map_els[i].parentNode.insertBefore(pageAdd,map_els[i]);

                            // not needed for version 1
                            //styles applied to the image or input
                            //img_els[j].style.padding = '3px';
                            //img_els[j].style.border = '2px solid red';

                            map_array.push(displayHtmlAsText("</map>"));
                            aA.clientSideElements.push(map_array);

                        } // end if usemap is map name or id

                    } //end for each map

                } // end if img has usemap attribute

            } // end for each img tag

        } // end if maps exist

    } // end if img exists

    return aA;

} // end function

start(document);
