/*************************************************************
* To run this favelet on a different server, update line 119.
* Modified by Jane Norrie 2015.03.20 version 1 - initial version (new page and aria)
* Modified by Jane Norrie 2015.04.01 version 2 - code cleanup
**************************************************************/

function start(myDocument) {

    // Instead of window. for global
    // we use aA. so that we don't have
    // variables that might get mixed in
    // with site-level js

    //aA holds all variable that are global throughout frames

    //STANDARD ACROSS FAVELETS
    var aA = [];

    // VAR STANDARD ACROSS FAVELETS
    // for id of added spans
    // so we can removed them
    aA.idi=0;

    // for frames outside domain
    // so we can report them
    aA.framemsg='';
    aA.fi=0;

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
        alert("No server-side or client-side image maps were found.");
    }
    else {

        //OPEN RESULTS PAGE
        resultsPage(aA, myDocument);    
    }
}

function checkFrames(myDocument,aA) {

    //run showImageMaps check for current document which might 
    //have frames or image maps or both
    aA = showImageMaps(myDocument, aA);

    //run checkFrames for each frame's document if there are any frames
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

function getDocType(mydocument) {

    var doctype = 
        "<!DOCTYPE " +
            mydocument.doctype.name +
            (mydocument.doctype.publicId ? ' PUBLIC "' + mydocument.doctype.publicId + '"' : '') +
            (!mydocument.doctype.publicId && mydocument.doctype.systemId ? ' SYSTEM' : '') +
            (mydocument.doctype.systemId ? ' "' + mydocument.doctype.systemId + '"' : '') +
        '>';

    return doctype;
}

function resultsPage(aA, myDocument) {

    try {

        var lw = window.open('','lw');

        if (lw !== null) {

            if (lw.opener === null) {
                lw.opener = window;
            }

            // IE has no interface for DOM additions to pages
            // that were created using DOM, but we still use 
            // DOM for most things and convert back to a string
            // here using innerHTML
            lw.document.open();

            lw.document.write(getDocType(myDocument));
            lw.document.write("<html><head><title>Image map results window</title>");
            lw.document.write('<link rel="Stylesheet" href="scripts/css/generic.css" type="text/css"></head>');
            //lw.document.write('<link rel="Stylesheet" href="http://cloudservices.dhs.gov/oastsupport/FaveletScripts/css/generic.css" type="text/css"></head>');
            lw.document.write('<body><a href="javascript:window.close();">[close window]</a>');
            lw.document.write("<h1>Image map information for \'" + myDocument.title + "\'</h1><hr/>");

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
                        lw.document.write("<p>" + aA.clientSideElements[y][m] + "</p>");
                    }
                    lw.document.write("<p>" + aA.clientSideElements[y][(aA.clientSideElements[y].length - 1)] + "</p>");    
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
        alert("Error: " + err.messgage);
        return false;
    }
}

function inArray(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
    return false;
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

        var myExpress = /aria.*/;

        if(map_els.length !== 0) {

            for(var j = 0; j < img_els.length; j++) {

                if(img_els[j].getAttribute("usemap")) {

                    for(var ix = 0; ix < map_els.length; ix++) {

                        usemap_str = img_els[j].getAttribute("usemap");
                        
                        //each usemap value starts with a # which needs to be removed
                        usemap_str = usemap_str.slice(1);       
                        mapname_str = map_els[ix].getAttribute("name");
                        mapid_str = map_els[ix].getAttribute("id");

                        if((usemap_str == mapname_str) || (usemap_str == mapid_str)) {

                            //create array of map and child areas
                            map_array = [];
                            
                            //add img node as first item of array
                            map_array.push(img_els[j]);
                        
                            //add map element as second item of array
                            map_array.push(map_els[ix]);
                            
                            //get child 'area' elements of map
                            if(map_els[ix].hasChildNodes) {

                                var areas = map_els[ix].childNodes; 
                                var count = 0;
                                var areaArray = [];

                                for (var k = 0; k < areas.length; k++) {

                                    if(areas[k].nodeType == 1) {

                                        count++;

                                        //check for 'area' element & alt attribute
                                        if(areas[k].nodeName.toLowerCase() == "area") {

                                            var myObject = {};
                                            myObject.area = '';
                                            myObject.targets = [];

                                            //iterate area attributes to highlight title, alt and aria
                                            for (var z = 0; z < areas[k].attributes.length; z++) {

                                                var myA = areas[k].attributes[z].name;
                                                  
                                                if ((!ie7 || (ie7 && areas[k].attributes[z].specified)) && 
                                                   (myA == "title" || myA == "alt" || ((myExpress.test(myA) && areas[k].getAttribute(myA)!==null) || (myA=="tabindex" && areas[k].getAttribute(myA)=="-1") || (myA=="role" && areas[k].getAttribute(myA)!==null)))) {

                                                    myObject.area += '<b>' + areas[k].attributes[z].name + '="' + areas[k].attributes[z].value + '"</b> ';

                                                    //check for items with ids
                                                    var value_is_id_attributes = new Array('aria-describedby','aria-labelledby','aria-labeledby');
                                                    
                                                    // all can have a list of ids, except aria-activedescendant
                                                    if (inArray(value_is_id_attributes,myA)) {

                                                        //report on the attribute
                                                        //get array of ids
                                                        var id_array = areas[k].getAttribute(myA).split(" ");
                                                        for (var mapi=0;mapi<id_array.length;mapi++) {

                                                            var myAid=id_array[mapi];

                                                            //alert(mydocument.getElementById(myAid)); 
                                                            if (mydocument.getElementById(myAid) !== undefined && mydocument.getElementById(myAid) !== null) {

                                                                // save this to print out on new page
                                                                var myIdTarget=mydocument.getElementById(myAid);   
                                                                myObject.targets.push('<b>' + myAid + '</b>="' + myIdTarget.innerHTML + '"');
                                                          
                                                            } else { }
                                                        }
                                                    }

                                                } else {
                                                    myObject.area += areas[k].attributes[z].name + '="' + areas[k].attributes[z].value + '" ';
                                                }

                                            } // end for each area attributes

                                            areaArray.push(myObject);
                                            var areaPlusTargets = displayHtmlAsText('<area ') + areaArray[count-1].area + displayHtmlAsText('>');
                                            
                                            for (var q = 0; q < areaArray[count-1].targets.length; q++) {

                                                if (areaArray[count-1].targets[q] !== null) {
                                                    if (q === 0) {
                                                        areaPlusTargets += "</br></br>";
                                                    } else {
                                                        areaPlusTargets += "</br>";
                                                    }
                                                    areaPlusTargets += areaArray[count-1].targets[q];
                                                }
                                            }
                                            map_array.push(areaPlusTargets);
                                        }
                                    
                                    }
                                
                                } // end for each area

                            } // end if map has areas

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
