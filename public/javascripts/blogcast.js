jQuery(document).ready(function($) {
	
var blogcast = new (function() {
	
	var Post = Backbone.Model.extend({
		url: $("form").attr("action"),
		
		initialize: function() {
			this.syntax();
			this.wmd();
			this.linkbait();
		},
		
		syntax: function() {
			hljs.tabReplace = '    ';
			hljs.initHighlightingOnLoad();
		},
	
		wmd: function() {
			if($("#wmd-container textarea").length > 0) {
				//Instantiate auto grow on the wmd-container
				$("#wmd-container textarea").elastic();
				
				//Instantiate manual drag resizer on the wmd-container
				$("#wmd-container textarea").TextAreaResizer(); 
				
				//Turn on code highlight for post and draft previews
				$("#wmd-preview").live('click', function() {
					$("pre code").each(function(i, e) {hljs.highlightBlock(e, '    ')});
				});
			}
		},
		
		slug: function() {
			var title = $("#title-container input").val();

			$(".post h2 a").text(title);

			//1st: Removes all non alphanumeric characters from the string.
			//2nd: No more than one of the separator in a row.
			//3rd: Remove leading/trailing separator.
			var url = "/1234-" + title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "").toLowerCase();

			$("#title-container p").text(url);
		},
		
		linkbait: function() {
			var self = this;
			
			//Activate slug on these events
			$("#title-container").live("keyup paste focus", function() {
				self.slug();
			});
			
			//Actiavete slug when loading a Draft
			if($(".draft-title-container, .post-title-container").length > 0 && $(".draft-title-container input, .post-title-container input").val().length > 0) {
				self.slug();
			}
		},
		
		isValid: function() {
			//Only submit valid Posts
			var title = $("#title-container input").val().trim();		
			var content = $("#wmd-container textarea").val().trim();
			
			if(title.length > 0 && content.length > 0) {
				return true;
			}
			else {
				return false;
			}
		},
		
		persist: function() {
			var url = window.document.URL;
			
			var opts = {
				lines: 12, // The number of lines to draw
			  	length: 43, // The length of each line
			  	width: 18, // The line thickness
			  	radius: 40, // The radius of the inner circle
			  	color: "#535353", // #rbg or #rrggbb
			  	speed: 1.1, // Rounds per second
			  	trail: 60, // Afterglow percentage
			  	shadow: false // Whether to render a shadow
			};

			var target = document.getElementById("spinner");
			var spinner = new Spinner(opts);
			
			//http://localhost:3000/posts/new
			if(url.indexOf("/posts/new") > -1) {
				//Create Draft
				$("form").append("<input type='hidden' name='save_draft' value='Update draft'/>");
				
				spinner.spin(target);
				
				$.post($("form").attr("action"), $("form").serialize(), function(){
					spinner.stop();
					
					//FadeIn to show save/update was a success (visual signal)
					$("textarea, input[name='post[title]'], input[name='draft[title]']").hide();
					$("textarea, input[name='post[title]'], input[name='draft[title]']").fadeIn();
					
					var drafts = $("form").attr("action").replace("posts", "drafts");
					
					console.log(drafts);
					
					window.location.href = drafts;
				}, "json");
			}
			
			//http://localhost:3000/drafts/81-hell-world/edit
			if(url.indexOf("/drafts/") > -1 && url.indexOf("/edit") > -1) {
				//Update Draft
				$("form").append("<input type='hidden' name='key_save_draft' value='Update draft'/>");
				
				spinner.spin(target);
				
				$.post($("form").attr("action"), $("form").serialize(), function(){
					spinner.stop();
					
					//FadeIn to show save/update was a success (visual signal)
					$("textarea, input[name='post[title]'], input[name='draft[title]']").hide();
					$("textarea, input[name='post[title]'], input[name='draft[title]']").fadeIn();
					
					$("input[name='key_save_draft']").remove();
				}, "json");
			}
			
			//http://localhost:3000/posts/95-short-post/edit	
			if(url.indexOf("/posts/") > -1 && url.indexOf("/edit") > -1) {
				//Update Post
				spinner.spin(target);
				
				$.post($("form").attr("action"), $("form").serialize(), function(){
					spinner.stop();
					
					//FadeIn to show save/update was a success (visual signal)
					$("textarea, input[name='post[title]'], input[name='draft[title]']").hide();
					$("textarea, input[name='post[title]'], input[name='draft[title]']").fadeIn();
					
					window.location.href = $("form").attr("action");
				}, "json");
			}
		}
	});
	
	var PostView = Backbone.View.extend({
		el: $("#blogcast"),
	
		initialize: function() {
			this.post = new Post();
			
			this.save();
	    },
	
		persist: function() {
			this.post.persist();
		},
		
		keySave: function() {
			var self = this;
			
			key("⌘+s, ctrl+s", function() {
				if(self.post.isValid() === true) {
					self.post.persist();
				}

				return false;
			});
		},
		
		autoSave: function() {
			var self = this;
			
			//Define AutoSave Timer (Call Post Object to Persist itself)
			window.setInterval(function() {
				if(self.post.isValid() === true) {
					self.post.persist();
				}
		  	}, 180000);
		},
	
		save: function() {
			var url = window.document.URL;
			
			if($("#wmd-container textarea").length > 0) {
				//Define Shortcuts
				this.keySave();
			
				//Turn off AutoSave when Editing Live Posts
				//http://localhost:3000/posts/95-short-post/edit	
				if(!(url.indexOf("/posts/") > -1 && url.indexOf("/edit") > -1)) {
					this.autoSave();
				}
			}
		}
	});
	
	this.postView = new PostView();
	
	var Comment = Backbone.Model.extend({
		initialize: function() {
		},
		
		isValid: function() {
			//Don't submit comment or preview comment when no comment is given			
			var content = $("#comment_content").val();
			
			if(content === "" || content.length === 0) {
				return false;
			}
			else {
				return true;
			}
		},
		
		preview: function(event) {
			//Grab URL
			var url = $(event.currentTarget).attr('href');
			
			//Grab Comment Components
			var comment = $("#new_comment").serialize();

			$.post(url, comment, null, "script");
		},
		
		update: function(event) {
			var url = $(event.currentTarget).attr("action");
			var id = $(event.currentTarget).data("id");
			
			$.post($(event.currentTarget).attr("action"), $(event.currentTarget).serialize(), function() {
				//Update the Editable Attributes (Name, Email, Content)
				var name = $("#edit_comment_canvas_" + id + " input[name='comment[name]']").val().trim();
				var website = $("#edit_comment_canvas_" + id + " input[name='comment[website]']").val().trim();
				var content = $("#edit_comment_canvas_" + id + " textarea[name='comment[content]']").val().trim();
				
				$("#comment_" + id + " .name a").text(name);
				
				//if website.length > 0 AND there is no href attr, then add href attr
				if(website.length > 0 && $("#comment_" + id + " .name a").length === 0) {
					//Add href attr
					$("#comment_" + id + " .name").html("<a rel='nofollow' href='"+ website +"'>" + name + "</a>");
				}
				else if(website.length === 0) {
					$("#comment_" + id + " .name").text(name);
				}
				else { //website.length > 0 && $("#comment_" + id + " .name a").length > 0)
					$("#comment_" + id + " .name a").attr("href", website);
				}
				
				$("#comment_" + id + " .comment-body").text(content);
				
				//Close the edit canvas
				$("#edit_comment_canvas_" + id).hide();
				
				//FadeIn to show save/update was a success (visual signal)
				$("#comment_" + id).hide().fadeIn(1500);
			}, "json");
		}
	});
	
	var CommentView = Backbone.View.extend({
		el: $("#blogcast"),
		
		events: {
			"click #comment_submit"				: "submit",
			"click #preview_comment_link"		: "preview",
			"click #comment_submit_preview"		: "submit",
			"click #edit_comment_link"			: "toggle",
			"click .edit_coment"				: "edit",
			"submit .edit_comment_canvas form"	: "update",
			"click .form-submit strong"			: "cancel"
	    },
	
		initialize: function() {
			this.comment = new Comment();
			
			$(".edit_comment_canvas").hide();
	    },
	
		submit: function(event) {
			if(this.comment.isValid() === false) {
				event.preventDefault();
				return false;
			}
		},
		
		preview: function(event) {
			if(this.comment.isValid() === true) {
				this.comment.preview(event);
			}
			
			event.preventDefault();
			return false;
		},
		
		toggle: function(event) {
			event.preventDefault();
			$("#comment_preview_canvas").hide();
			$("#new_comment_canvas").show();
		},
		
		edit: function(event) {
			var id = $(event.currentTarget).data("id");
			
			//Show Edit Comment Canvas
			$("#comment_" + id).hide();
			$("#edit_comment_canvas_" + id).show();
		},
		
		update: function(event) {
			this.comment.update(event);
			
			event.preventDefault();
			return false;
		},
		
		cancel: function(event) {
			var id = $(event.currentTarget).data("id");
			$("#edit_comment_canvas_" + id).hide();
			$("#comment_" + id).show();
		}
	});
	
	this.commentView = new CommentView();
	
})();

//Add blogcast to the global namespace
window.blogcast = blogcast

});//document.ready