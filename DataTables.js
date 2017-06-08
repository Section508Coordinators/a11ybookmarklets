// Developed originally By Steve Faulkner 2003/2004
// steven.faulkner@nils.org.au
// modified by jim thatcher jim@jimthatcher.com 2005
// modified by Susanne Taylor 2010-11

function startFrames(myDocument){

    //Instead of window. for global
    //we use aA. so that we don't have
    //variables that might get mixed in 
    //with site-level js
    var aA = [];

    // keep track of alt tags for each frame
    aA.frames = [];
     
    //counting variables 
    aA.cth=0; // number of table headers
    aA.csu=0; // number of summaries
    aA.cro=0; // number of roles found JT
    aA.ccap=0; // number of captions
    aA.cother=0; // number of id, header or scope attributes
     
    //for id of added spans
    //so we can removed them
    aA.idi=0;
     
    //for frames outside domain
    //so we can report them
    aA.framemsg='';
    aA.fi=0;

    //recursive through frames
    aA = checkFrames(myDocument,aA);

    //reporting
    provideMessage(aA);
}

function checkFrames(myDocument,aA){

    //run tables check for current document which might 
    //have tables or (i)frames or both

    aA = DataTables(myDocument,aA);

    //run checkFrames for each frame's document if there
    //are any frames
    var frametypes=new Array('frame','iframe');
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

function DataTables(myDocument, aA){

    var cta = 0;

    //create object to check the length of properties array
    var jt_generic_obj = myDocument.createElement("var");
    var jt_ie7 = false;
    if (jt_generic_obj.attributes.length > 0) {
    jt_ie7 = true;
    }

    //remove anything added last time this favelet ran

    var myExpress1 = /tablesAdded.*/;
    var addedElements = new Array('span','br');
    // divlive and div don't contain divs!
    for (var g=0;g<addedElements.length;g++) {

        var divLive=myDocument.getElementsByTagName(addedElements[g]);

        //static (divs won't change - don't use divLive while editing page)
        var divs = [];
        for (var i=0; i<divLive.length;i++) {
            divs[i] = divLive[i];
        }

        for (var s=0;s<divs.length;s++) {
            if (((jt_ie7 && divs[s].attributes && divs[s].attributes.id.specified) || (!(jt_ie7) && divs[s].hasAttribute('id'))) && myExpress1.test(divs[s].getAttribute('id'))) {
                divs[s].parentNode.removeChild(divs[s]);
            }
        }
    }

    var t=myDocument.getElementsByTagName('table'); 
    //var c=new Array('#df0000', '#000080', '#007c00', '#bb00af', '#a8590e')
      var c=new Array('#000099');
    var cx=0;
    var s=myDocument.getElementsByTagName('th');
    var u=myDocument.getElementsByTagName('td');
    var cap=myDocument.getElementsByTagName('caption');
        
    // if tables are found ...
    if (t.length!==0) {

        // create template span element that holds the messages
        var messpan = myDocument.createElement('span');
        // default is navy
        messpan.style.color="navy";
        messpan.style.fontFamily="arial,sans-serif";
        messpan.style.fontSize="x-small";
        messpan.style.fontWeight="bold";
        messpan.style.backgroundColor="#ffefd5";
        messpan.style.padding="1px";
        messpan.style.border="1px solid navy";

        var str, cx;
        cx=-1;

        // COUNT the tables
        cta=cta+t.length;
        
        // DECORATE the tables. COUNT summaries.
        for (var i=0;i<t.length;i++) { // mark out tables
            str='';
            cx=(cx+1)%5; 
            // alert(t[i].hasAttribute('summary'));
            if ((jt_ie7 && t[i].attributes.summary.specified) || (!(jt_ie7) && t[i].hasAttribute('summary'))) {
                str=' summary=\"'+t[i].summary+'\"';
                aA.csu++;
            }
            // JT added for role - suspect role.specified not valid in ie7
            // alert(t[i].hasAttribute('role'));
            if ((jt_ie7 && t[i].attributes.role.specified) || (!(jt_ie7) && t[i].hasAttribute('role'))) {
                str=str+' role=\"'+t[i].getAttribute('role')+'\"';
                aA.cro++;
            }
            
            // label table
            var tableinfo = messpan.cloneNode(true);
            tableinfo.id="tablesAdded" + (aA.idi++);

            tableinfo.appendChild(myDocument.createTextNode('[table'+str+']'));
            tableinfo.style.color=c[cx];
            // put break just before table
            var tbr = myDocument.createElement('br');
            tbr.id="tablesAdded" + (aA.idi++);

            t[i].parentNode.insertBefore(tbr,t[i]);
            // put info between table and break
            t[i].parentNode.insertBefore(tableinfo,t[i]);

            // outline table 
            void(t[i].style.border='2px dashed navy');
            
            t[i].outerHTML =  t[i].outerHTML + '<span style=\'padding:1px;border:1px solid navy;color:navy;background-color:#ffefd5; font-family:arial,sans-serif; font-size:x-small; font-weight:bold \'>[/table]</span>';
            
        }

        // COUNT the captions
        aA.ccap=aA.ccap+cap.length;

        // DECORATE the captions
        // **** Cannot modify outerHTML of caption.
        for (var i=0;i<cap.length;i++) { // mark out captions

            var capBefore = messpan.cloneNode(true);
            capBefore.id="tablesAdded" + (aA.idi++);
            var capAfter = messpan.cloneNode(true);
            capAfter.id="tablesAdded" + (aA.idi++);
            
            //capBefore.style.fontWeight="bold";
            //capAfter.style.fontWeight="bold";

            capBefore.appendChild(document.createTextNode('[caption]'));
            capAfter.appendChild(document.createTextNode('[/caption]'));

            // insertBefore the first item in the caption
            if (cap[i].childNodes.length>0) {
                cap[i].insertBefore(capBefore,cap[i].childNodes[0]);
            } else {
                cap[i].appendChild(capBefore);
            }

            // append to the list of items in the caption
            cap[i].appendChild(capAfter); 

            void(cap[i].style.border='2px dashed #000000');

        }

        // COUNT the table headers
        aA.cth=aA.cth+s.length;

        // DECORATE the table headers. COUNT attributes.
        
        for (var i=0;i<s.length;i++) {
            str='';  

            //TH's scope, id, headers, axis
            if ((jt_ie7 && s[i].attributes.scope.specified) || (!(jt_ie7) && s[i].hasAttribute('scope'))) {
                str=' scope=\"'+s[i].scope+'\"';
                aA.cother++;
            }
            if ((jt_ie7 && s[i].attributes.id.specified) || (!(jt_ie7) && s[i].hasAttribute('id'))) {
                str=str+' id=\"'+s[i].id+'\"';
                aA.cother++;
            }
            if ((jt_ie7 && s[i].attributes.headers.specified) || (!(jt_ie7) && s[i].hasAttribute('headers'))) {
                str=str+' headers=\"'+s[i].headers+'\"';
                aA.cother++;
            }
            if ((jt_ie7 && s[i].attributes.axis.specified) || (!(jt_ie7) && s[i].hasAttribute('axis'))) {
                str=str+' axis=\"'+s[i].axis+'\"';
                aA.cother++;
            }

            var THinfo = messpan.cloneNode(true);
            THinfo.id="tablesAdded" + (aA.idi++);

            THinfo.appendChild(document.createTextNode('[th'+str+']'));
            // put br just before th contents
            var thbr = myDocument.createElement('br');
            thbr.id="tablesAdded" + (aA.idi++);

            if (s[i].childNodes.length>0) {
                 s[i].insertBefore(thbr,s[i].childNodes[0]);
            } else {
                 s[i].appendChild(thbr);
            }
            // now we know it isn't empty!
            // put label just before first item in th (which is now br)
            s[i].insertBefore(THinfo,s[i].childNodes[0]);

            void(s[i].style.border='1px dotted #d2691e'); 

        }

        // DECORATE td cells. COUNT attributes.
        for (var i=0;i<u.length;i++) {
            str='';  
            //TD's scope, id, headers, axis 
            if ((jt_ie7 && u[i].attributes.scope.specified) || (!(jt_ie7) && u[i].hasAttribute('scope'))) {
                str=' scope=\"'+u[i].scope+'\"';
                aA.cother++;
            }
            if ((jt_ie7 && u[i].attributes.id.specified) || (!(jt_ie7) && u[i].hasAttribute('id'))) {
                str=str+' id=\"'+u[i].id+'\"';
                aA.cother++;
            }
            if ((jt_ie7 && u[i].attributes.headers.specified) || (!(jt_ie7) && u[i].hasAttribute('headers'))) {
                str=str+' headers=\"'+u[i].headers+'\"';
                aA.cother++;
            }
            if ((jt_ie7 && u[i].attributes.axis.specified) || (!(jt_ie7) && u[i].hasAttribute('axis'))) {
                str=str+' axis=\"'+u[i].axis+'\"';
                aA.cother++;
            }

            // only write to td cell if the cell has attributes
            //if (str!='') {
            var TDinfo = messpan.cloneNode(true);
            TDinfo.id="tablesAdded" + (aA.idi++);

            TDinfo.appendChild(document.createTextNode('[td'+str+']'));
            // put br just before th contents
            var tdbr = myDocument.createElement('br');
            tdbr.id="tablesAdded" + (aA.idi++);

            if (u[i].childNodes.length>0) {
                u[i].insertBefore(tdbr,u[i].childNodes[0]);
            } else {
                u[i].appendChild(tdbr);
            }
            // now we know it isn't empty!
            // put label just before first item in td (which is now br)
            u[i].insertBefore(TDinfo,u[i].childNodes[0]);
            void(u[i].style.border='1px dotted #d2691e');
            //}
        }
    }

    var oFrame = {src:myDocument.location, cta:cta};
    aA.frames.push(oFrame);
    //Return argument array
    return aA;
}

function provideMessage(aA) {


    var msg  = '';
    var noTblsFound = 'No table elements found';

    for (var i = 0; i < aA.frames.length; i++) {

        if (aA.frames[i].cta === 0) {
            if (aA.frames.length == 1) {
                msg +=  noTblsFound;
            } else {
                if (i>0 && msg !== '') { msg += '\n\n'; }
                msg +=  aA.frames[i].src + '\n' + noTblsFound;               
            }
        }
    }

    // standard  
    if (msg !== '') { alert(msg); }
}

startFrames(document);

//1-7-2011
//  Added Frame Traversal
//1-8-2011
//  How things are added to the page updated
//        to work on more browsers
//  Colors updated for contrast
//  Clear old added elements second time favelet runs
//  Dashed td outlines changed to dotted TD outlines 
