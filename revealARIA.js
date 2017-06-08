
function start(myDocument){

  //Instead of window. for global
  //we use aA. so that we don't have
  //variables that might get mixed in 
  //with site-level js

  var aA=new Array();
       
  // counting
  aA.foundCount = 0;

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
  //open results page
  //resultsPage(myDocument, aA);
}


function checkFrames(myDocument,aA){

    //run revealAria check for current document which might 
    //have frames or aria or both

    aA = revealAria(myDocument,aA);

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
                 aA.framemsg=aA.framemsg + '\n' + myframes[y].src;
                 aA.fi=aA.fi + 1;
            }
        }
    }
    return aA;
}

function provideMessage(aA) {

    if(aA.foundCount!=1){var pl="s",pl1="are indicated by",pl2="were"}else{var pl="",pl1="is indicated by an",pl2="was"};
    
    if(aA.foundCount==0) {
         alertmessage = "No ARIA attributes were found."
    } else {
         alertmessage = aA.foundCount + " element" + pl + " with ARIA " +  pl2 + " found.";
    }

   alert(alertmessage);

}

function inArray(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
    return false;
}

function resultsPage(myDocument, aA) {

    try {

        var lw = window.open('','lw');

        if (lw != null) {

            if (lw.opener == null) {
                lw.opener = window;
            }

            // IE has no interface for DOM additions to pages
            // that were created using DOM, but we still use 
            // DOM for most things and convert back to a string
            // here using innerHTML
            lw.document.open();
            lw.document.write("<html><head><title>Aria Results</title>");
            lw.document.write('<link rel="Stylesheet" href="scripts/css/generic.css" type="text/css"></head>');
            //lw.document.write('<link rel="Stylesheet" http://section508testing.org/tools/beta/favelets/css/generic.css" type="text/css"></head>');
            lw.document.write('<body><a href="javascript:window.close();">[close window]</a>');
            lw.document.write("<h1>Aria information for \'" + myDocument.title + "\'</h1><hr/>");

            //put page specific code here

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

function revealAria(mydocument,aA){

     //create object just to check length of the properties array
     var jt_generic_obj = mydocument.createElement("var");
     var ie7 = false;
     if (jt_generic_obj.attributes.length > 0) {
         ie7 = true;
     }

     //changes as we add things
     if (mydocument.all) {
         // ie
         var eLive = mydocument.all;
         // .attributes does not work til 2
     } else {
         var eLive = mydocument.getElementsByTagName("*");
     }

     //static (e won't change - don't use eLive while editing page)
     var e = new Array();
     for (var i=0; i<eLive.length;i++) {
         e[i] = eLive[i];
     }

     for (var i = 0; i < e.length; i++) {
     // EACH OBJECT

        //remove anything added last time favelet ran
        var myExpress1 = /ariastAdded.*/;
        if (((ie7 && e[i].attributes && e[i].attributes.id.specified) || (!(ie7) && e[i].hasAttribute('id'))) && myExpress1.test(e[i].getAttribute('id'))) {
            e[i].parentNode.removeChild(e[i]);
            continue;
        }

        //original favelet code from revealARIA
        var myText = "";

        // Check for role
        // ie7 cannot do this
        if  ((!(ie7) && e[i].hasAttribute('role'))) {
            myRole=e[i].getAttribute('role');
            myText = 'role="' + myRole + '" ';
        }

        //Check for aria- attributes
        if (e[i].attributes) {
            for (var x = 0; x < e[i].attributes.length; x++) {
                var myA = e[i].attributes[x].nodeName.toLowerCase();
                //alert(myA + " is " + e[i].getAttribute(myA));
                var myExpress = /aria.*/;
                // ie7 if below is only needed when
                // ie8 immitates ie7 - as then the aria attributes are in 
                // the ie7-style list of empty attributes
                if ((!ie7 || (ie7 && e[i].attributes[x].specified)) && 
                    ((myExpress.test(myA) && e[i].getAttribute(myA)!=null) || 
                    (myA=="tabindex" && e[i].getAttribute(myA)=="-1") || (myA=="role" && e[i].getAttribute(myA)!=null))) {
                    
                    myText = myA + '="' + e[i].getAttribute(myA) + '"'; 
                    
                    //check for items with ids
                    var value_is_id_attributes = new Array('aria-controls','aria-describedby','aria-flowto','aria-labelledby','aria-labeledby','aria-owns','aria-activedescendant');
                    // all can have a list of ids, except aria-activedescendant

                    if (inArray(value_is_id_attributes,myA)) {
                  
                      //report on the attribute

                      //get array of ids
                      var id_array = e[i].getAttribute(myA).split(" ");
  
                      for (var mapi=0;mapi<id_array.length;mapi++) {
                          //var myAid=e[i].getAttribute(myA);
                          var myAid=id_array[mapi];

                          //alert(mydocument.getElementById(myAid)); 
                          if (mydocument.getElementById(myAid) != undefined && mydocument.getElementById(myAid) != null) {
                              //get object
                              var myIdTarget=mydocument.getElementById(myAid);
                              //myIdTarget.style.padding = "2px";
                              myIdTarget.style.border="2px dotted navy";
                              myIdTarget.style.backgroundColor="#ffffff";

                              //myTextNode2 = mydocument.createTextNode('<'+myIdTarget.tagName.toLowerCase()+' id="'+myAid+'">');
                              myTextNode2 = mydocument.createTextNode('id="'+myAid+'"');

                              //create message
                              var mySpan2 = mydocument.createElement('span');
                              mySpan2.setAttribute("id", ("ariastAddedid" + i));

                              //style message
                              mySpan2.style.color='navy';
                              mySpan2.style.fontSize="small";
                              mySpan2.style.fontWeight="bold";
                              mySpan2.style.backgroundColor="#ffff33";
                              mySpan2.style.border="1px solid #000000";
                              mySpan2.style.padding="2px";
                              mySpan2.style.marginRight="3px";

                              //append attribute info
                              mySpan2.appendChild(myTextNode2);

                              //place message for id's object
                              var firstthing = myIdTarget.childNodes[0];
                              if (firstthing == undefined) {firstthing = null};
                              myIdTarget.insertBefore(mySpan2,firstthing);
                              
                          } else {

                              if (myText == "") {
                                myText  = ' [NO ID MATCH] ';
                              } else {
                                myText += ' [NO ID MATCH] ';
                              }
                              
                          }
                      }
                  }
                }
            }
        }
          
        //Results per element
        if (myText != "") {
        
          aA.foundCount++;
          
          //outline html element 
          if (e[i].tagName == 'FORM') {
            e[i].style.border="2px dotted navy";
            e[i].style.padding="5px";
          } else {
            e[i].style.border="1px solid #000000";
            e[i].style.padding="2px";
          }
          
          //create message
          var mySpan = document.createElement('span');
          mySpan.setAttribute("id", ("ariastAdded" + i));
          myTextNode = document.createTextNode(myText);
          mySpan.appendChild(myTextNode);

          //style message
          mySpan.style.color="navy";
          mySpan.style.fontSize="small";
          mySpan.style.fontWeight="bold";
          mySpan.style.backgroundColor="#f5deb3";
          mySpan.style.border="1px solid #000000";
          mySpan.style.padding="2px";
          mySpan.style.marginRight="3px";

          // place message just before element it is about
          e[i].parentNode.insertBefore(mySpan,e[i]);

        }
          
     }
    // close going through each object

    //Return argument array
    return aA;
}


start(document);

//Feb 21, 2013
//the main code from the quick and dirty favelet that used
//to be revealARIA.js has been copied into the framework of
//the Landmarks favelet, so it can go through frames & reuse other features 
//Marks targets of every WAI-ARIA id reference, even when they are in lists
