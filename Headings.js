// Based on code originally Developed By Steve Faulkner 2003/2004

function start(myDocument){ 

    //Instead of window. for global
    //we use aA. so that we don't have
    //variables that might get mixed in 
    //with site-level js
    var aA=new Array();

    // keep track of alt tags for each frame
    aA.frames = new Array();
     
    //for counting non-empty headings, empty 
    //headings, and each level of headingz
    aA.count=new Array(0,0,0,0,0,0,0,0,0,0,0,0);

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

function provideMessage(aA) {
  
    var msg  = '';
    var noHeadingsFound = 'No Heading Elements Found';

    for (var i = 0; i < aA.frames.length; i++) {

      if (aA.frames[i].z == 0) {
        if (aA.frames.length == 1) {
          msg += noHeadingsFound;
          break;
        } else {
          if (i>0 && msg != '') { msg += '\n\n' }
           msg +=  aA.frames[i].src + '\n' + 'No heading elements found';
        }
      }
      
    };

    // standard  
    if (msg != '') { alert(msg); }

}

function heading(mydocument,aA){

  var z = 0;
  var zz = 0;
  var hgroups = 0;

  // Create span element template
  var newSpan = mydocument.createElement('span');
  newSpan.style.color="navy";
  newSpan.style.fontSize="small";
  newSpan.style.fontWeight="bold";
  newSpan.style.backgroundColor="#FFFF00";

  // remove anything added last time favelet ran
  // jkg

  //create object just to check length of the properties array
  var jt_generic_obj = mydocument.createElement("var");
  var ie7 = false;
  if (jt_generic_obj.attributes.length > 0) {
      ie7 = true;
  }

  var myExpress1 = /hstAdded.*/;
  var spanLive=mydocument.getElementsByTagName('span');

  //static (span won't change - don't use spanLive while editing page)
  var spans = new Array();
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
  var e = new Array();
  for (var i=0; i<eLive.length;i++) {
      e[i] = eLive[i];
  }

  for (var i = 0; i < e.length; i++) {
    // EACH OBJECT
    var aria_h="false";
    var aria_level="";

       if (e[i].tagName.toLowerCase()=="hgroup") {

         var h;
         h=e[i].innerHTML;

         // prevents marking of the headings inside this
         // e[i].innerHTML='<span id=\'hstAdded'+(aA.idi++)+ '\' style=\'color:navy;font:small bold;background-color:#f5deb3\'><strong style=\'color:navy;background-color:#f5deb3\'>&lt;'+e[i].tagName.toLowerCase()+'&gt;</strong></span>'+h+'<span id=\'hstAdded'+(aA.idi++)+ '\' style=\'color:navy;font:small bold;background-color:#f5deb3\'><strong style=\'color:navy;background-color:#f5deb3\'>&lt;/'+e[i].tagName.toLowerCase()+'&gt;</strong></span>';
        
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

      if (aria_h=="true") {

          var h, al;
          h=e[i].innerHTML;
          al="";

          //up specific heading level count 
          if (aria_level != '') {
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
            
          void(e[i].innerHTML='<span id=\'hstAdded'+(aA.idi++)+ '\' style=\'font-family: arial;color:navy;font:small bold;background-color:#FFFF00\'><strong style=\'color:navy;background-color:#FFFF00\'>&lt;'+e[i].tagName.toLowerCase()+' role="heading" '+al+'&gt;</strong></span>'+h+'<span id=\'hstAdded'+(aA.idi++)+ '\' style=\'font-family: arial;color:navy;font:small bold;background-color:#FFFF00\'><strong style=\'color:navy;background-color:#FFFF00\'>&lt;/'+e[i].tagName.toLowerCase()+'&gt;</strong></span>');
 
              if (h=='') {
                  zz=zz+1;
              } else {
                  z=z+1;
              }

          } 
          // close if ARIA heading

          if (trad_heading.test(e[i].tagName)) {

              var get_level = e[i].tagName.substr(1,1);
              //alert(get_level);

              if (aria_h!="true") {

                 var h;
                 h=e[i].innerHTML;

                 var aria_level_string="";
                 if (aria_level!="") {
                     aria_level_string=' aria-level="'+aria_level+'"';
                 }

                 void(e[i].innerHTML='<span id=\'hstAdded'+(aA.idi++)+ '\' style=\'font-family: arial;color:navy;font:small bold;background-color:#FFFF00\'><strong style=\'color:navy;background-color:#FFFF00\'>&lt;'+e[i].tagName.toLowerCase()+aria_level_string+'&gt;</strong></span>'+h+'<span id=\'hstAdded'+(aA.idi++)+ '\' style=\'font-family: arial;color:navy;font:small bold;background-color:#FFFF00\'><strong style=\'color:navy;background-color:#FFFF00\'>&lt;/'+e[i].tagName.toLowerCase()+'&gt;</strong></span>');

                 //only increase overall count if not counted before
                 if (h=='') {
                        zz=zz+1;
                 } else {
                        z=z+1;
                 }

                 // check to see if it doesn't have role="heading", but does
                 // have aria-level set and reset the level accordingly
                 if (aria_level!="") {
                     //note change only made AFTER we print the tags to the page
                     get_level=aria_level;

                 }
              }

              //only increase level count if not yet counted
                  //first condition covers regular heading tags
                  //first condition covers html heading tags with ARIA level change
                  //second condition covers html heading tags with ARIa role of heading, but without an ARIA level 
              if (aria_h!="true" || aria_level=="") {

                 aA.count[get_level-1]=aA.count[get_level-1]+1;

              }
           }
           // close if traditional heading

       }
       // close going through each object

    var oFrame = {src:mydocument.location, z:z, zz:zz, hgroups:hgroups};
    aA.frames.push(oFrame);
    //Return argument array
    return aA;
}


start(document);

//5-26-2010
//added reporting of number of empty h tags to fix "can't add" bug
//added colors to the strong tag as the color was not always honored in some sites
//added checkFrames() to test iframes and frames
//5-28-2010
//fixed bug reporting frames as empty headings
//added removal of tags from previous runs of the favelet
//made recursive for frames within frames within frames ...
//added error catching for frames from other domains
//6-4-2010
//got rid of global variables
//replaced with properties of custom object called aA
//which gets passed around by hand from function to function 
//7-20-2010
// made it so favelets don't erase eachothers stuff
//7-24-2010
// plural and singular in popup message
//1-2-2011
// made check for IE 7 specific to the document being looked at (when there are frames)
//3-18-2012
// added ARIA headings (if traditional headings ALSO have ARIA markup the favelet will ignore the ARIA)
//6-22-2012
// now checks for traditional headings while going through all objects for efficiency
// accounts for unlimited heading levels possible with ARIA
// show ARIA markup even when it is a traditional heading
// in full count of number of headings, does not count things doubly marked twice 
// if aria-level is set on an ordinary html heading tag, the ARIA is the level used for the count
// provides count of headings with no level specified
// reports html5 hgroup tags
