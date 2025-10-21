var tab={}; // tab object
var folder=null; // Tags bookmarks folder ID
var checklist=[]; // list of tags to match in search
chrome.tabs.query({lastFocusedWindow: true, active: true},tabDetails);
icons=['home','building','history','car','bike','train',
'plane','globe','weather','health','leaf','tree',
'energy','science','books','games','phone','computer',
'DIY','sport','fashion','shopping','food+drink','money',
'music','art','graphics','camera','film','tv'];
var selection=[];
var html; // populate with icons
var image;
for(var i=0;i<icons.length;i++) {
	console.log('add '+icons[i]);
	html='<img src="icons/'+icons[i]+'.png" alt="'+icons[i]+'" class="icon"/>';
	id('icons').innerHTML+=html;
}
var found=false; // check for Tags bookmarks
chrome.bookmarks.search({title:'Tags'},
(results)=>{
	for(const result of results){
		console.log(result);
		if(result.title==='Tags') {
			found=true;
			folder=result.id;
		}
	}
	if(found) console.log('Tags bookmarks folder exists - id: '+folder);
	else makeFolder();
});
id('icons').addEventListener('click',function(event) { // tap icon
	var x=event.x-5;
	var y=event.y;
	console.log('click at '+x+','+y);
	x=Math.floor(x/50);
	y=Math.floor(y/53);
	console.log('icon '+x+' on row '+y);
	var n=y*8+x;
	console.log('icon '+n);
	if((n<0)||(n>63)) {
		message('miss!');
		return;
	}
	var i=selection.indexOf(n);
	if(i<0) {
		selection.push(n);
		id('icons').childNodes[n].style.backgroundColor='white';
	}
	else {
		selection.splice(i,1);
		id('icons').childNodes[n].style.backgroundColor='#DDD';
	}
	console.log('selected: '+selection);
})
id('tag').addEventListener('click',function(){ // save tagged bookmark
	if(tab.title.length>30) tab.title=tab.title.substr(0,28)+'..';
	if(selection.length<1) return;
	for(var i=0;i<selection.length;i++) {
		console.log('select '+icons[selection[i]]);
		tab.title+='$'+icons[selection[i]];
	}
	console.log('title: '+tab.title+'\nurl: '+tab.url);
	addBookmark(folder,tab.title,tab.url);
	message('tagged');
	window.setTimeout(function(){window.close();},1500);
});
id('find').addEventListener('click',function() { // find bookmarks with matching tags
	checklist=[];
	for(var i=0;i<selection.length;i++) {
		console.log('add label $'+icons[selection[i]]);
		checklist.push(icons[selection[i]]);
	}
	console.log('get bookmarks in Tags folder - id: '+folder);
	chrome.bookmarks.getChildren(folder).then(listMatches);
});
id('close').addEventListener('click',function() { // close bookmarks list
	for(var i=0;i<icons.length;i++) id('icons').childNodes[i].style.backgroundColor='#DDD';
	id('listPage').style.display='none';
});
function makeFolder() { // create special bookmarks folder
	chrome.bookmarks.create({title: 'Tags'},
	()=>{console.log('bookmark folder added');}
);}
function addBookmark(id,title,url) { // save tagged bookmark
	chrome.bookmarks.create({parentId: id, title: title, url: url}),
	()=>{console.log('bookmark added');}
}
function tabDetails(tabs) {
	tab.title=tabs[0].title;
	tab.url=tabs[0].url;
	console.log('tab: '+tab.title+'; url: '+tab.url);
	// return tab;
}
function listMatches(bookmarks) {
	console.log(' bookmarks found: '+bookmarks);
	var page='';
	var url='';
	var match=false;
	var found=0;
	var listItem;
	var html='<b>tagged with...</b>';
	for(var i in selection) html+='<img src="icons/'+icons[selection[i]]+'.png" align="middle" >';
	id('listHeader').innerHTML=html;
	id('list').innerHTML='';
	for(i=0;i<bookmarks.length;i++) {
		page=bookmarks[i].title;
		url=bookmarks[i].url;
		match=true; // start off assuming this page is a match
		for(var j=0;j<checklist.length;j++) {
			if(page.indexOf('$'+checklist[j])<0) match=false; 
		}
		if(match) {
			console.log(page+' is a match');
			found++;
			listItem=document.createElement('li');
			listItem.index=i; // index in bookmarks
			html=page.substring(0,page.indexOf('$'));
			html+='<img src="close.png" class="deleteIcon">';
			html+='<br><small>'+url.substring(0,50)+'</small>';
			listItem.innerHTML=html;
			listItem.addEventListener('click',function(e) {
				var item=bookmarks[this.index];
				if(e.x>350) {
					chrome.bookmarks.remove(bookmarks[this.index].id);
					bookmarks.splice(this.index,1);
					id('listPage').style.display='none';
					window.close();
					return;
				}
				else {
	 				console.log('display page '+bookmarks[this.index].title+'; URL: '+bookmarks[this.index].url);
	 				chrome.tabs.create({url: bookmarks[this.index].url});
	 				window.close();
				}
			});
			id('list').appendChild(listItem);
		}
		else console.log(page+' does not match');
	}
	console.log(found+' matches');
	if(found<1) id('list').innerHTML+='NO MATCHES';
	id('listPage').style.display='block';
	checklist=[];
	selection=[];
	console.log('selection and checklist cleared');
}
function displayPage(index) {
	console.log('display page '+bookmarks[i].title+'; URL: '+bookmarks[i].url);
}
function deleteBookmark(bookmark) {
	console.log('delete '+bookmark.title);
	chrome.bookmarks.remove(bookmark.id);
	listMatches(bookmarks);
}
function message(text) {
	id('message').innerText=text;
	id('message').style.display='block';
	window.setTimeout(function(){id('message').style.display='none';},2000);
}
function id(el) {
	return document.getElementById(el);
}