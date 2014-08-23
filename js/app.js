  /* naming scheme
      bt for booktag
      B for backend
      F for frontend
      so btBfunction for backend function */

    /*  ====================
              BACKEND
        ====================
    */

    /* Save bookmark */

    function btBSaveBookmark(www,tags,comment,callback){

        db.insert({
            www: www,
            tags: tags,
            comment: comment
        },function(err, newDoc){
            if (err){ btError(1); }
            else {
                // ex.update gui
                if (callback) callback(newDoc);
            }
        });
    }


    /*  Remove Bookmark
        https://github.com/louischatriot/nedb#removing-documents */

    function btBRemoveBookmark(id,callback){

        //console.log(id);

        db.remove({
            _id: id
        },function(err, newDoc){
            if (err){ btError(1); }
            else {
              if (callback) callback(newDoc);
            }
        });
    }


    /*  Update Bookmark */

    function btBUpdateBookmark(id,data,callback){

        var tags = data.tags;
        var comment = data.comment;

          console.log(id);
          console.log(tags);
          console.log(comment);

      db.update({ _id:id }, { $set: { tags: tags, comment: comment }}, {}, function(err,results){

        if (err) { btError(1); }
        else {
          //console log('btBUpdate, affected records: " + results);
          if (callback) callback(results);
        }
      });
    }


    /*  Find bookmark */
    /*
    function btBFindBookmark(criteria,callback){

        // assume all if no query specified
        if (!criteria) criteria={}

        db.find(criteria,function(err,newDoc){
          if (err) { btError(1); }
          else {
            if (callback) callback(newDoc);
          }
        });
    }
    */

    /*  Find tag */
    /*
    function btBFindTag(criteria,callback){

        // assume all if no query specified
        if (!criteria) criteria={}

        db.find(criteria,function(err,newDoc){
          if (err) { btError(1); }
          else {
            if (callback) callback(newDoc);
          }
        });
    }
    */

   /*  Free search, simply a wrapper for db find */

   function btBFind(criteria,callback){

        // assume all if no query specified
        if (!criteria) criteria={}

        db.find(criteria,function(err,newDoc){
          if (err) { btError(1); }
          else {

            if (callback) callback(newDoc);
          }
        });
   }


  function btBFindFilterTagDistinct(results,callback){

      // find unique tags
      // a "filter" for btBFind results
      // given a set of bookmarks, it filters out unique tags
      // and returns them as array

      var bookmarks = results;    //set of record to filter
      var resultsDistinct = [];   //final array of unique tags

          $.each(bookmarks,function(i,v){ // for each bookmark, {"www":"http://getbootstrap.com/components/","tags":"dev,ux,libs","_id":"PQgoJJqZFyp1FLUC"}

            if (bookmarks[i].hasOwnProperty('tags')){ //check if tags exist, maybe you add a bookmark without tags

              var tags = bookmarks[i].tags.split(","); //get tag/tags from current bookmark, "tags":"dev,ux,libs"

              $.each(tags,function(j,t){

                var match = false;          // for each tag, start with match=false and compare againsta already stored tags

                $.each(resultsDistinct,function(k,x){

                 if (tags[j] == resultsDistinct[k]) { match = true; }

                });

                if (match == false) {resultsDistinct.push(tags[j]);} // if no match has been found, add the tag to unique tags list

                })
            }
          });

        if (callback) callback(resultsDistinct);

        //console.log("resultsDistinct");
        //console.log(resultsDistinct);
    }

    // --------------- DELETE ?? --------------

    /* Retrieve tags associated with bookmark */

    function btBFindTagsOfBookmark(id,callback){

      //returns an array of bookmark

      db.find({_id: id},function(err,newDoc){
          if (err) { btError(1); }
          else {

            //return only tags [array]
            if (callback) callback(newDoc.tags);
          }
        });

    }
    // --------------- DELETE ?? --------------

    /* btNotify - TODO */
    function btFNotify(code){
        // 1 - insert ok
        alert("insert ok");
    }

    /* btError - TODO */
    function btFError(code){
        // 1 - insert error

        alert("insert ok");
    }


    /*  ====================
             FRONTEND
        ==================== */


    /* Update bookmarks list */

    function btFUpdateBookmarksList(bookmarks){
        //FIXME: for a start, we trash and load everything back

        //console.log(bookmarks);

        // Trash old html list
        $('#bookmarks_list>ul').empty();

        // Create a new li for each bookmark
        var list = $("#bookmarks_list>ul");

        $.each(bookmarks,function(i,v){
          var li = $("<li/>")
            .attr('id',bookmarks[i]["_id"])
            .appendTo(list);

            // Details icon
            $("<span/>")
              .addClass("icons glyphicon glyphicon-chevron-right")
              .click(bookmarks[i]["_id"],btFBookmarkDetail)
              .appendTo(li);

            // Bookmark link
            $("<a></a>")
              .attr('href', bookmarks[i]["www"])
              .text(bookmarks[i]["www"])
              .click(function(event){
                  event.preventDefault();
                  btFOpenBookmark(bookmarks[i]["www"]);
                })
              .appendTo(li);
        });
    }


    /* Provide a panel to show/edit bookmarks details */

    function btFBookmarkDetail(id){

      // Create a sliding panel with details

      //check if another one exists and remove it
      $('#bookmark_details').remove();

      //id is not directly the number, jquery sends an event object,
      //you can retrieve id like obj.data
      var id = id.data;

      //console.log(id.data);


      /* we need to retrieve data before we can create additional
         element and populate them.
         I won't call db directly from here
         the creation of gui is wrapped in the db function callback */

      btBFind({_id : id},function(bookmark){

        //console.log("btFBookmarkDetail");
        //console.log(bookmark);

        if (!bookmark){ btFError('1');}

        //attach panel to:
        var caller = $('#'+id);

        // Detail panel
        var details = $('<div><div/>')
          .attr("id","bookmark_details")
          .attr("class","bookmark_details")
          .attr("style","display:none") // slideToggle
          .appendTo(caller);

        // Tags
        $('<div></div>').append(
          $("<span/>")
            .addClass("icons glyphicon glyphicon-tags"),
          $("<span></span>")
            .attr("id","tags")
            .text(bookmark[0].tags) //[0], we always have 1 element as max 1 id matches
        ).appendTo(details);

        // Comment
        $('<div></div>').append(
          $("<span/>")
            .addClass("icons glyphicon glyphicon-pencil")
          .click(),
          $("<span></span>")
            .attr("id","comment")
            .text(bookmark[0].comment)
         ).appendTo(details);

        // Edit button
        $("<span/>")
          .addClass("icons operations glyphicon glyphicon-edit")
          .attr("id","edit")
          .text(' edit')
          .click(id,btFEditBookmark)
          .appendTo(details);

        // Remove button
        /*$("<span/>")
          .addClass("icons operations glyphicon glyphicon-remove")
          .text('remove')
          .click(id,btFRemoveBookmark)
          .appendTo(details);*/

        // Slide
        details.slideToggle();

      }); //end of db find callback
    }


    function btFRemoveBookmark(id){
      var id = id.data; //jquery click event

      btBRemoveBookmark(id,function(){
        btFRefreshBookmarksList();
        btFRefreshTagsList();
        });
    }


    /* Edit bookmark detail */

    function btFEditBookmark(id){

      var id = id.data //jquery event

      var detailPanel = $('#'+id+'>#bookmark_details'); //detail panel of given id

      // Save details state, to be used if user cancel editing #save_state
      var detailPanelSavedState = detailPanel.html();

      // Change field into editable ones
      var detailPanelTags = detailPanel.find('#tags');
      detailPanelTags.replaceWith('<input id="tags" value="' + detailPanelTags.text() + '"/>');
        // detailPanelTags is now an input, update its reference
        detailPanelTags = detailPanel.find('#tags');


      var detailPanelComment = detailPanel.find('#comment');
      detailPanelComment.replaceWith('<input id="comment" value="' + detailPanelComment.text() + '"/>');
        // detailPanelComment is now an input, update its reference
        detailPanelComment = detailPanel.find('#comment');

      // Replace edit button with operations panel

      var detailPanelEdit = detailPanel.find('#edit');
      detailPanelEdit.hide();

      var operationsPanel = $('<div></div').addClass('operations').fadeToggle().appendTo(detailPanel);

      // Edit: Save
      $('<span />')
      .addClass("icons save glyphicon glyphicon-floppy-saved")
      .text(' save')
      .click({id: id},
             function(event){
               //console.log(event);

               var id = event.data.id;
               var data = {};
                 data.tags = detailPanelTags.val()
                 data.comment = detailPanelComment.val()
                 //console.log(data);

               btBUpdateBookmark(id,data,function(){
                 // Refresh all
                 btFRefreshBookmarksList();
                 btFRefreshTagsList();
               })
      })
      .appendTo(operationsPanel);

      // Edit: Cancel
      $('<span />')
      .addClass("icons cancel glyphicon glyphicon-floppy-remove")
      .text(' cancel')
      .click({"id":id,
              "detailPanel":detailPanel,
              "detailPanelSavedState":detailPanelSavedState},
             function(event){
                 //console.log(event);

                 var id = event.data.id;
                 var detailPanel = event.data.detailPanel;
                 var detailPanelSavedState = event.data.detailPanelSavedState;
                   //console.log(detailPanel);
                   //console.log(detailPanelSavedState);

                 // Restore saved html state #save_state
                 detailPanel.html(detailPanelSavedState);

                 // Restore Edit button
                 detailPanel.find('span#edit').click(id,btFEditBookmark);
      })
      .appendTo(operationsPanel);

      // Edit: Remove
      $("<span/>")
      .addClass("icons remove glyphicon glyphicon-remove ")
      .text(' remove')
      .click(id,btFRemoveBookmark)
      .appendTo(operationsPanel);

    }


    /* Update tags list */

    function btFUpdateTagsList(tags){
     //FIXME: for a start, we trash and load everything back

        //console.log(tags);

        // Trash old html list
        $('#tags_list>ul').empty();

        // Create a new li for each tags
        var list = $("#tags_list>ul");

        $.each(tags,function(i,v){
          var li = $("<li/>")
            .click(tags[i],btFFilterBookmarkByTag)
            .appendTo(list);

            // Details icon
            $("<span/>")
              .addClass("icons glyphicon glyphicon-tag")
              .appendTo(li);

            // Tag
            $("<span></span>")
              .text(tags[i])
              .appendTo(li);
        });
    }


    /* Search with freetext for bookmark/tags/comments */

    function btFOmnisearch(query){

      var dbquery;

      if (query.indexOf('tags:') != -1) {

        //user is searching for specific tag/s
       // dbquery = { new RegExp(query)}

      } else {

        // performing free text search
        dbquery = { $or : [{www: new RegExp(query)},
                           {tags: new RegExp(query)},
                           {comment: new RegExp(query)}]}

      }


      btBFind( dbquery,
              function(results){
                btBFindFilterTagDistinct(results,btFUpdateTagsList);
                btFUpdateBookmarksList(results);
              }
      );
    }


    /* Convenience methods to say: reload all bookmarks/tags */

    function btFRefreshBookmarksList(){

      //call backend with no arguments to retrieve all bookamarks
      //and pass it the update function as callback

      //btBFindBookmark({}, btFUpdateBookmarksList);
      btBFind({}, btFUpdateBookmarksList);

    }

    function btFRefreshTagsList(){

      //call backend with no arguments to retrieve all tags
      //and pass it the update function as callback

      /* why btBFindFilterTagDistinct?

        the two list (taglist/bookmarklist) operate with different data
        as a starting point. tagslist wants an array, bookmarklist wants
        objects as returned by db find.
        btBFindFilterTagDistinct is a function which filter db result to
        provide an array for taglist to work with */

      btBFind({}, function(results){
        btBFindFilterTagDistinct(results, btFUpdateTagsList);
      });

    }


   /* Filter By tag */

    function btFFilterBookmarkByTag(tag){

      //event is from jquery click, acess data like event.data
      var tag = tag.data;
      //console.log(tag);

      //pass a one element array to btFUpdateTagsList
      btFUpdateTagsList([tag]);

      //use given tag as a parameter for query && update bookmark list
      btBFind({tags: new RegExp(tag)}, btFUpdateBookmarksList);

    };


    /* Open a bookmark in default browser */
    // https://groups.google.com/forum/#!topic/node-webkit/LIcbwBrF_CI

    function btFOpenBookmark(url){

      require('nw.gui').Shell.openExternal(url);
    }


   /* ====================
              GUI
      ==================== */

$(document).ready(function(){


   /* Insert Bookmark */

    $('#add_bookmark_panel input[type="submit"]').click(function(){

      btBSaveBookmark(
            $('input[name="www"]').val(),
            $('input[name="tags"]').val(),
            $('input[name="comment"]').val(),
            btFRefreshBookmarksList //after insertion use the convenience method to update results
        );
    });


    /* Omnisearch  */

    $('#omnisearch input').keyup(function(){

      btFOmnisearch($(this).val());

    });


    /* Tags filter reset */

    $('#tags_reset').click(function(){

        btFRefreshBookmarksList();
        btFRefreshTagsList();

    });
});

    /* ====================
             STARTUP
       ==================== */


    /*  Setup db */

    var Nedb = require("nedb");
    var db = new Nedb({
        filename: 'data/booktag.db',
        autoload: true
    });


    var gui = require('nw.gui');

    
    /*  Script / App Mode 
     *  With command line arguments => script mode, 
     *  otherwise => app mode */

    // Get arguments from command line
    var argv = gui.App.argv;
        //console.log(argv);

    if (argv && argv.length != 0){

        /*  Script mode: insert bookmark via cli
            ------------------------------------
            argument is bookmark -> do insert -> quit */
        
        // Insert & quit
        btBSaveBookmark(argv[0],argv[1],argv[2],gui.App.quit);

    } else {


        /*  App mode: gui
            -------------------
            bookmark management */
    
        // Load all bookmarks at startup
        btFRefreshBookmarksList();
    
        // Populate tag list
        btFRefreshTagsList();
    
    
        // Show main window
    	var win = gui.Window.get();
        win.show();
    }

