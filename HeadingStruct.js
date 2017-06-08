/*************************************************************
* To run this favelet on a different server, update line 90.*
**************************************************************/

function start(myDocument){

    //Instead of window. for global
    //we use aA. so that we don't have
    //variables that might get mixed in 
    //with site-level js

    var aA=[];
         
    //for counting non-empty headings, empty 
    //headings, and each level of heading
    aA.z=0;
    aA.zz=0;
    aA.count=new Array(0,0,0,0,0,0,0,0,0,0,0,0);
    // handles up to heading level 10
    // then will say "over 10"
    // also  counts unleveled headings

    aA.hgroups=0;

    //for id of added spans
    //so we can removed them
    aA.idi=0;
         
    //for frames outside domain
    //so we can report them
    aA.framemsg='';
    aA.fi=0;

    aA.documentTitle=document.title;

    aA.headerHtml=[];

    //recursive through frames
    aA = checkFrames(myDocument,aA);

    //reporting
    //provideMessage(aA);

    //show results page
    resultsPage(aA);
}

function checkFrames(myDocument,aA){

    //run headings check for current document which might 
    //have frames or headings or both

    aA = heading(myDocument,aA);

    //run checkFrames for each frame's document if there
    //are any frames
    var frametypes=new Array('frame','iframe','ilayer');
    for (var x=0;x<frametypes.length;x++) {
        var myframes=myDocument.getElementsByTagName(frametypes[x]);
        for (var y=0;y<myframes.length;y++) {
            try {
                 //alert('in try');
                 checkFrames(myframes[y].contentWindow.document,aA);
            } catch(e) {
                 //errors are stored in aA too
                 aA.framemsg=aA.framemsg + '\n' +  myframes[y].src;
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

function resultsPage(aA) {

    try {

        var lw = window.open('',guid());

        if (lw!==null) {

            if (lw.opener === null) {
                lw.opener = window;
            }

            // IE has no interface for DOM additions to pages
            // that were created using DOM, but we still use 
            // DOM for most things and convert back to a string
            // here using innerHTML

            lw.document.open();
            lw.document.write("<html><head><title>Document Heading Structure</title>");
            lw.document.write('<link rel="Stylesheet" href="scripts/css/generic.css" type="text/css"></head>');
            //lw.document.write('<link rel="Stylesheet" href="http://cloudservices.dhs.gov/oastsupport/FaveletScripts/css/generic.css" type="text/css"></head>');
            lw.document.write('<body><a href="javascript:window.close();">[close window]</a><hr/>');
            lw.document.write('<div style="font:x-small verdana;border:2px solid #ffefd5"><strong>Instructions: Examine the outline view below to ensure that:</strong>');
            lw.document.write('<ol style=margin-top:0px><li>Headings and Page Title are present,</li>');
            lw.document.write('<li>The headings are nested correctly, and</li>');
            lw.document.write('<li>The headings provide an effective overview of the contents of the page.</li></ol></div>');
            lw.document.write('<h1  style="font:medium verdana">Title: \'' + aA.documentTitle + '\'</h1>');

            for (var i = 0; i < aA.headerHtml.length; i++) {
                lw.document.write(aA.headerHtml[i]);
            }

            // added indented headings here
            lw.document.write("</body></html>");
            lw.document.close();
            lw.focus();

        } else {
            alert('Popup windows for frame report blocked.');
        }

    } catch(err) {
        console.log("An error occurred while trying to open the report window.\n" + err.message);
        return false;
    }

}

function provideMessage(aA) {

   var alertmessage="";

   if (aA.z===0) {
       alertmessage = "No Heading Elements Used";
   } 

   var fi_pl='s';
   if (aA.fi==1){fi_pl='';}

   if (aA.fi>0) {
       alertmessage=alertmessage + '\n\n' + aA.fi + ' frame'+fi_pl+' outside the domain could not be checked: \n' + aA.framemsg;
   }

   alert(alertmessage);

}

function displayHtmlAsText(htmlString) {

   return htmlString
    .replace(new RegExp("&", "g"), '&amp;')
    .replace(new RegExp("\"", "g"), '&quot;')
    .replace(new RegExp("'", "g"), '&#39;')
    .replace(new RegExp("<", "g"), '&lt;')
    .replace(new RegExp(">", "g"), '&gt;');
}

function heading(mydocument,aA){

    // Create span element template
    var newSpan = mydocument.createElement('span');
    newSpan.style.color="navy";
    newSpan.style.fontSize="x-small";
    newSpan.style.fontWeight="bold";
    newSpan.style.backgroundColor="FFFF00";

    // remove anything added last time favelet ran

    //create object just to check length of the properties array
    var jt_generic_obj = mydocument.createElement("var");
    var ie7 = false;
    if (jt_generic_obj.attributes.length > 0) {
        ie7 = true;
    }

    var myExpress1 = /hstAdded.*/;
    var spanLive=mydocument.getElementsByTagName('span');

    //static (span won't change - don't use spanLive while editing page)
    var spans = [];
    for (var i=0; i<spanLive.length;i++) {
        spans[i] = spanLive[i];
    }

    for (var s=0;s<spans.length;s++) {
        if (((ie7 && spans[s].attributes && spans[s].attributes.id.specified) || (!(ie7) && spans[s].hasAttribute('id'))) && myExpress1.test(spans[s].getAttribute('id'))) {
            spans[s].parentNode.removeChild(spans[s]);
        }
    }

    var trad_heading = /H[1-6]/;

    //changes as we add things
    if (mydocument.all) {
        // ie
        var eLive = mydocument.all;
        // .attributes does not work til 2
    } else {
        var eLive = mydocument.getElementsByTagName("*");
    }
    
    //static (e won't change - don't use eLive while editing page)
    var e = [];
    for (var i=0; i<eLive.length;i++) {
        e[i] = eLive[i];
    }

    for (var i = 0; i < e.length; i++) {
    // EACH OBJECT
        var aria_h="false";
        var aria_level="";

        if (e[i].tagName.toLowerCase() == "hgroup") {

            var h;
            h=e[i].innerHTML;
 
            //create objects to add 
            var openSpan = newSpan.cloneNode(true);
            openSpan.id = 'hstAdded'+(aA.idi++);
            openSpan.appendChild(mydocument.createTextNode('<'+e[i].tagName.toLowerCase()+'>'));

            var closeSpan = newSpan.cloneNode(true);
            closeSpan.id = 'hstAdded'+(aA.idi++);
            closeSpan.appendChild(mydocument.createTextNode('</'+e[i].tagName.toLowerCase()+'>'));

            //place objects
            e[i].parentNode.insertBefore(openSpan,e[i]);
            e[i].parentNode.insertBefore(closeSpan,e[i].nextSibling);

            aA.hgroups=aA.hgroups+1;
       }

        //Check for aria headings
        if (e[i].attributes) {
            // EACH ATTRIBUTE
            for (var x = 0; x < e[i].attributes.length; x++) {
                var myA = e[i].attributes[x].nodeName.toLowerCase();
                //alert(myA + " is " + e[i].getAttribute(myA) );
                var myExpress = /aria.*/;
                // ie7 if below is only needed when
                // ie8 immitates ie7 - as then the aria attributes are in
                // the ie7-style list of empty attributes
                if ((!ie7 || (ie7 && e[i].attributes[x].specified))) {

                    if (myA=="role" && e[i].getAttribute(myA)=="heading") {
                        var aria_h="true";
                    }
                    if (myA=="aria-level") {
                        var aria_level=e[i].getAttribute(myA);
                    }
                }
            }
        }

        if (aria_h == "true") {

            var h, al;
            h=e[i].innerHTML;
            al="";

            //up specific heading level count 
            if (aria_level !== '') {
                if (aria_level < 11) {
                    aA.count[aria_level-1]=aA.count[aria_level-1]+1;
              } else {
                   aA.count[10]=aA.count[10]+1;
              }
              al='aria-level="'+aria_level+'"';
            } else {
                if (!trad_heading.test(e[i].tagName)) {
                    // aria heading, not html heading, no level
                    aA.count[11]=aA.count[11]+1;
                }
            }

            void(e[i].innerHTML='<span style=\'border:2px solid red;padding:3px;\'><span id=\'hstAdded'+(aA.idi++)+ '\' style=\'font-family: arial;color:navy;font:x-small bold;background-color:FFFF00\'><strong style=\'color:navy;background-color:#FFFF00\'>&lt;'+e[i].tagName.toLowerCase()+' role="heading" '+al+'&gt;</strong></span>'+h+'<span id=\'hstAdded'+(aA.idi++)+ '\' style=\'font-family: arial;color:navy;font:x-small bold;background-color:#FFFF00\'><strong style=\'color:navy;background-color:#FFFF00\'>&lt;/'+e[i].tagName.toLowerCase()+'&gt;</strong></span></span>');

            if (h === '') {
                aA.zz=aA.zz+1;
            } else {
                aA.z=aA.z+1;
            }

        } 
        // close if ARIA heading

        if (trad_heading.test(e[i].tagName)) {

            var get_level = e[i].tagName.substr(1,1);
            //alert(get_level);

            if (aria_h != "true") {

                var h;
                h=e[i].innerHTML;

                aA.headerHtml.push('<div style="margin-left:' + get_level*40 + 'px;font:arial;"><span style="color: #000080;">' + 
                                   '<h' + get_level + '>' + displayHtmlAsText("<H" + get_level + ">") + h + 
                                   '<span style="color: #000080;">' + displayHtmlAsText("</H" + get_level + ">") + '</span>' + 
                                   '</h' + get_level + '></span></div>');
                
                var aria_level_string="";
                if (aria_level !== "") {
                    aria_level_string = ' aria-level="' + aria_level + '"';
                }

                void(e[i].innerHTML='<span style=\'border:2px solid red;padding:3px;\'><span id=\'hstAdded'+(aA.idi++)+ '\' style=\'font-family: arial;olor:navy;font:x-small bold;background-color:#FFFF00\'><strong style=\'color:navy;background-color:#FFFF00\'>&lt;'+e[i].tagName.toLowerCase()+aria_level_string+'&gt;</strong></span>'+h+'<span id=\'hstAdded'+(aA.idi++)+ '\' style=\'font-family: arial;color:navy;font:x-small bold;background-color:#FFFF00\'><strong style=\'color:navy;background-color:#FFFF00\'>&lt;/'+e[i].tagName.toLowerCase()+'&gt;</strong></span></span>');

                //only increase overall count if not counted before
                if (h === '') {
                    aA.zz=aA.zz+1;
                } else {
                    aA.z=aA.z+1;
                }

                // check to see if it doesn't have role="heading", but does
                // have aria-level set and reset the level accordingly
                if (aria_level !== "") {
                    //note change only made AFTER we print the tags to the page
                    get_level=aria_level;
                }
            }

            //only increase level count if not yet counted
            //first condition covers regular heading tags
            //first condition covers html heading tags with ARIA level change
            //second condition covers html heading tags with ARIa role of heading, but without an ARIA level 
            if (aria_h != "true" || aria_level === "") {

                aA.count[get_level-1]=aA.count[get_level-1]+1;
            }
        }
        // close if traditional heading

    }
    // close going through each object

    //Return argument array
    return aA; 
} 

start(document);

