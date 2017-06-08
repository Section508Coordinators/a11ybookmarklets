
function startFrames(){

    //Instead of window. for global
    //        we use aA. so that we don't have
    //        variables that might get mixed in
    //        with site-level js

    //aA holds all variable that are global
    //        throughout frames

    //STANDARD ACROSS FAVELETS
    var aA=[];

    //VAR SPECIFIC TO THIS FAVELET
         aA.f=0; //num frames 
         aA.ff=0; //num iframes 
         
         aA.ef=0; //num frames with errors
         aA.eff=0; //num iframes with errors

         aA.tiny=0; //num tiny frames
    //        to save html nodes for
    //        printing to results page

         aA.infoTree=document.createElement('div');


    //VAR STANDARD ACROSS FAVELETS
    //        for id of added spans
    //        so we can removed them
         aA.idi=0;

    //        for frames outside domain
    //        so we can report them
         aA.framemsg='';
         aA.fi=0;

    //STANDARD ACROSS FAVELETS & Recursive:
    //        checkFrames calls function that checks the page.
    //        Then, it calls itself for each doc in a frame
    //        It returns aA with all the aA.variables counted up
         aA = checkFramesFrames(document,aA,aA.infoTree);

   //STANDARD - reporting once done recursing through frames
         provideMessageFrames(aA);

   //OPEN PAGE OF RESULTS
         if (aA.f + aA.ff > 0) {
              resultsPage(aA);
         }
}


function checkFramesFrames(myDocument,aA,placeToAddTo){


    //function with all the specific detail, just to keep it separate
    //        it returns aA with new values after using it to count

    //run check for each frame's document if there
    //        are any frames


       //create object just to check length of the properties array
       var jt_generic_obj = myDocument.createElement("var");
       var jt_ie7 = false;
       if (jt_generic_obj.attributes.length > 0) {
           jt_ie7 = true;
       }


    var frametypes=new Array('frame','iframe'); 
    for (var g=0;g<frametypes.length;g++) {

        //for each tag
        var myframes=myDocument.getElementsByTagName(frametypes[g]);
        

        for (var h=0;h<myframes.length;h++) {
        
        //for each frame
             
          //count the frames


            var t = myframes[h];

            if (frametypes[g]=='frame') {
                 aA.f++;
            }
            if (frametypes[g]=='iframe') {
                 aA.ff++;

                 //outline frame & resize frame if needed

                 var toadd=0;
                 if (t.width<72) {
                      t.width=144;
                      toadd=1;
                      t.style.border='2px dotted red';
                 }
                 if (t.height<72) {
                      t.height=144;
                      toadd=1;
                      t.style.border='2px dotted red';
                 }
                 if (toadd===0) {
                      t.style.border='2px solid red';
                 }
                 aA.tiny=aA.tiny+toadd;
          }



          // each frame gets a ul for reporting 
          //    attached to document at first, but
          //    cloned for whichever doc is it used in
 
            var listAdd = document.createElement('ul');
            listAdd.style.margin="0px 0px 0px 5px";

          // create template li element that holds the error messages
            var error = document.createElement('li');
            error.style.color="red";
            error.style.fontFamily="arial,sans-serif";
            error.style.fontSize="12pt";
            error.style.fontWeight="bold";
            //error.style.backgroundColor="#f5deb3";

          // create template li element that holds the regular messages
            var info = document.createElement('li');
            info.style.color="navy";
            info.style.fontFamily="arial,sans-serif";
            info.style.fontSize="12pt";
            info.style.fontWeight="bold";
            //info.style.backgroundColor="#f5deb3";


           //get the frame info


                 //type of frame
                      var typeinfo = info.cloneNode(true);
                      listAdd.appendChild(typeinfo);
                      typeinfo.appendChild(document.createTextNode(frametypes[g]));


                 //title
                 if ((jt_ie7 && t.attributes.title.specified) || (!(jt_ie7) && t.hasAttribute('title'))) {
                      var titleinfo = info.cloneNode(true);
                      listAdd.appendChild(titleinfo);
                      titleinfo.appendChild(document.createTextNode('title="'+t.title+'"'));
                 } else {
                      var titleerror = error.cloneNode(true);
                      listAdd.appendChild(titleerror);
                      titleerror.appendChild(document.createTextNode("Error: no title attribute"));

                      if (frametypes[g]=='frame') {
                           aA.ef++;
                      }
                      if (frametypes[g]=='iframe') {
                           aA.eff++;
                      }
                 }


                 //name
                 if ((jt_ie7 && t.attributes.name.specified) || (!(jt_ie7) && t.hasAttribute('name'))) {
                      var nameinfo = info.cloneNode(true);
                      listAdd.appendChild(nameinfo);
                      nameinfo.appendChild(document.createTextNode('name="'+t.name+'"'));
                 } else {
                      var nameerror = info.cloneNode(true);
                      listAdd.appendChild(nameerror);
                      nameerror.appendChild(document.createTextNode("No name attribute"));
                 }

                 //src
                 if ((jt_ie7 && t.attributes.src.specified) || (!(jt_ie7) && t.hasAttribute('src'))) {
                      var srcinfo = info.cloneNode(true);
                      listAdd.appendChild(srcinfo);
                      srcinfo.appendChild(document.createTextNode('src="'));
                      var mySRClink = document.createElement('a');
                      mySRClink.setAttribute('href',t.src);
                      mySRClink.appendChild(document.createTextNode(t.src));
                      srcinfo.appendChild(mySRClink); 
                      srcinfo.appendChild(document.createTextNode('"'));
                      mySRClink.style.color="navy";
                 } else {
                      var srcerror = info.cloneNode(true);
                      listAdd.appendChild(srcerror);
                      srcerror.appendChild(document.createTextNode("No src attribute"));
                 }




            
          //prepare structure to add some info to each frame's document
          
            try {
                 var insideDocument = t.contentWindow.document;


                 //remove anything added last time this favelet ran

                    //create object just to check length of the properties array
                    //need to check this for insideDocument specifically as it may
                    //have a different doctype from containing document

                    var jt_generic_obja = insideDocument.createElement("var");
                    var jt_ie7a = false;
                    if (jt_generic_obja.attributes.length > 0) {
                         jt_ie7a = true;
                    }

                 var myExpress1 = /fstAdded.*/;
                 var divLive=insideDocument.getElementsByTagName('div');

                 //static (divs won't change - don't use divLive while editing page)
                 var divs = [];
                 for (var i=0; i<divLive.length;i++) {
                     divs[i] = divLive[i];
                 }

                 for (var s=0;s<divs.length;s++) {
                     if (((jt_ie7a && divs[s].attributes && divs[s].attributes.id.specified) || (!(jt_ie7a) && divs[s].hasAttribute('id'))) && myExpress1.test(divs[s].getAttribute('id'))) {
                         divs[s].parentNode.removeChild(divs[s]);
                     }
                 }


                 //create div with special id so we can remove it later

                 var pageAdd = insideDocument.createElement('div');
                 pageAdd.id="fstAdded" + (aA.idi++);
                 pageAdd.style.backgroundColor="#FFFF00";
                 pageAdd.style.opacity=".8";
                 pageAdd.style.filter="alpha(opacity=85)";
                 pageAdd.style.position="absolute";
                 pageAdd.style.left="0px";
                 pageAdd.style.top="0px";
                 pageAdd.style.zIndex="50";
                 //pageAdd.style.border="2px solid navy";
                 pageAdd.style.padding="3px";




                 //add ul
                 var listAddinner = listAdd.cloneNode(true);
                 listAddinner.style.margin="0px 0px 0px 0px";
                 listAddinner.style.padding="0px 0px 0px 14px";

                 pageAdd.appendChild(listAddinner);


                 //s+=tag+'-'+(i+1)+'</li>\r';


                 //make the div the first thing in the inside doc
                 if (insideDocument.body.childNodes.length>0) {
                      insideDocument.body.insertBefore(pageAdd,insideDocument.body.childNodes[0]);
                 } else {
                      insideDocument.body.appendChild(pageAdd);
                 }
                 


                 //recursion
                 var newPlace = listAdd.cloneNode(true);
                 checkFramesFrames(insideDocument,aA,newPlace);

            } catch(e) {

                 var cant_reach = error.cloneNode(true);
                 listAdd.appendChild(cant_reach);
                 cant_reach.appendChild(document.createTextNode("This frame's document couldn't be written to or checked for additional frames."));


                 var newPlace = listAdd.cloneNode(true);
                 //errors are stored in aA too
                 aA.framemsg=aA.framemsg + '\n' +  myframes[h].src + '\n\t' + e + '\n';
                 aA.fi=aA.fi + 1;
                 t.style.border='5px double red';
            }

            //SAVE INFO FOR RESULTS PAGE

            newPlace.style.margin="10px 0px 0px 27px";

            if (placeToAddTo.tagName == 'ul') {
     var myLI = document.createElement('li');
                 placeToAddTo.appendChild(myLI);
                 myLI.appendChild(newPlace);
            } else {
                 placeToAddTo.appendChild(newPlace);
            }

        }
    }
    return aA;
}




function resultsPage(aA) {

  // Heading Above Lists
  var myH = document.createElement("h1");
  myH.appendChild(document.createTextNode('This page has '+aA.f+' frames and '+aA.ff+' iframes:'));
  aA.infoTree.insertBefore(myH,aA.infoTree.childNodes[0]);


        try {

            var lw = window.open('','lw');
 
            if (lw!==null) {

                if (lw.opener === null) {
                    lw.opener = window;
                }

              // IE has no interface for DOM additions to pages
              // that were created using DOM, but we still use 
              // DOM for most things and convert back to a string
              // here using innerHTML

              lw.document.open();
              lw.document.write('<html><head><title>Report on Frame Accessibility</title></head><body>' + aA.infoTree.innerHTML  + '</body></html>');
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


function provideMessageFrames(aA) {

        var x_pl='s';
        var w_pl='s';
        var y_pl='s';

        if (aA.x==1){x_pl='';}
        if (aA.w==1){w_pl='';}
        if (aA.y==1){y_pl='';}

        if ((aA.f+aA.ff)===0) {
              var alertmessage = 'No frames or iframes';
        } else {
              var alertmessage = aA.ef + ' errors out of '+aA.f+' frames and '+aA.eff+' errors out of '+aA.ff+' iframes.\n\nCheck out list of frames that opens next.';


        }

        if(aA.tiny>0) {

            alertmessage = alertmessage + '\n\n' + aA.tiny + ' tiny iframes resized (shown with a dotted border)';
        }



        var fi_pl='s';
        if (aA.fi==1){fi_pl='';}


        if (aA.fi>0) {
            alertmessage=alertmessage + '\n\n' + aA.fi + ' frame'+fi_pl+' (shown with a double border) outside the domain could not be checked for additional frames: \n' + aA.framemsg;
        }


        alert(alertmessage);
}


startFrames();


//1-2-2011
// Completed first version of this as a stand alone favelet

//TO DO
//  note when frames are hidden with display:none; etc - possible enhancement for all favelets
