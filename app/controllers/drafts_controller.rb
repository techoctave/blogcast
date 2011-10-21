class DraftsController < ApplicationController
  before_filter :require_user
  
  # GET /drafts
  def index
     @drafts = Draft.all(:select => "title, id", :order => "created_at DESC")
  end
  
  def show
  end
  
  def new
  end
  
  # GET /drafts/1/edit
  def edit
    @draft = Draft.find(params[:id])
  end
  
  # PUT /drafts/1
  def update
    @draft = Draft.find(params[:id])

    #Save both HTML and Markdown
    @draft.title = params[:draft][:title]
    @draft.markdown = params[:draft][:markdown]
    @draft.content = BlueCloth.new(@draft.markdown).to_html
    
    if params[:save_draft] || params[:key_save_draft]
      if @draft.save
        #render :action => "edit", :notice => "Draft was successfully updated."
        
        respond_to do |format|
          format.html { render :action => "edit", :notice => "Draft was successfully updated." }
          format.json { render :json => @draft }
        end
      else
        #render :action => "edit", :notice => "Draft was not updated."
        respond_to do |format|
          format.html { render :action => "edit", :notice => "Draft was not updated." }
          format.json { render :json => "{ status: 'Draft was not updated.' }" }
        end
      end
    end
    
    if params[:save_post]
      @post = Post.new
      
      @post.title = @draft.title
      @post.markdown = @draft.markdown
      @post.content = @draft.content
      @post.author = @draft.author
      @post.commentable = true
      @post.posted_at = Time.now
      
      if @post.save
        @draft.destroy
        
        respond_to do |format|
          format.html { redirect_to(@post, :notice => 'Post was successfully created.') }
          format.json { render :json => @post }
        end
        
      else
        respond_to do |format|
          format.html { render :action => "edit", :notice => "Post was not created." }
          format.json { render :json => "{ status: 'Post was not created.' }" }
        end
      end
    end
  end
  
  # DELETE /drafts/1
  def destroy
    @draft = Draft.find(params[:id])
    @draft.destroy

    redirect_to(drafts_url)
  end
end
